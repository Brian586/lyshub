/* Reading files in the browser: dimensions, small inline previews, a compressed cover. */
import { formatFor } from "../../assets/js/projects-store.js";

export const LIMITS = {
    imageBytes: 8 * 1024 * 1024,     /* larger images are refused */
    videoWarnBytes: 15 * 1024 * 1024, /* above this, suggest the -web export */
    videoBytes: 40 * 1024 * 1024      /* larger videos are refused: too many chunks to play */
};

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("That image couldn't be read."));
        img.src = src;
    });
}

function loadVideo(src) {
    return new Promise((resolve, reject) => {
        const v = document.createElement("video");
        v.muted = true;
        v.preload = "auto";
        v.playsInline = true;
        v.onloadeddata = () => resolve(v);
        v.onerror = () => reject(new Error("That video couldn't be read. MP4 (H.264) and WebM work in every browser."));
        v.src = src;
    });
}

function seek(video, t) {
    return new Promise((resolve) => {
        video.onseeked = () => resolve();
        video.currentTime = t;
    });
}

/* Draw a source onto a canvas at most `max` px on its long side, as WebP under `budget` bytes. */
function toDataUrl(source, w, h, max, budget) {
    let scale = Math.min(1, max / Math.max(w, h));
    let quality = 0.82;
    for (let i = 0; i < 8; i++) {
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(w * scale));
        c.height = Math.max(1, Math.round(h * scale));
        c.getContext("2d").drawImage(source, 0, 0, c.width, c.height);
        const url = c.toDataURL("image/webp", quality);
        if (url.length <= budget || i === 7) return url;
        if (quality > 0.5) quality -= 0.12;
        else scale *= 0.8;
    }
    return null;
}

/* Everything the editor needs to know about a picked file before uploading it. */
export async function probe(file) {
    const url = URL.createObjectURL(file);
    try {
        if (file.type.startsWith("image/")) {
            if (file.size > LIMITS.imageBytes) throw new Error(`${file.name} is over 8 MB. Export it smaller.`);
            const img = await loadImage(url);
            const w = img.naturalWidth, h = img.naturalHeight;
            return { kind: "image", width: w, height: h, format: formatFor(w, h), thumb: toDataUrl(img, w, h, 480, 40_000) };
        }
        if (file.type.startsWith("video/")) {
            if (file.size > LIMITS.videoBytes) {
                throw new Error(`${file.name} is over 40 MB. Upload the “-web” export instead (720p, about 1.5 Mbps).`);
            }
            const v = await loadVideo(url);
            await seek(v, Math.min(1.5, (v.duration || 3) / 3));
            const w = v.videoWidth, h = v.videoHeight;
            return {
                kind: "video", width: w, height: h, format: formatFor(w, h), duration: v.duration,
                thumb: toDataUrl(v, w, h, 480, 40_000),
                warning: file.size > LIMITS.videoWarnBytes
                    ? "Large video: visitors download all of it before it plays. The “-web” export loads faster." : ""
            };
        }
        throw new Error(`${file.name} isn't an image or a video.`);
    } finally {
        URL.revokeObjectURL(url);
    }
}

/* The cover sits inline in the project document, so it is kept to about 250 KB. */
export async function compressCover(fileOrBlob) {
    const url = URL.createObjectURL(fileOrBlob);
    try {
        const img = await loadImage(url);
        return {
            data: toDataUrl(img, img.naturalWidth, img.naturalHeight, 1480, 250_000),
            width: img.naturalWidth, height: img.naturalHeight
        };
    } finally {
        URL.revokeObjectURL(url);
    }
}

/* "kodi-app-flyer-9x16-1080x1920.png" in project "kodi" → "App flyer". */
export function guessTitle(fileName, projectId, kind) {
    let base = fileName.replace(/\.[a-z0-9]+$/i, "").toLowerCase();
    if (projectId && base.startsWith(`${projectId}-`)) base = base.slice(projectId.length + 1);
    const words = base.split(/[-_\s]+/).filter((w) =>
        w && !/^\d+x\d+$/.test(w) && !["a4", "print", "web", "final", "copy"].includes(w));
    let title = words.join(" ");
    title = title.charAt(0).toUpperCase() + title.slice(1);
    if (kind === "video" && title && !/video/i.test(title)) title += " video";
    return title || (kind === "video" ? "Video" : "Flyer");
}
