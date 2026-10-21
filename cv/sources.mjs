// The stale-PDF guard (decision 235): a hash of everything the PDF is built from, recorded by `npm run cv`
// and recomputed by sources.test.ts.

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

/** In a fixed order, so the hash only changes when a file does. */
export const SOURCES = [
  "content.json",
  "template.mjs",
  "cv.css",
  "print.css",
  "build.mjs",
];

export async function sourcesHash() {
  const hash = createHash("sha256");
  for (const name of SOURCES) {
    // Names and separators keep a byte moving between two files from hashing the same.
    hash.update(`${name}\0`);
    hash.update(await readFile(new URL(name, import.meta.url)));
    hash.update("\0");
  }
  return hash.digest("hex");
}
