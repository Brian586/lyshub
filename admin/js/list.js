import { requireAdmin } from "./auth.js";
import { compressCover } from "./media-tools.js";
import { deleteProject, listAll, saveProject } from "../../assets/js/projects-store.js";
import { escapeHtml } from "../../assets/js/text.js";

const list = document.getElementById("project-list");
const importBtn = document.getElementById("import-static");

function skeleton() {
    list.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;
}

function row(p) {
    const el = document.createElement("article");
    el.className = "project-row";
    const media = p.media || [];
    const videos = media.filter((m) => m.kind === "video").length;
    el.innerHTML = `
        <div class="thumb" style="background-image:url('${escapeHtml(p.cover?.data || "")}')"></div>
        <div>
            <h3>${escapeHtml(p.title || p.id)}</h3>
            <div class="meta">
                <span class="pill ${p.published ? "live" : "draft"}">${p.published ? "Published" : "Draft"}</span>
                <span>${escapeHtml(p.tag || "No category")}</span>
                <span>${media.length - videos} image${media.length - videos === 1 ? "" : "s"} · ${videos} video${videos === 1 ? "" : "s"}</span>
                <span>Order ${p.order ?? "—"}</span>
            </div>
        </div>
        <div class="row-actions">
            ${p.published ? `<a class="btn btn-sm btn-outline" href="../project-details.html?projectId=${encodeURIComponent(p.id)}" target="_blank" rel="noopener">View</a>` : ""}
            <a class="btn btn-sm" href="edit.html?id=${encodeURIComponent(p.id)}">Edit</a>
            <button class="icon-btn" type="button" aria-label="Delete ${escapeHtml(p.title || p.id)}">✕</button>
        </div>`;
    el.querySelector(".icon-btn").addEventListener("click", () => confirmDelete(p));
    return el;
}

async function refresh() {
    skeleton();
    let projects;
    try {
        projects = await listAll();
    } catch (err) {
        console.error(err);
        list.innerHTML = `
            <div class="empty-note">
                <h3>Couldn't load projects</h3>
                <p>${escapeHtml(err.code === "permission-denied"
                    ? "Firestore refused the request. Check that the security rules in firestore.rules are deployed."
                    : "Check your connection and try again.")}</p>
                <button class="btn btn-sm" type="button" id="retry">Try again</button>
            </div>`;
        document.getElementById("retry").addEventListener("click", refresh);
        return;
    }
    importBtn.hidden = projects.length > 0;
    if (!projects.length) {
        list.innerHTML = `
            <div class="empty-note">
                <h3>No projects yet</h3>
                <p>Start with <strong>New project</strong>, or bring across the projects the site shows today
                   with <strong>Import the site's current projects</strong>.</p>
            </div>`;
        return;
    }
    list.innerHTML = "";
    projects.forEach((p) => list.appendChild(row(p)));
}

function confirmDelete(p) {
    const dialog = document.getElementById("confirm-delete");
    dialog.querySelector("[data-name]").textContent = p.title || p.id;
    dialog.showModal();
    dialog.querySelectorAll("button").forEach((b) => {
        b.onclick = async () => {
            if (b.value !== "delete") {
                dialog.close();
                return;
            }
            b.disabled = true;
            b.textContent = "Deleting…";
            try {
                await deleteProject(p.id);
                dialog.close();
                refresh();
            } catch (err) {
                b.textContent = "Couldn't delete. Retry";
            } finally {
                b.disabled = false;
            }
        };
    });
}

/* The site's built-in projects (data/projects-data.js) become Firestore projects, cover and all. */
function htmlToText(html) {
    return String(html || "")
        .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "\n\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?strong>/gi, "**")
        .replace(/<[^>]+>/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n /g, "\n")
        .replace(/\*\*\s*\n/g, "**\n")
        .trim();
}

async function importStatic(user) {
    importBtn.disabled = true;
    importBtn.textContent = "Importing…";
    try {
        const { default: projects } = await import("../../assets/js/data/projects-data.js");
        for (const [i, p] of projects.entries()) {
            const blob = await (await fetch(`../${p.image}`)).blob();
            await saveProject(p.id, {
                title: p.title, tag: p.tag, client: p.title, location: p.location || "", website: p.website || "",
                date: p.date || "", shortDescription: p.shortDescription || "", description: htmlToText(p.description),
                published: true, order: i + 1, cover: await compressCover(blob)
            }, { isNew: true, user });
        }
        importBtn.textContent = "Import the site's current projects";
        refresh();
    } catch (err) {
        console.error(err);
        importBtn.textContent = "Import failed. Retry";
    } finally {
        importBtn.disabled = false;
    }
}

requireAdmin((user) => {
    importBtn.addEventListener("click", () => importStatic(user));
    refresh();
});
