import projects from "./data/projects-data.js";

function showMissing(message) {
    const article = document.getElementById("project-article");
    if (!article) return;
    article.innerHTML = `
        <div class="empty-note">
            <h3>Project not found</h3>
            <p class="mb-0">${message} <a href="projects.html">Browse all projects</a>.</p>
        </div>`;
}

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    let projectId = urlParams.get("projectId");

    if (!projectId) {
        showMissing("No project was specified in the link you followed.");
        return;
    }

    projectId = projectId.replaceAll("#", "");

    const project = projects.find((proj) => proj.id === projectId);

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
    set("project-description", project.description, "innerHTML");
    set("project-date", project.date);
    set("project-client", project.title || "N/A");
    set("project-location", project.location || "N/A");
    set("project-website", project.website || "N/A");

    const image = document.getElementById("project-image");
    if (image) {
        image.src = project.image;
        image.alt = `${project.title}`;
    }

    const projectLink = document.getElementById("project-link");
    if (projectLink) {
        projectLink.href = project.website ? `https://${project.website}` : "#";
    }

    /* Share buttons on this page post the canonical URL of the project. */
    document.querySelectorAll("#project-share [data-share]").forEach((btn) => {
        btn.setAttribute("data-url", window.location.href);
        btn.setAttribute("data-title", project.title);
    });
});
