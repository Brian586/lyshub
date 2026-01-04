import projects from "./data/projects-data.js";

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    let projectId = urlParams.get('projectId');

    if (!projectId) {
        console.error('Project ID not found in URL parameters.');
        return;
    }

    projectId = projectId.replaceAll('#', '');

    const project = projects.find(proj => proj.id === projectId);

    if (!project) {
        console.error('Project not found for ID:', projectId);
        return;
    }

    // Populate project details
    document.getElementById('project-title').textContent = project.title;
    document.getElementById('banner-title').textContent = project.title;
    document.getElementById('project-tag').textContent = project.tag;
    document.getElementById('project-description').innerHTML = project.description;
    document.getElementById('project-image').src = project.image;
    document.getElementById('project-image').alt = `${project.title} Image`;
    document.getElementById('project-date').textContent = project.date;

    document.getElementById('project-client').textContent = project.title || 'N/A';
    document.getElementById('project-location').textContent = project.location || 'N/A';
    document.getElementById('project-website').textContent = project.website || 'N/A';
    const projectLink = document.getElementById('project-link');
    projectLink.href = project.website ? `https://${project.website}` : '#';
});