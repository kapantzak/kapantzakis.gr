import { describe, expect, it } from "vitest";
import { profile } from "./profile";

function allUrls(): string[] {
  return [
    ...profile.experience.flatMap((r) => (r.orgUrl ? [r.orgUrl] : [])),
    ...profile.education.flatMap((d) => (d.program ? [d.program.url] : [])),
    ...profile.education.flatMap((d) => (d.thesis ? [d.thesis.url] : [])),
    ...profile.community.map((c) => c.orgUrl),
    ...profile.social.map((s) => s.url),
  ];
}

describe("profile", () => {
  it("has every user-input token filled in", () => {
    expect(JSON.stringify(profile)).not.toMatch(/\{\{[A-Z0-9_]+\}\}/);
  });

  it("uses https for every link", () => {
    for (const url of allUrls()) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("lists exactly one current role, first", () => {
    expect(
      profile.experience.filter((r) => r.period.end === undefined),
    ).toHaveLength(1);
    expect(profile.experience[0]?.period.end).toBeUndefined();
  });

  it("has a plausible contact email", () => {
    expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("has intro copy for the hero", () => {
    expect(profile.intro.length).toBeGreaterThan(0);
  });
});
