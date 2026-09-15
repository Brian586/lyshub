import projects from "./data/projects-data.js";

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

const SHARE_ICONS = {
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5h1.65V4.6c-.29-.04-1.27-.12-2.4-.12-2.38 0-4 1.45-4 4.11v2.3H7.6V14h2.7v8h3.2z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 5.9c-.7.32-1.5.53-2.3.63.83-.5 1.46-1.28 1.76-2.22-.78.46-1.64.8-2.55.98A4 4 0 0 0 12 8.9c0 .31.04.62.1.91a11.4 11.4 0 0 1-8.28-4.2 4 4 0 0 0 1.24 5.35c-.65-.02-1.27-.2-1.8-.5v.05a4 4 0 0 0 3.2 3.93c-.57.15-1.18.17-1.77.07a4 4 0 0 0 3.73 2.78A8 8 0 0 1 2 19.02a11.35 11.35 0 0 0 6.15 1.8c7.38 0 11.42-6.12 11.42-11.43l-.01-.52A8 8 0 0 0 22 5.9z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.8 9.8 0 0 0 4.68 1.2h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.47 2 12.04 2zm5.76 14.06c-.24.68-1.4 1.3-1.94 1.35-.5.05-.97.23-3.26-.68-2.74-1.08-4.48-3.87-4.62-4.05-.13-.18-1.1-1.46-1.1-2.78 0-1.33.7-1.98.94-2.25.25-.27.54-.34.72-.34h.52c.17 0 .4-.06.62.48.24.57.8 1.96.87 2.1.07.14.11.3.02.48-.09.18-.13.3-.27.46l-.4.47c-.13.13-.27.28-.12.55.15.27.67 1.1 1.43 1.79.99.88 1.82 1.15 2.08 1.28.26.14.41.11.56-.07.15-.18.64-.75.81-1.01.17-.27.34-.22.57-.13.23.09 1.47.7 1.72.82.25.13.42.2.48.3.06.11.06.63-.18 1.23z"/></svg>`
};

/* "App & Web Development" -> "apps websites", used by the filter pills. */
function categoriesFor(project) {
    const tag = (project.tag || "").toLowerCase();
    const categories = [];
    if (tag.includes("app")) categories.push("apps");
    if (tag.includes("web") || tag.includes("site")) categories.push("websites");
    return categories.length ? categories.join(" ") : "apps";
}

function projectCard(project, index) {
    const url = `project-details.html?projectId=${project.id}`;
    const item = document.createElement("article");
    item.className = "project-card";
    item.setAttribute("data-category", categoriesFor(project));
    item.setAttribute("data-reveal", "");
    item.setAttribute("data-reveal-delay", String((index % 2) * 120));

    const shareButtons = Object.keys(SHARE_ICONS)
        .map((network) => `
            <button type="button" data-share="${network}" data-url="${url}" data-title="${project.title}"
                aria-label="Share ${project.title} on ${network}">${SHARE_ICONS[network]}</button>`)
        .join("");

    item.innerHTML = `
        <div class="body">
            <span class="tag">${project.tag}</span>
            <h3><a href="${url}">${project.title}</a></h3>
            <p>${project.shortDescription}</p>
            <a class="link-arrow" href="${url}">Read More ${ARROW}</a>
            <div class="project-meta">
                <div>Date: <span>${project.date}</span></div>
                <div>Client: <span>${project.title}</span></div>
                <div class="share-row">${shareButtons}</div>
            </div>
        </div>
        <div class="media">
            <img src="${project.image}" alt="${project.title}" loading="lazy" width="740" height="494">
        </div>
    `;

    return item;
}

document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById("projects-list");
    if (!list) return;

    let pool = projects;

    /* On a project detail page, don't list the project the visitor is already reading. */
    if (list.hasAttribute("data-exclude-current")) {
        const current = new URLSearchParams(window.location.search).get("projectId");
        if (current) pool = pool.filter((p) => p.id !== current.replaceAll("#", ""));

        if (!pool.length) {
            const section = list.closest("section");
            if (section) section.hidden = true;
            return;
        }
    }

    const limit = parseInt(list.getAttribute("data-limit") || "0", 10);
    const shown = limit > 0 ? pool.slice(0, limit) : pool;

    if (!shown.length) {
        list.innerHTML = `
            <div class="empty-note">
                <h3>Case studies coming soon</h3>
                <p class="mb-0">We are preparing write-ups of our latest work.
                    <a href="contact.html">Get in touch</a> to hear about projects in your industry.</p>
            </div>`;
    } else {
        shown.forEach((project, index) => list.appendChild(projectCard(project, index)));
    }

    document.dispatchEvent(new CustomEvent("lyshub:rendered", { detail: { list } }));
});
