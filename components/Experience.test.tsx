import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { profile } from "@/content/profile";
import { experienceSheets } from "./Experience";

describe("experienceSheets", () => {
  // Every real entry has a story, so a made-up degree stands in (decisions 100, 205).
  it("gives an entry without a story the three placeholders", () => {
    const sheets = experienceSheets({
      ...profile,
      education: [
        {
          slug: "no-story",
          institution: "University",
          degree: "Degree without a story",
          period: { start: "2001", end: "2006" },
        },
      ],
    });
    const sheet = sheets.find((s) => s.path === "/education/no-story")!;
    const { container } = render(<>{sheet.content}</>);
    expect(container.querySelectorAll("[data-placeholder]")).toHaveLength(3);
  });
});
