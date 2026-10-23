// Renders content.json into the CV's single-column markup: one fragment for the /cv page, wrapped in a full
// document for the PDF (decision 233). Kept dependency-free so the build stays reproducible with plain Node.

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const link = (href, label) => `<a href="${esc(href)}">${esc(label)}</a>`;

const list = (items) =>
  `<ul>${items.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;

function header(cv) {
  const contacts = cv.contacts
    .map((c) => link(c.href, c.label))
    .join('<span class="sep">·</span>');
  return `
<header>
  <h1>${esc(cv.name)}</h1>
  <p class="title">${esc(cv.title)}</p>
  <p class="contact"><span class="loc">${esc(cv.location)}</span><span class="sep">·</span>${contacts}</p>
</header>`;
}

function experience(cv) {
  const roles = cv.experience
    .map(
      (r) => `
<article class="role">
  <div class="row">
    <h3>${esc(r.role)}<span class="at">, </span>${link(r.url, r.company)}</h3>
    <span class="meta">${esc(r.period)}</span>
  </div>
  <p class="context">${esc(r.context)}</p>
  ${list(r.bullets)}
</article>`,
    )
    .join("");
  return `<section><h2>Experience</h2>${roles}</section>`;
}

// A project takes a role's layout, named by its live site (CV design decision 14).
function projects(cv) {
  const entries = cv.projects
    .map(
      (p) => `
<article class="role">
  <div class="row">
    <h3>${link(p.url, p.name)}<span class="at">, </span><span class="sub">${esc(p.descriptor)}</span></h3>
    <span class="meta">${esc(p.period)}</span>
  </div>
  <p class="context">${esc(p.context)}</p>
  ${list(p.bullets)}
</article>`,
    )
    .join("");
  return `<section><h2>Projects</h2>${entries}</section>`;
}

function community(cv) {
  const entries = cv.community
    .map((c) => {
      const links = c.links
        .map((l) => link(l.href, l.label))
        .join('<span class="sep">·</span>');
      const text = c.text ? `<p class="context">${esc(c.text)}</p>` : "";
      return `
<article class="entry">
  <div class="row">
    <h3>${esc(c.title)}<span class="at">, </span><span class="sub">${esc(c.subtitle)}</span></h3>
    <span class="meta">${esc(c.period)}</span>
  </div>
  ${text}
  <p class="links">${links}</p>
</article>`;
    })
    .join("");
  return `<section><h2>Open Source &amp; Community</h2>${entries}</section>`;
}

function writing(cv) {
  const items = cv.writing
    .map(
      (w) => `
<li>${link(w.href, w.title)}<span class="venue">${esc(w.venue)}, ${esc(w.year)}</span></li>`,
    )
    .join("");
  return `<section><h2>Selected Writing</h2><ul class="plain">${items}</ul></section>`;
}

function skills(cv) {
  const rows = cv.skills
    .map(
      (s) =>
        `<p class="skill"><span class="group">${esc(s.group)}</span>${esc(s.items)}</p>`,
    )
    .join("");
  return `<section><h2>Skills</h2>${rows}</section>`;
}

function education(cv) {
  const rows = cv.education
    .map(
      (e) => `
<div class="row edu">
  <p><strong>${esc(e.degree)}</strong>, ${esc(e.school)}</p>
  <span class="meta">${esc(e.period)}</span>
</div>`,
    )
    .join("");
  return `<section><h2>Education</h2>${rows}</section>`;
}

/** The CV's markup, wrapped in `.cv` so its styles stay scoped (decision 233). */
export function renderCv(cv) {
  return `<div class="cv">
${header(cv)}
<section class="summary"><p>${esc(cv.summary)}</p></section>
${experience(cv)}
${projects(cv)}
${community(cv)}
${writing(cv)}
${skills(cv)}
${education(cv)}
</div>`;
}

/** The PDF's document; `baseHref` points at cv/ so the fonts' relative URLs resolve (decision 232). */
export function renderDocument(cv, css, baseHref) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<base href="${esc(baseHref)}">
<title>${esc(cv.name)} – ${esc(cv.title)}</title>
<meta name="author" content="${esc(cv.name)}">
<style>${css}</style>
</head>
<body>
<main>${renderCv(cv)}</main>
</body>
</html>`;
}
