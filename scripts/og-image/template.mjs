// Renders content.json into the social-share thumbnail's markup (1200×630, decision 254).
// Kept dependency-free so the build stays reproducible with plain Node, like cv/template.mjs.

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** `baseHref` lets the fonts resolve as relative file:// URLs, like cv/template.mjs. `logoHref` is absolute, since
 *  the logo lives in assets/brand, outside this script's own directory. */
export function renderDocument(content, css, baseHref, logoHref) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<base href="${esc(baseHref)}" />
<style>${css}</style>
</head>
<body>
<div class="card">
  <img class="logo" src="${esc(logoHref)}" alt="" width="72" height="72" />
  <div class="copy">
    <p class="name">${esc(content.name)}</p>
    <span class="rule"></span>
    <p class="role">${esc(content.role)}</p>
    <p class="headline">${esc(content.headline)}</p>
  </div>
  <p class="domain">${esc(content.domain)}</p>
</div>
</body>
</html>`;
}
