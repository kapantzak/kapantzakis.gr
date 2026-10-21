import { describe, expect, it } from "vitest";
import cv from "./content.json";
import { renderCv, renderDocument } from "./template.mjs";

describe("renderCv", () => {
  it("wraps the CV in .cv, sections in the CV's order (CV design decision 9)", () => {
    const html = renderCv(cv);
    expect(html.startsWith('<div class="cv">')).toBe(true);
    const h2 = [...html.matchAll(/<h2>(.*?)<\/h2>/g)].map((m) => m[1]);
    expect(h2).toEqual([
      "Experience",
      "Open Source &amp; Community",
      "Selected Writing",
      "Skills",
      "Education",
    ]);
  });

  it("escapes content", () => {
    const html = renderCv({ ...cv, summary: `a & b <i>"x"</i>` });
    expect(html).toContain("a &amp; b &lt;i&gt;&quot;x&quot;&lt;/i&gt;");
  });
});

describe("renderDocument", () => {
  it("wraps the fragment in a full document whose base resolves the fonts", () => {
    const html = renderDocument(cv, "p{}", "file:///repo/cv/");
    expect(html).toContain('<base href="file:///repo/cv/">');
    expect(html).toContain("<style>p{}</style>");
    expect(html).toContain(`<main>${renderCv(cv)}</main>`);
  });
});
