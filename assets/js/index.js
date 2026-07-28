import services from "./data/services-data.js";
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

    if (testimonials.length === 0) {
        const testimonialSection = testimonialsList.closest(".testimonial-section");

        if (testimonialSection) {
            testimonialSection.style.display = "none";
        }
    }

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