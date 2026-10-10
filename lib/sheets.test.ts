import { describe, expect, it } from "vitest";
import { profile } from "@/content/profile";
import {
  communitySheet,
  degreeSheet,
  roleSheet,
  sheetMetadata,
  sheetParams,
  sheetPath,
  sheetRoutes,
  sheetsOf,
} from "./sheets";

describe("sheetPath", () => {
  it("puts the slug under its group", () => {
    expect(sheetPath("education", "bsc-economic-science")).toBe(
      "/education/bsc-economic-science",
    );
  });
});

describe("sheet metadata", () => {
  it("describes a role by its title, organisation and period", () => {
    expect(roleSheet(profile.experience[0]!)).toEqual({
      group: "experience",
      slug: "netdata",
      path: "/experience/netdata",
      title: "Netdata",
      subtitle: "Senior software engineer",
      period: "Feb 2023 – Present",
      description: "Senior software engineer at Netdata, Feb 2023 – Present.",
    });
  });

  it("describes a degree by its name, institution and period", () => {
    expect(degreeSheet(profile.education[0]!)).toMatchObject({
      path: "/education/msc-applied-informatics",
      title: "MSc in Applied Informatics",
      subtitle: "University of Macedonia",
      description:
        "MSc in Applied Informatics, University of Macedonia, 2015 – 2018.",
    });
  });

  it("describes a community role like a work role", () => {
    expect(communitySheet(profile.community[0]!)).toMatchObject({
      path: "/community/skgjs",
      title: "Thessaloniki JavaScript Meetup",
      description:
        "Co-organiser at Thessaloniki JavaScript Meetup, Apr 2025 – Present.",
    });
  });

  it("lists every sheet in page order", () => {
    expect(sheetsOf(profile).map((sheet) => sheet.path)).toEqual([
      "/experience/netdata",
      "/experience/adzuna",
      "/experience/skroutz",
      "/experience/epsilonnet",
      "/education/msc-applied-informatics",
      "/education/msc-informatics-and-management",
      "/education/bsc-economic-science",
      "/community/skgjs",
    ]);
  });
});

describe("sheet routes", () => {
  it("lists a group's slugs as static params", () => {
    expect(sheetParams("education")).toEqual([
      { slug: "msc-applied-informatics" },
      { slug: "msc-informatics-and-management" },
      { slug: "bsc-economic-science" },
    ]);
  });

  it("titles, describes and canonicalises a sheet route", () => {
    expect(sheetMetadata("community", "skgjs")).toEqual({
      title: "Thessaloniki JavaScript Meetup",
      description:
        "Co-organiser at Thessaloniki JavaScript Meetup, Apr 2025 – Present.",
      alternates: { canonical: "/community/skgjs" },
    });
  });

  it("treats an unknown slug, or a slug from another group, as not found", () => {
    expect(() => sheetMetadata("experience", "nope")).toThrow();
    expect(() => sheetMetadata("education", "netdata")).toThrow();
  });
});

describe("sheetRoutes", () => {
  it("maps every sheet path to its group's dynamic route (decision 171)", () => {
    const routes = sheetRoutes(profile);
    expect(Object.keys(routes)).toEqual(
      sheetsOf(profile).map((sheet) => sheet.path),
    );
    expect(routes["/experience/netdata"]).toBe("/experience/[slug]");
    expect(routes["/education/bsc-economic-science"]).toBe("/education/[slug]");
    expect(routes["/community/skgjs"]).toBe("/community/[slug]");
  });
});
