// `npm run cv`: prints the CV to public/<outputBasename>.pdf, where it is committed (decision 232).
// Uses the locally installed Google Chrome, since the Vercel build has none.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { sourcesHash } from "./sources.mjs";
import { renderDocument } from "./template.mjs";

const cvDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(cvDir, "..");

const cv = JSON.parse(await readFile(resolve(cvDir, "content.json"), "utf8"));
const css = [
  await readFile(resolve(cvDir, "print.css"), "utf8"),
  await readFile(resolve(cvDir, "cv.css"), "utf8"),
].join("\n");

const htmlDir = resolve(root, ".tmp/cv");
await mkdir(htmlDir, { recursive: true });
const htmlPath = resolve(htmlDir, `${cv.outputBasename}.html`);
const pdfPath = resolve(root, "public", `${cv.outputBasename}.pdf`);
await writeFile(
  htmlPath,
  renderDocument(cv, css, `${pathToFileURL(cvDir).href}/`),
);

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
  // Fonts must be fully loaded before printing or Chrome falls back to system fonts.
  await page.evaluate(() => document.fonts.ready);
  // A wrong path would print in a fallback face without complaint, so fail instead. Every face declared in
  // print.css is loaded and checked, since a missing weight falls back as silently as a missing family.
  const missing = await page.evaluate(async () => {
    const faces = [...document.fonts];
    await Promise.allSettled(faces.map((face) => face.load()));
    return faces
      .filter((face) => face.status !== "loaded")
      .map((face) => `${face.family} ${face.weight}`);
  });
  if (missing.length)
    throw new Error(`CV fonts did not load: ${missing.join(", ")}`);
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    preferCSSPageSize: true,
    printBackground: true,
    tagged: true,
    outline: true,
    displayHeaderFooter: false,
  });
} finally {
  await browser.close();
}

await writeFile(resolve(cvDir, "sources.sha256"), `${await sourcesHash()}\n`);

console.log(`Wrote ${pdfPath}`);
console.log(`Wrote ${htmlPath}`);
