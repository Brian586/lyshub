/*
 * Where the public pages get projects: Firestore first, published ones only, managed in /admin.
 * If Firestore can't be reached or has nothing published yet, the built-in list in
 * data/projects-data.js keeps the site from going blank.
 */
import staticProjects from "./data/projects-data.js";

/* One shape for both sources. Firestore text is untrusted until escaped by the page. */
function fromFirestore(p) {
    return {
        id: p.id,
        title: p.title || "",
        tag: p.tag || "",
        client: p.client || p.title || "",
        location: p.location || "",
        website: p.website || "",
        date: p.date || "",
        shortDescription: p.shortDescription || "",
        description: p.description || "",
        descriptionIsHtml: false,
        image: p.cover?.data || "assets/images/projects/project-detail-img-1.jpg",
        media: p.media || [],
        source: "firestore"
    };
}

function fromStatic(p) {
    return { ...p, client: p.title, descriptionIsHtml: true, media: [], source: "static" };
}

export async function loadProjects() {
    try {
        const { listPublished } = await import("./projects-store.js");
        const list = await listPublished();
        if (list.length) return list.map(fromFirestore);
    } catch (error) {
        console.warn("Projects: Firestore unavailable, showing the built-in list.", error);
    }
    return staticProjects.map(fromStatic);
}

export async function loadProject(id) {
    try {
        const { getProject } = await import("./projects-store.js");
        const p = await getProject(id);
        if (p && p.published) return fromFirestore(p);
    } catch (error) {
        console.warn("Projects: Firestore unavailable, trying the built-in list.", error);
    }
    const s = staticProjects.find((p) => p.id === id);
    return s ? fromStatic(s) : null;
}
