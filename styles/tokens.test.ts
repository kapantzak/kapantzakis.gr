import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { profile } from "@/content/profile";
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

// The hero aurora's glow peaks, and the only text colours the hero uses on them (decision 82).
const AURORA_TOKENS = [
  "--color-aurora-green",
  "--color-aurora-teal",
  "--color-aurora-violet",
];
const HERO_TEXT_TOKENS = [
  "--color-fg",
  "--color-fg-strong",
  "--color-accent-lime",
];

// A dark band reuses the page's text tokens, a light band the sheet's, with its body grey
// standing in for muted text (decisions 49, 64, 69).
const BAND_TEXT_TOKENS = {
  dark: ["--color-fg", "--color-fg-strong", "--color-muted"],
  light: ["--color-paper-fg", "--color-paper-fg-strong"],
};

const brands = [...profile.experience, ...profile.community].flatMap((entry) =>
  entry.brand ? [[entry.org, entry.brand] as const] : [],
);

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

// Glows blend with `lighten` over the page background, so no point is brighter than the per-channel maximum.
function auroraWorstCase(): string {
  const hexes = ["--color-bg", ...AURORA_TOKENS].map((token) => {
    expect(colours[token], `${token} is not defined`).toBeDefined();
    return colours[token]!;
  });
  return `#${[1, 3, 5]
    .map((i) =>
      Math.max(...hexes.map((hex) => parseInt(hex.slice(i, i + 2), 16)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

describe("text on the hero aurora", () => {
  it.each(HERO_TEXT_TOKENS)(
    "%s has at least 4.5:1 contrast where the glows are brightest",
    (token) => {
      expect(
        contrastRatio(colours[token]!, auroraWorstCase()),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );
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

describe.each(brands)("the %s brand", (_org, brand) => {
  it.each(BAND_TEXT_TOKENS[brand.tone])(
    "%s has at least 4.5:1 contrast on its band",
    (token) => {
      expect(colours[token], `${token} is not defined`).toBeDefined();
      expect(
        contrastRatio(colours[token]!, brand.background),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("--color-on-accent has at least 4.5:1 contrast on its accent", () => {
    expect(
      contrastRatio(colours["--color-on-accent"]!, brand.accent),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("--color-on-accent has at least 4.5:1 contrast on its link colour", () => {
    expect(
      contrastRatio(colours["--color-on-accent"]!, brand.link),
    ).toBeGreaterThanOrEqual(4.5);
  });
});

// A lockup's second line is text in the accent colour (decision 93).
describe.each(brands.filter(([, brand]) => brand.lockup))(
  "the %s lockup",
  (_org, brand) => {
    it("its accent has at least 4.5:1 contrast on its band", () => {
      expect(
        contrastRatio(brand.accent, brand.background),
      ).toBeGreaterThanOrEqual(4.5);
    });
  },
);
