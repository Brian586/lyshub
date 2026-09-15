import services from "./data/services-data.js";

/* Full write-up for each service, alternating image side down the page. */
function serviceBlock(service, index) {
    const block = document.createElement("div");
    block.className = "split";
    block.id = `service-${service.id}`;
    block.style.marginBottom = "80px";
    block.style.scrollMarginTop = "120px";

    const media = `
        <div class="media-frame" data-reveal>
            <img src="${service.imageUrl}" alt="${service.title}" loading="lazy" width="620" height="480">
        </div>`;

    const body = `
        <div data-reveal data-reveal-delay="120">
            <span class="eyebrow">Service ${String(index + 1).padStart(2, "0")}</span>
            <h2>${service.title}</h2>
            <div class="rich-text">${service.description}</div>
            <ul class="check-list" style="margin-top:28px;">
                ${service.list.map((entry) => `<li>${entry}</li>`).join("")}
            </ul>
            <a class="btn" href="contact.html">Discuss This Service</a>
        </div>`;

    /* Odd rows put the image on the right so the page alternates. */
    block.innerHTML = index % 2 === 0 ? media + body : body + media;

    return block;
}

document.addEventListener("DOMContentLoaded", function () {
    const wrap = document.getElementById("services-detail");
    if (!wrap) return;

    services.forEach((service, index) => wrap.appendChild(serviceBlock(service, index)));

    wrap.lastElementChild?.style.setProperty("margin-bottom", "0");

    document.dispatchEvent(new CustomEvent("lyshub:rendered", { detail: { list: wrap } }));

    /* Support deep links like services.html#service-3 once the blocks exist. */
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
});
