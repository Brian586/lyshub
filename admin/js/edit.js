import { requireAdmin } from "./auth.js";
import { compressCover, guessTitle, probe } from "./media-tools.js";
import {
    deleteMedia, FORMATS, getProject, projectBytes, saveProject, slugify, updateMediaList, uploadMedia, DOC_SOFT_LIMIT
} from "../../assets/js/projects-store.js";
import { escapeHtml, formatBytes } from "../../assets/js/text.js";

const $ = (s) => document.querySelector(s);
const form = $("#project-form");
const params = new URLSearchParams(location.search);
let projectId = params.get("id");
let project = null;   /* what is saved in Firestore */
let cover = null;     /* {data, width, height}, saved with the next Save */
let user = null;

function status(message, ok) {
    const el = $("#save-status");
    el.textContent = message;
    el.className = `form-status show ${ok ? "ok" : "err"}`;
}

function todayLabel() {
    return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function fillForm(p) {
    for (const name of ["title", "tag", "client", "location", "website", "shortDescription", "description", "date"]) {
        form.elements[name].value = p[name] || "";
    }
    form.elements.order.value = p.order ?? "";
    form.elements.published.checked = !!p.published;
    form.elements.id.value = p.id;
    form.elements.id.disabled = true;
    $("#id-preview").textContent = p.id;
    $("#short-count").textContent = (p.shortDescription || "").length;
    if (p.cover?.data) showCover(p.cover);
}

function showCover(c) {
    const el = $("#cover-preview");
    el.style.backgroundImage = `url('${c.data}')`;
    el.classList.add("has-image");
    $("#cover-note").textContent = c.width ? `${c.width}×${c.height}, stored at ${formatBytes(Math.round(c.data.length * 0.75))}` : "";
}

function setMode() {
    const saved = !!project;
    $("#edit-heading").textContent = saved ? project.title || project.id : "New project";
    $("#edit-sub").textContent = saved
        ? "Changes to the details go live when you save. Flyers and videos upload straight away."
        : "Fill in the details and save. You can add flyers and videos once it's saved.";
    document.title = `${saved ? project.title : "New project"} | Lyshub Admin`;
    const live = $("#view-live");
    live.hidden = !(saved && project.published);
    if (saved) live.href = `../project-details.html?projectId=${encodeURIComponent(project.id)}`;
    const input = $("#media-input");
    input.disabled = !saved;
    $("#dropzone").setAttribute("aria-disabled", String(!saved));
    $("#drop-hint").textContent = saved
        ? "PNG, JPG or WebP flyers up to 8 MB · MP4 or WebM videos up to 40 MB"
        : "Save the project first.";
}

/* ---------- Details ---------- */

form.elements.title.addEventListener("input", () => {
    if (form.elements.id.disabled) return;
    if (!form.elements.id.dataset.touched) form.elements.id.value = slugify(form.elements.title.value);
    $("#id-preview").textContent = form.elements.id.value || "…";
});
form.elements.id.addEventListener("input", () => {
    form.elements.id.dataset.touched = "1";
    form.elements.id.value = slugify(form.elements.id.value);
    $("#id-preview").textContent = form.elements.id.value || "…";
});
form.elements.shortDescription.addEventListener("input", () => {
    $("#short-count").textContent = form.elements.shortDescription.value.length;
});

$("#cover-input").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    $("#cover-note").textContent = "Preparing…";
    try {
        cover = await compressCover(file);
        showCover(cover);
        $("#cover-note").textContent += " · not saved yet";
    } catch (err) {
        $("#cover-note").textContent = err.message;
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = form.elements.title.value.trim();
    const id = project ? project.id : slugify(form.elements.id.value || title);
    if (!title) {
        status("Give the project a title.");
        form.elements.title.focus();
        return;
    }
    if (!id) {
        status("Give the project a page address (letters, numbers and dashes).");
        return;
    }
    const fields = {
        title,
        tag: form.elements.tag.value.trim(),
        client: form.elements.client.value.trim(),
        location: form.elements.location.value.trim(),
        website: form.elements.website.value.trim().replace(/^https?:\/\//, ""),
        shortDescription: form.elements.shortDescription.value.trim(),
        description: form.elements.description.value.trim(),
        date: form.elements.date.value.trim() || todayLabel(),
        order: Number(form.elements.order.value) || 1,
        published: form.elements.published.checked
    };
    if (cover) fields.cover = cover;
    if (fields.published && !(cover || project?.cover)) {
        status("Add a cover image before publishing: the project card needs one.");
        return;
    }
    const btn = $("#save-btn");
    btn.disabled = true;
    btn.textContent = "Saving…";
    try {
        await saveProject(id, fields, { isNew: !project, user });
        project = await getProject(id);
        cover = null;
        if (!projectId) {
            projectId = id;
            history.replaceState(null, "", `edit.html?id=${encodeURIComponent(id)}`);
        }
        fillForm(project);
        setMode();
        status(project.published ? "Saved. It's live on the website." : "Saved as a draft.", true);
    } catch (err) {
        console.error(err);
        status(err.code === "permission-denied" ? "Firestore refused the save. Are the security rules deployed?" : err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "Save project";
    }
});

/* ---------- Media ---------- */

function formatOptions(selected) {
    return Object.entries(FORMATS)
        .map(([key, f]) => `<option value="${key}" ${key === selected ? "selected" : ""}>${f.ratio ? `${f.ratio} · ` : ""}${f.label}</option>`)
        .join("");
}

function mediaRow(m) {
    const el = document.createElement("div");
    el.className = "media-row";
    el.innerHTML = `
        <div class="mthumb ${m.kind === "video" ? "video" : ""}" style="background-image:url('${escapeHtml(m.thumb || "")}')"></div>
        <div>
            <input type="text" value="${escapeHtml(m.title)}" aria-label="Title of ${escapeHtml(m.name)}" maxlength="60">
            <p class="small">${escapeHtml(m.name)} · ${m.width ? `${m.width}×${m.height} · ` : ""}${formatBytes(m.bytes)} · ${m.chunks} part${m.chunks === 1 ? "" : "s"}</p>
        </div>
        <select class="mformat" aria-label="Size of ${escapeHtml(m.name)}">${formatOptions(m.format)}</select>
        <button class="icon-btn" type="button" aria-label="Remove ${escapeHtml(m.name)}">✕</button>`;
    const [title, format] = [el.querySelector("input"), el.querySelector("select")];
    const persist = async () => {
        const media = project.media.map((x) => x.id === m.id ? { ...x, title: title.value.trim(), format: format.value } : x);
        try {
            await updateMediaList(project.id, media);
            project.media = media;
        } catch (err) {
            el.querySelector(".small").innerHTML += ` · <span class="err">not saved: ${escapeHtml(err.message)}</span>`;
        }
    };
    title.addEventListener("change", persist);
    format.addEventListener("change", persist);
    el.querySelector(".icon-btn").addEventListener("click", async (ev) => {
        const b = ev.currentTarget;
        b.disabled = true;
        try {
            await deleteMedia(project.id, m.id);
            project.media = project.media.filter((x) => x.id !== m.id);
            el.remove();
            renderEmpty();
        } catch (err) {
            b.disabled = false;
            el.querySelector(".small").innerHTML += ` · <span class="err">couldn't remove</span>`;
        }
    });
    return el;
}

function renderEmpty() {
    const rows = $("#media-rows");
    if (!rows.querySelector(".media-row")) {
        rows.innerHTML = project ? `<p class="form-note">No flyers or videos yet.</p>` : "";
    }
}

function renderMedia() {
    const rows = $("#media-rows");
    rows.innerHTML = "";
    (project?.media || []).forEach((m) => rows.appendChild(mediaRow(m)));
    renderEmpty();
}

async function uploadOne(file) {
    const rows = $("#media-rows");
    rows.querySelector(".form-note")?.remove();
    const pending = document.createElement("div");
    pending.className = "media-row";
    pending.innerHTML = `
        <div class="mthumb"></div>
        <div><strong>${escapeHtml(file.name)}</strong>
            <p class="small">Reading…</p><div class="progress"><span></span></div></div>
        <span></span><span></span>`;
    rows.prepend(pending);
    const note = pending.querySelector(".small");
    const bar = pending.querySelector(".progress span");
    try {
        const meta = await probe(file);
        if (meta.thumb) pending.querySelector(".mthumb").style.backgroundImage = `url('${meta.thumb}')`;
        meta.title = guessTitle(file.name, project.id, meta.kind);
        note.innerHTML = `Uploading ${formatBytes(file.size)} as ${FORMATS[meta.format].ratio || "original size"}…`
            + (meta.warning ? ` <span class="warn">${escapeHtml(meta.warning)}</span>` : "");
        const entry = await uploadMedia(project.id, file, meta, (f) => { bar.style.width = `${Math.round(f * 100)}%`; });
        project.media = [...(project.media || []), entry];
        pending.replaceWith(mediaRow(entry));
    } catch (err) {
        console.error(err);
        note.innerHTML = `<span class="err">${escapeHtml(err.code === "permission-denied" ? "Firestore refused the upload." : err.message)}</span>`;
        pending.querySelector(".progress").remove();
        const dismiss = pending.querySelectorAll("span")[pending.querySelectorAll("span").length - 1];
        dismiss.outerHTML = `<button class="icon-btn" type="button" aria-label="Dismiss">✕</button>`;
        pending.querySelector(".icon-btn").addEventListener("click", () => { pending.remove(); renderEmpty(); });
    }
}

async function uploadAll(files) {
    if (!project) return;
    /* One at a time: each upload rewrites the project's media list. */
    for (const file of files) await uploadOne(file);
    const used = projectBytes(project);
    if (used > DOC_SOFT_LIMIT * 0.85) {
        status(`This project's record is ${Math.round((used / DOC_SOFT_LIMIT) * 100)}% full. Remove files you don't need before adding more.`);
    }
}

$("#media-input").addEventListener("change", (e) => {
    uploadAll([...e.target.files]);
    e.target.value = "";
});
const zone = $("#dropzone");
zone.addEventListener("dragover", (e) => {
    if (!project) return;
    e.preventDefault();
    zone.classList.add("over");
});
zone.addEventListener("dragleave", () => zone.classList.remove("over"));
zone.addEventListener("drop", (e) => {
    zone.classList.remove("over");
    if (!project) return;
    e.preventDefault();
    uploadAll([...e.dataTransfer.files]);
});

/* ---------- Start ---------- */

requireAdmin(async (u) => {
    user = u;
    if (projectId) {
        try {
            project = await getProject(projectId);
            if (!project) throw new Error(`There is no project at “${projectId}”. It may have been deleted.`);
            fillForm(project);
        } catch (err) {
            form.hidden = true;
            $("#load-error").hidden = false;
            $("#load-error-text").textContent = err.code === "permission-denied"
                ? "Firestore refused the request. Check that the security rules are deployed." : err.message;
            return;
        }
    } else {
        form.elements.date.value = todayLabel();
        form.elements.order.value = 1;
    }
    setMode();
    renderMedia();
});
