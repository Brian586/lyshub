import services from "./data/services-data.js";

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
});
