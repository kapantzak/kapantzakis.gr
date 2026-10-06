import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";

const css = readFileSync(path.join(process.cwd(), "styles/tokens.css"), "utf8");

const TEXT_TOKENS = [
  "--color-fg",
  "--color-fg-strong",
  "--color-muted",
  "--color-accent-lime",
  "--color-accent-magenta",
];

// The detail sheet's light surface (decision 44); accents are never text on it.
const PAPER_TEXT_TOKENS = [
  "--color-paper-fg",
  "--color-paper-fg-strong",
  "--color-paper-muted",
];

const ACCENT_FILLS = ["--color-accent-lime", "--color-accent-magenta"];

function readColours(): Record<string, string> {
  const start = css.indexOf(":root {");
  if (start === -1) throw new Error('Block ":root {" not found in tokens.css');
  const block = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...block.matchAll(/(--color-[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map(
      (m) => [m[1], m[2].toLowerCase()],
    ),
  );
}

const colours = readColours();

function ratio(fg: string, bg: string): number {
  expect(colours[fg], `${fg} is not defined`).toBeDefined();
  expect(colours[bg], `${bg} is not defined`).toBeDefined();
  return contrastRatio(colours[fg]!, colours[bg]!);
}

describe("text on the page background", () => {
  it.each(TEXT_TOKENS)("%s has at least 4.5:1 contrast", (token) => {
    expect(ratio(token, "--color-bg")).toBeGreaterThanOrEqual(4.5);
  });
});

describe("text on accent fills", () => {
  it.each(ACCENT_FILLS)(
    "--color-on-accent has at least 4.5:1 contrast on %s",
    (fill) => {
      expect(ratio("--color-on-accent", fill)).toBeGreaterThanOrEqual(4.5);
    },
  );
});

describe("text on the detail sheet", () => {
  it.each(PAPER_TEXT_TOKENS)("%s has at least 4.5:1 contrast", (token) => {
    expect(ratio(token, "--color-paper")).toBeGreaterThanOrEqual(4.5);
  });
});
