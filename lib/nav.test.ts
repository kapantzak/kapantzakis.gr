import { describe, expect, it } from "vitest";
import { NAV_ITEMS, sectionHref } from "./nav";

describe("NAV_ITEMS", () => {
  it("lists the page sections in reading order", () => {
    expect(NAV_ITEMS.map((i) => i.id)).toEqual([
      "experience",
      "writing",
      "contact",
    ]);
  });
});

describe("sectionHref", () => {
  it("points at the section on the home page", () => {
    expect(sectionHref("writing")).toBe("/#writing");
  });
});
