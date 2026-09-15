import services from "./data/services-data.js";

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

function serviceCard(service, index) {
    const item = document.createElement("article");
    item.className = "service-card";
    item.setAttribute("data-reveal", "");
    item.setAttribute("data-reveal-delay", String((index % 3) * 120));

    item.innerHTML = `
        <div class="media">
            <img src="${service.imageUrl}" alt="${service.title}" loading="lazy" width="520" height="325">
            <span class="badge"><img src="${service.iconUrl}" alt="" aria-hidden="true"></span>
        </div>
        <div class="body">
            <h3><a href="services.html#service-${service.id}">${service.title}</a></h3>
            <p>${service.shortDescription}</p>
            <ul class="card-list">
                ${service.list.map((entry) => `<li>${entry}</li>`).join("")}
            </ul>
            <a class="link-arrow" href="services.html#service-${service.id}">Learn More ${ARROW}</a>
        </div>
    `;

    return item;
}

document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById("services-list");
    if (!list) return;

    const limit = parseInt(list.getAttribute("data-limit") || "0", 10);
    const shown = limit > 0 ? services.slice(0, limit) : services;

    shown.forEach((service, index) => list.appendChild(serviceCard(service, index)));

    document.dispatchEvent(new CustomEvent("lyshub:rendered", { detail: { list } }));
});
