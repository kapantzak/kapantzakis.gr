import { existsSync, readFileSync } from "node:fs";
import { expect, it } from "vitest";
import cv from "./content.json";
import { sourcesHash } from "./sources.mjs";

// Decision 235: catches a forgotten `npm run cv`, not an uncommitted one.
it("the committed PDF was built from the current CV sources", async () => {
  const recorded = readFileSync("cv/sources.sha256", "utf8").trim();
  expect(await sourcesHash(), "CV sources changed; run npm run cv").toBe(
    recorded,
  );
  expect(existsSync(`public/${cv.outputBasename}.pdf`)).toBe(true);
});
