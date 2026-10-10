import { describe, expect, it } from "vitest";
import {
  NAV_ITEMS,
  REGIONS,
  isHomePath,
  regionOf,
  regionPath,
  sectionOf,
} from "./nav";

describe("NAV_ITEMS", () => {
  it("lists the page sections in reading order", () => {
    expect(NAV_ITEMS.map((i) => i.id)).toEqual([
      "experience",
      "writing",
      "contact",
    ]);
  });
});

describe("REGIONS", () => {
  it("lists every place with a path of its own, in reading order (decision 173)", () => {
    expect(REGIONS).toEqual([
      "experience",
      "education",
      "community",
      "writing",
      "contact",
    ]);
    expect(REGIONS.map(regionPath)).toEqual([
      "/experience",
      "/education",
      "/community",
      "/writing",
      "/contact",
    ]);
  });

  it("marks Experience for the groups inside it (decision 181)", () => {
    expect(REGIONS.map(sectionOf)).toEqual([
      "experience",
      "experience",
      "experience",
      "writing",
      "contact",
    ]);
  });
});

describe("regionOf and isHomePath", () => {
  it("names a region only for its exact path", () => {
    expect(regionOf("/education")).toBe("education");
    for (const path of [
      "/",
      "/education/bsc-economic-science",
      "/Education",
      "/education/",
      "/no-such-page",
    ]) {
      expect(regionOf(path), path).toBeNull();
    }
  });

  it("counts / and every region path as the home page (decision 183)", () => {
    for (const path of ["/", ...REGIONS.map(regionPath)]) {
      expect(isHomePath(path), path).toBe(true);
    }
    for (const path of ["/experience/netdata", "/no-such-page", ""]) {
      expect(isHomePath(path), path).toBe(false);
    }
  });
});
