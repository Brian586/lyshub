/*
 * Projects in Firestore — the one module that talks to the database.
 *
 * The Firebase project has no Storage bucket, so every image and video lives inside Firestore
 * documents. A document is capped at 1 MiB, so a file is cut into chunks:
 *
 *   projects/{projectId}                    the project: text fields, a small inline cover,
 *                                           and `media` — a list describing each file
 *   projects/{projectId}/chunks/{mediaId}_{n}   { media, n, data: Bytes }  (≤ 900 KB each)
 *
 * Chunks are stored as Firestore Bytes rather than base64 strings: same documents, a third
 * smaller (base64 adds 33%), so a video needs fewer reads to play.
 */
import { db } from "./firebase.js";
import {
    Bytes, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc,
    updateDoc, where, writeBatch
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

export const CHUNK_BYTES = 900_000;
export const DOC_SOFT_LIMIT = 950_000;   /* keep a project document well under 1 MiB */

const projectsCol = () => collection(db, "projects");
const chunksCol = (projectId) => collection(db, "projects", projectId, "chunks");

/* ---------- Formats: the social sizes every piece is made in ---------- */
export const FORMATS = {
    "4x5": { label: "Instagram / Facebook post", ratio: "4:5" },
    "9x16": { label: "Story · Reel · TikTok · Shorts", ratio: "9:16" },
    "1x1": { label: "Square post", ratio: "1:1" },
    "16x9": { label: "YouTube · Website", ratio: "16:9" },
    "a4": { label: "Print flyer", ratio: "A4" },
    "other": { label: "Other", ratio: "" }
};

export function formatFor(width, height) {
    if (!width || !height) return "other";
    const r = width / height;
    const near = (x) => Math.abs(r - x) < 0.02;
    if (near(4 / 5)) return "4x5";
    if (near(9 / 16)) return "9x16";
    if (near(1)) return "1x1";
    if (near(16 / 9)) return "16x9";
    if (near(1 / Math.SQRT2) || near(1000 / 1400)) return "a4";
    return "other";
}

/* ---------- Reading ---------- */

/* Published projects for the public site, in display order. */
export async function listPublished() {
    const snap = await getDocs(query(projectsCol(), where("published", "==", true)));
    return sortProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

/* Every project, drafts too (admins only — the rules refuse anyone else). */
export async function listAll() {
    const snap = await getDocs(projectsCol());
    return sortProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export async function getProject(id) {
    const snap = await getDoc(doc(db, "projects", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

function sortProjects(list) {
    return list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999)
        || String(b.date || "").localeCompare(String(a.date || "")));
}

/* Reassemble a media file from its chunks; resolves to a Blob of the original file. */
export async function loadMedia(projectId, media) {
    const snap = await getDocs(query(chunksCol(projectId), where("media", "==", media.id)));
    const parts = snap.docs.map((d) => d.data()).sort((a, b) => a.n - b.n);
    if (parts.length !== media.chunks) {
        throw new Error(`Expected ${media.chunks} parts of ${media.name}, found ${parts.length}.`);
    }
    return new Blob(parts.map((p) => p.data.toUint8Array()), { type: media.mime });
}

/* ---------- Writing (admin) ---------- */

export function slugify(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFKD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
}

export function projectBytes(project) {
    return new Blob([JSON.stringify(project)]).size;
}

export async function saveProject(id, fields, { isNew = false, user } = {}) {
    const data = { ...fields, updatedAt: serverTimestamp(), updatedBy: user?.email || null };
    if (isNew) {
        const existing = await getDoc(doc(db, "projects", id));
        if (existing.exists()) throw new Error(`A project with the address "${id}" already exists.`);
        data.createdAt = serverTimestamp();
        data.media = data.media || [];
    }
    if (projectBytes(data) > DOC_SOFT_LIMIT) {
        throw new Error("This project is too large to save: use a smaller cover image or fewer media files.");
    }
    await setDoc(doc(db, "projects", id), data, { merge: true });
}

/*
 * Upload one file as chunks, then record it in the project's media list.
 * `meta` carries kind, label, format, width, height and a small inline `thumb`.
 */
export async function uploadMedia(projectId, file, meta, onProgress = () => { }) {
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const chunks = Math.max(1, Math.ceil(bytes.length / CHUNK_BYTES));

    for (let n = 0; n < chunks; n++) {
        const slice = bytes.subarray(n * CHUNK_BYTES, Math.min(bytes.length, (n + 1) * CHUNK_BYTES));
        await setDoc(doc(chunksCol(projectId), `${id}_${n}`), {
            media: id, n, data: Bytes.fromUint8Array(slice)
        });
        onProgress((n + 1) / chunks);
    }

    const entry = {
        id, name: file.name, mime: file.type || "application/octet-stream", bytes: bytes.length, chunks,
        kind: meta.kind, title: meta.title || "", format: meta.format || "other",
        width: meta.width || null, height: meta.height || null, thumb: meta.thumb || null,
        uploadedAt: new Date().toISOString()
    };

    const project = await getProject(projectId);
    const media = [...(project?.media || []), entry];
    if (projectBytes({ ...project, media }) > DOC_SOFT_LIMIT) {
        await deleteChunks(projectId, id);
        throw new Error("The project has no room for another file's preview. Remove a file first.");
    }
    await updateDoc(doc(db, "projects", projectId), { media, updatedAt: serverTimestamp() });
    return entry;
}

export async function updateMediaList(projectId, media) {
    await updateDoc(doc(db, "projects", projectId), { media, updatedAt: serverTimestamp() });
}

export async function deleteMedia(projectId, mediaId) {
    await deleteChunks(projectId, mediaId);
    const project = await getProject(projectId);
    await updateMediaList(projectId, (project?.media || []).filter((m) => m.id !== mediaId));
}

async function deleteChunks(projectId, mediaId) {
    const snap = await getDocs(query(chunksCol(projectId), where("media", "==", mediaId)));
    await deleteInBatches(snap.docs.map((d) => d.ref));
}

export async function deleteProject(projectId) {
    const snap = await getDocs(chunksCol(projectId));
    await deleteInBatches(snap.docs.map((d) => d.ref));
    await deleteDoc(doc(db, "projects", projectId));
}

async function deleteInBatches(refs) {
    /* A batch holds 500 writes; chunks are big, so keep batches small to stay under request limits. */
    for (let i = 0; i < refs.length; i += 20) {
        const batch = writeBatch(db);
        refs.slice(i, i + 20).forEach((ref) => batch.delete(ref));
        await batch.commit();
    }
}

export { escapeHtml, renderDescription, formatBytes } from "./text.js";
