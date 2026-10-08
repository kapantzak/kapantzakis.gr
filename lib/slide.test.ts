import { describe, expect, it } from "vitest";
import { coverProgress } from "./slide";

describe("coverProgress", () => {
  const viewport = 800;
  const height = 200;

  it("is 0 as the element's top edge enters at the bottom", () => {
    expect(coverProgress(viewport, height, viewport)).toBe(0);
  });

  it("is 1 as the element's bottom edge leaves at the top", () => {
    expect(coverProgress(-height, height, viewport)).toBe(1);
  });

  it("is 0.5 when the element is centred in the viewport", () => {
    expect(coverProgress(300, height, viewport)).toBe(0.5);
  });

  it("stays within 0…1 outside the range", () => {
    expect(coverProgress(2000, height, viewport)).toBe(0);
    expect(coverProgress(-2000, height, viewport)).toBe(1);
  });
});
