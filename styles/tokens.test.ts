import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";

const css = readFileSync(path.join(process.cwd(), "styles/tokens.css"), "utf8");

const LIGHT_SELECTOR = ':root:has(main[data-theme="light"])';

const TEXT_TOKENS = [
  "--color-fg",
  "--color-fg-strong",
  "--color-muted",
  "--color-accent-blue",
  "--color-accent-magenta",
  "--color-accent-lime",
  "--color-accent-orange",
];

function readColours(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1)
    throw new Error(`Block "${selector} {" not found in tokens.css`);
  const block = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...block.matchAll(/(--color-[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map(
      (m) => [m[1], m[2].toLowerCase()],
    ),
  );
}

const darkOwn = readColours(":root");
const lightOwn = readColours(LIGHT_SELECTOR);
const themes = { dark: darkOwn, light: { ...darkOwn, ...lightOwn } };

describe.each(Object.entries(themes))("%s theme", (_, colours) => {
  it.each(TEXT_TOKENS)(
    "%s has at least 4.5:1 contrast on --color-bg",
    (token) => {
      const fg = colours[token];
      const bg = colours["--color-bg"];
      expect(fg, `${token} is not defined`).toBeDefined();
      expect(bg, "--color-bg is not defined").toBeDefined();
      expect(contrastRatio(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
    },
  );
});

it("light theme overrides the background and every text colour", () => {
  for (const token of ["--color-bg", ...TEXT_TOKENS]) {
    expect(lightOwn[token], `${token} missing from light block`).toBeDefined();
  }
});
