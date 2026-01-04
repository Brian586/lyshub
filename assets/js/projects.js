import projects from "./data/projects-data.js";

document.addEventListener("DOMContentLoaded", function () {
    // Projects Section
    const projectsList = document.getElementById("projects-list");

    projects.forEach((project) => {
        const projectItem = document.createElement("div");
        projectItem.className = "project-wrapper grid-item col-lg-12 col-md-12 col-sm-12 col-xs-12  project_category-apps";
        projectItem.innerHTML = `
            <div class="project_box style_three clearfix">
                <div class="content_inner">
                    <div><a href="#">${project.tag}</a></div>
                    <h2><a href="project-details.html?projectId=${project.id}">${project.title}</a>
                    </h2>
                    <p class="short_desc">${project.shortDescription}</p>
                    <a href="project-details.html?projectId=${project.id}" class="read_more">Read More <span
                        class="icon-right-arrow-long"></span></a>
                    <div class="share_me">
                    <div class="share_socail">
                        <div class="title">Share</div>
                        <button class="m_icon" title="facebook" data-sharer="facebook"
                            data-title="${project.title} Social"
                            data-url="project-details.html?projectId=${project.id}">
                            <i class="fa fa-facebook"></i>
                        </button>
                        <button class="m_icon" title="twitter" data-sharer="twitter"
                            data-title="${project.title} Social"
                            data-url="project-details.html?projectId=${project.id}">
                            <i class="fa fa-twitter"></i>
                        </button>
                        <button class="m_icon" title="whatsapp" data-sharer="whatsapp"
                            data-title="${project.title} Social"
                            data-url="project-details.html?projectId=${project.id}">
                            <i class="fa fa-whatsapp"></i>
                        </button>
                    </div>
                    </div>
                </div>
                <div class="image">
                    <img width="370" height="247" src="${project.image}"
                    class="wp-post-image" alt="${project.title}">
                    <a href="project-details.html?projectId=${project.id}" class="pro-link"></a>
                    <div class="overlay"> </div>
                    <div class="text">
                    <ul>
                        <li>Date : <span>${project.date}</span></li>
                        <li>Client :<span>${project.title}</span></li>
                    </ul>
                    </div>
                </div>
            </div>
                        
                `;

        projectsList.appendChild(projectItem);
    });
    // Projects Section
});