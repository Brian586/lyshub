/* Text helpers shared by the public pages and the admin portal. No dependencies. */

export function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

/*
 * Descriptions are plain text: a blank line starts a paragraph, **text** is bold.
 * Everything is escaped first, so nothing typed in the admin can inject markup.
 */
export function renderDescription(text) {
    return String(text || "")
        .split(/\n\s*\n/)
        .map((para) => para.trim())
        .filter(Boolean)
        .map((para) => `<p>${escapeHtml(para).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>")}</p>`)
        .join("");
}

export function formatBytes(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
