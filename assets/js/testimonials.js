import testimonials from "./data/testimonials-data.js";

function testimonialCard(item, index) {
    const card = document.createElement("article");
    card.className = "testimonial";
    card.setAttribute("data-reveal", "");
    card.setAttribute("data-reveal-delay", String((index % 3) * 120));

    card.innerHTML = `
        <p class="quote">&ldquo;${item.quote}&rdquo;</p>
        <div class="who">
            <img src="${item.image || "assets/images/authour-image.png"}" alt="${item.name}" loading="lazy">
            <div>
                <div class="name">${item.name}</div>
                <div class="role">${item.role || ""}</div>
            </div>
        </div>
    `;

    return card;
}

document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById("testimonials-list");
    if (!list) return;

    if (!testimonials.length) {
        /* No testimonials published yet — keep the section meaningful rather than blank. */
        list.className = "";
        list.innerHTML = `
            <div class="empty-note">
                <h3>Client stories are on the way</h3>
                <p class="mb-0">We are collecting feedback from the teams we work with.
                    In the meantime, <a href="projects.html">see what we have built</a>.</p>
            </div>`;
    } else {
        testimonials.forEach((item, index) => list.appendChild(testimonialCard(item, index)));
    }

    document.dispatchEvent(new CustomEvent("lyshub:rendered", { detail: { list } }));
});
