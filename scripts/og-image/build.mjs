// `npm run og-image`: renders scripts/og-image/content.json into public/og-image.png, where it is committed
// (decision 254). Uses the locally installed Google Chrome, same as cv/build.mjs, since the Vercel build has none
// and this image changes rarely.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { renderDocument } from "./template.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "../..");

const content = JSON.parse(
  await readFile(resolve(scriptDir, "content.json"), "utf8"),
);
const css = await readFile(resolve(scriptDir, "og-image.css"), "utf8");
const logoHref = pathToFileURL(resolve(root, "assets/brand/jk-logo.png")).href;

const htmlDir = resolve(root, ".tmp/og-image");
await mkdir(htmlDir, { recursive: true });
const htmlPath = resolve(htmlDir, "og-image.html");
const pngPath = resolve(root, "public", "og-image.png");
await writeFile(
  htmlPath,
  renderDocument(content, css, `${pathToFileURL(scriptDir).href}/`, logoHref),
);

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
  // Fonts must be fully loaded before the screenshot or Chrome falls back to system fonts.
  await page.evaluate(() => document.fonts.ready);
  // A wrong path would render in a fallback face without complaint, so fail instead.
  const missing = await page.evaluate(async () => {
    const faces = [...document.fonts];
    await Promise.allSettled(faces.map((face) => face.load()));
    return faces
      .filter((face) => face.status !== "loaded")
      .map((face) => `${face.family} ${face.weight}`);
  });
  if (missing.length)
    throw new Error(`og-image fonts did not load: ${missing.join(", ")}`);
  await page.screenshot({ path: pngPath });
} finally {
  await browser.close();
}

console.log(`Wrote ${pngPath}`);
console.log(`Wrote ${htmlPath}`);
