import { loadProject } from "./projects-source.js";
import { escapeHtml, formatBytes } from "./text.js";
import { renderDescription } from "./text.js";

const FORMAT_LABELS = {
    "4x5": "Post 4:5", "9x16": "Story / Reel 9:16", "1x1": "Square 1:1",
    "16x9": "YouTube 16:9", "a4": "Print A4", "other": "Original"
};
const FORMAT_ORDER = ["16x9", "4x5", "1x1", "9x16", "a4", "other"];

function showMissing(message) {
    const article = document.getElementById("project-article");
    if (!article) return;
    article.innerHTML = `
        <div class="empty-note">
            <h3>Project not found</h3>
            <p class="mb-0">${message} <a href="projects.html">Browse all projects</a>.</p>
        </div>`;
}

document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    let projectId = urlParams.get("projectId");

    if (!projectId) {
        showMissing("No project was specified in the link you followed.");
        return;
    }

    projectId = projectId.replaceAll("#", "");
    const project = await loadProject(projectId);

    if (!project) {
        showMissing("We could not find a project matching that link.");
        return;
    }

    document.title = `${project.title} | Lyshub Technologies`;

    const set = (id, value, prop = "textContent") => {
        const el = document.getElementById(id);
        if (el) el[prop] = value;
    };

    set("project-title", project.title);
    set("banner-title", project.title);
    set("project-tag", project.tag);
    /* The built-in list is trusted HTML; Firestore text is rendered from plain text, escaped. */
    set("project-description", project.descriptionIsHtml ? project.description : renderDescription(project.description), "innerHTML");
    set("project-date", project.date || "N/A");
    set("project-client", project.client || "N/A");
    set("project-location", project.location || "N/A");
    set("project-website", project.website || "N/A");

    const image = document.getElementById("project-image");
    if (image) {
        image.src = project.image;
        image.alt = `${project.title}`;
    }

    const projectLink = document.getElementById("project-link");
    if (projectLink) {
        const site = String(project.website || "").replace(/^https?:\/\//, "");
        projectLink.href = site ? `https://${site}` : "#";
    }

    document.querySelectorAll("#project-share [data-share]").forEach((btn) => {
        btn.setAttribute("data-url", window.location.href);
        btn.setAttribute("data-title", project.title);
    });

    renderMediaKit(project);
});

/* ---------- Media kit: flyers and videos, grouped by piece, one chip per size ---------- */

function renderMediaKit(project) {
    const wrap = document.getElementById("project-media");
    if (!wrap || !project.media.length) return;

    const groups = new Map();
    for (const m of project.media) {
        const key = m.title || (m.kind === "video" ? "Video" : "Image");
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(m);
    }

    wrap.innerHTML = `
        <div class="section-head" data-reveal>
            <span class="eyebrow">Media Kit</span>
            <h2>Flyers &amp; Videos</h2>
            <p>Every piece in the size each platform wants. Tap a size to preview it, then download.</p>
        </div>
        <div class="media-kit"></div>`;
    const grid = wrap.querySelector(".media-kit");

    for (const [title, items] of groups) {
        items.sort((a, b) => FORMAT_ORDER.indexOf(a.format) - FORMAT_ORDER.indexOf(b.format));
        grid.appendChild(mediaCard(project, title, items));
    }
    document.dispatchEvent(new CustomEvent("lyshub:rendered", { detail: { list: grid } }));
}

function mediaCard(project, title, items) {
    const card = document.createElement("article");
    card.className = "media-card";
    card.setAttribute("data-reveal", "");
    card.innerHTML = `
        <div class="media-stage"></div>
        <div class="media-body">
            <h3>${escapeHtml(title)}</h3>
            <div class="media-sizes" role="tablist" aria-label="Sizes of ${escapeHtml(title)}"></div>
            <p class="media-note"></p>
            <div class="media-actions"></div>
        </div>`;
    const sizes = card.querySelector(".media-sizes");
    items.forEach((m, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.textContent = FORMAT_LABELS[m.format] || FORMAT_LABELS.other;
        b.addEventListener("click", () => select(i));
        sizes.appendChild(b);
    });

    function select(i) {
        const m = items[i];
        sizes.querySelectorAll("button").forEach((b, j) => {
            b.classList.toggle("active", j === i);
            b.setAttribute("aria-selected", String(j === i));
        });
        card.querySelector(".media-note").textContent =
            `${m.width && m.height ? `${m.width}×${m.height} · ` : ""}${formatBytes(m.bytes)}`;
        showPreview(card, project, m);
    }
    select(0);
    return card;
}

function showPreview(card, project, m) {
    const stage = card.querySelector(".media-stage");
    const actions = card.querySelector(".media-actions");
    const ratio = m.width && m.height ? `${m.width} / ${m.height}` : "4 / 5";
    stage.style.setProperty("--ratio", ratio);
    stage.innerHTML = `
        ${m.thumb ? `<img src="${escapeHtml(m.thumb)}" alt="" aria-hidden="true">` : ""}
        <button type="button" class="media-open">
            ${m.kind === "video"
                ? `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><span>Play video</span>`
                : `<span>View full size</span>`}
        </button>`;
    actions.innerHTML = "";
    stage.querySelector(".media-open").addEventListener("click", () => openFull(card, project, m));
}

async function openFull(card, project, m) {
    const stage = card.querySelector(".media-stage");
    const actions = card.querySelector(".media-actions");
    const open = stage.querySelector(".media-open");
    open.disabled = true;
    open.innerHTML = `<span>Loading ${m.kind === "video" ? "video" : "image"}…</span>`;
    try {
        const { loadMedia } = await import("./projects-store.js");
        const url = URL.createObjectURL(await loadMedia(project.id, m));
        stage.innerHTML = m.kind === "video"
            ? `<video src="${url}" controls autoplay playsinline></video>`
            : `<img src="${url}" alt="${escapeHtml(m.title || project.title)}">`;
        actions.innerHTML = `<a class="btn btn-sm" href="${url}" download="${escapeHtml(m.name)}">Download</a>`;
    } catch (error) {
        console.error(error);
        open.disabled = false;
        open.innerHTML = `<span>Couldn't load it. Tap to try again.</span>`;
    }
}
