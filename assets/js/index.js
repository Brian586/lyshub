import services from "./data/services-data.js";
import team from "./data/team-data.js";
import projects from "./data/projects-data.js";
import testimonials from "./data/testimonials-data.js";

document.addEventListener("DOMContentLoaded", function () {
    // Services Section
    const servicesList = document.getElementById("services-list");

    services.forEach((service) => {

        const serviceItem = document.createElement("div");
        serviceItem.className = "col-xl-4 col-lg-6 col-md-12 col-sm-12 col-xs-12";
        serviceItem.innerHTML = `
            <div class="service_box style_two dark_color">
                <div class="service_content_two">
                    <div class="content_inner"
                        style="background-image:url(${service.imageUrl});">
                        <div class="content_inner_in">
                        <div class="icon_image">
                            <img src="${service.iconUrl}" class="img-fluid" alt="${service.title} Image">
                        </div>
                        <h2>
                            <a href="#">${service.title}</a>
                        </h2>
                        <p>${service.shortDescription}</p>
                        <ul>
                            ${service.list.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                        </div>
                    </div>
                    <div class="ovarlay_link">
                        <a href="#">
                        <i class="icon-right-arrow"></i>
                        </a>
                    </div>
                    <div class="overlay_content">
                        <h2>
                        <a href="#">${service.title}</a>
                        </h2>
                        <p>${service.shortDescription}
                        </p>
                    </div>
                </div>
            </div>
            <div class="mr_bottom_20"></div>
        `;
        servicesList.appendChild(serviceItem);
    });
    // Services Section

    // Team Section
    const teamList = document.getElementById("team-list");

    team.forEach((member) => {
        const teamMember = document.createElement("div");
        teamMember.className = "col-lg-4 col-md-6 col-sm-12 col-xs-12";

        teamMember.innerHTML = `
        <div class="team_box style_one">
            <div class="team_box_outer">
                <div class="member_image">
                    <img src="${member.image}" alt="${member.name}">
                </div>
                <div class="about_member">
                    <div class="share_media">
                        <ul class="first">
                        <li class="text">Links</li>
                        <li><i class="fa fa-share-alt"></i></li>
                        </ul>
                        <ul>
                        <li class="shar_alt"><i class="fa fa-share-alt"></i></li>
                        <li><a href="${member.socialLinks.linkedin}" target="_blank"> <i class="fa fa-linkedin"> </i></a></li>
                        <li><a href="${member.socialLinks.github}" target="_blank"> <i class="fa fa-github"> </i></a></li>
                        <li><a href="${member.socialLinks.website}" target="_blank"> <i class="fa fa-link"> </i></a></li>
                        </ul>
                    </div>
                    <div class="authour_details">
                        <span>${member.position}</span>
                        <h6>${member.name}</h6>
                        <div class="button_view">
                        <a href="${member.profile}" target="_blank" rel="nofollow" class="theme-btn one"> View Profile
                        </a>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <div class="mr_bottom_30"></div>
        `;
        teamList.appendChild(teamMember);
    });
    // Team Section

    // Projects Section
    const projectsList = document.getElementById("projects-list");

    projects.forEach((project) => {
        const projectItem = document.createElement("div");
        projectItem.className = "swiper-slide";
        projectItem.innerHTML = `
            <div class="project_post style_one mr_top_20">
                <div class="image">
                    <img src="${project.image}" class="img-fluid"
                        alt="${project.title} Image">
                </div>
                <div class="project_caro_content">
                    <div class="left_side">
                        <p>${project.tag}</p>
                        <h2 class="title_pro"><a href="project-details.html?projectId=${project.id}">${project.title}</a></h2>
                    </div>
                    <div class="right_side">
                        <a href="project-details.html?projectId=${project.id}"><i class="icon-right-arrow"></i></a>
                        <a href="project-details.html?projectId=${project.id}" class="two"><i
                            class="icon-right-arrow"></i></a>
                    </div>
                </div>
            </div>
                `;

        projectsList.appendChild(projectItem);
    });
    // Projects Section

    // Testimonials Section
    const testimonialsList = document.getElementById("testimonials-list");

    testimonials.forEach((testimonial) => {
        const testimonialItem = document.createElement("div");
        testimonialItem.className = "swiper-slide";
        testimonialItem.innerHTML = `
            <div class="testimonial_box">
                <div class="box_inner not_ovelay">
                    <div class="rating">
                        <ul>
                        <li><span class="fa fa-star fill"></span><span
                                class="fa fa-star fill"></span><span
                                class="fa fa-star fill"></span><span
                                class="fa fa-star fill"></span><span
                                class="fa fa-star fill"></span>
                        </li>
                        </ul>
                    </div>
                    <p class="description">
                        ${testimonial.testimonial}
                    </p>
                    <div class="client_bx">
                        <div class="image_box">
                        <img src="${testimonial.image}" alt="image">
                        </div>
                        <div class="left_s">
                        <h2 class="title">${testimonial.name}</h2>
                        <h6 class="from">${testimonial.position}, ${testimonial.company}</h6>
                        </div>
                    </div>
                </div>
            </div>
        `;

        testimonialsList.appendChild(testimonialItem);
    });
    // Testimonials Section
});