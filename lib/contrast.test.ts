import { describe, expect, it } from "vitest";
import { contrastRatio, relativeLuminance } from "./contrast";

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBe(1);
  });

  it("rejects colours that are not #rrggbb", () => {
    expect(() => relativeLuminance("#fff")).toThrow(/#rrggbb/);
    expect(() => relativeLuminance("red")).toThrow(/#rrggbb/);
  });
});

describe("contrastRatio", () => {
  it("is 21 for black on white, in either order", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
  });

  it("is 1 for identical colours", () => {
    expect(contrastRatio("#7d8bff", "#7d8bff")).toBe(1);
  });

  it("matches a known WCAG value", () => {
    // #767676 on white is the classic 4.54:1 AA threshold example.
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });
});
