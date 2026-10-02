import { describe, expect, it } from "vitest";
import {
  type ExternalPost,
  formatPostDate,
  type LocalPost,
  mergePosts,
  parseExternalPost,
  parseLocalPost,
  PostValidationError,
  selectVisible,
} from "./posts";

const VALID_META = {
  title: "Hello",
  date: "2026-01-02",
  summary: "A summary.",
};

const local = (overrides: Partial<LocalPost> = {}): LocalPost => ({
  kind: "local",
  slug: "hello",
  title: "Hello",
  date: "2026-01-02",
  summary: "A summary.",
  draft: false,
  ...overrides,
});

const external = (overrides: Partial<ExternalPost> = {}): ExternalPost => ({
  kind: "external",
  url: "https://dev.to/example/post",
  source: "DEV",
  title: "Elsewhere",
  date: "2019-08-15",
  summary: "An external summary.",
  ...overrides,
});

describe("parseLocalPost", () => {
  it("builds a local post from valid metadata", () => {
    expect(parseLocalPost("hello", VALID_META)).toEqual(local());
  });

  it("reads an explicit draft flag", () => {
    expect(parseLocalPost("hello", { ...VALID_META, draft: true }).draft).toBe(
      true,
    );
  });

  it.each([
    ["missing metadata", undefined, /metadata export is missing/],
    ["blank title", { ...VALID_META, title: "  " }, /"title"/],
    ["missing summary", { title: "Hello", date: "2026-01-02" }, /"summary"/],
    ["non-ISO date", { ...VALID_META, date: "02/01/2026" }, /"date"/],
    ["impossible date", { ...VALID_META, date: "2026-02-30" }, /"date"/],
    ["out-of-range month", { ...VALID_META, date: "2026-13-01" }, /"date"/],
    ["non-boolean draft", { ...VALID_META, draft: "yes" }, /"draft"/],
  ])("rejects %s", (_, metadata, message) => {
    expect(() => parseLocalPost("hello", metadata)).toThrow(message);
  });

  it("names the offending file in errors", () => {
    expect(() => parseLocalPost("hello", { ...VALID_META, title: "" })).toThrow(
      /content\/posts\/hello\.mdx/,
    );
  });

  it("rejects slugs that are not lowercase kebab-case", () => {
    expect(() => parseLocalPost("Hello_World", VALID_META)).toThrow(/slug/);
  });

  it("throws PostValidationError", () => {
    expect(() => parseLocalPost("hello", undefined)).toThrow(
      PostValidationError,
    );
  });
});

describe("parseExternalPost", () => {
  const input = {
    title: "Elsewhere",
    date: "2019-08-15",
    summary: "An external summary.",
    url: "https://dev.to/example/post",
    source: "DEV",
  };

  it("builds an external post", () => {
    expect(parseExternalPost(input, 0)).toEqual(external());
  });

  it("rejects non-https URLs", () => {
    expect(() =>
      parseExternalPost({ ...input, url: "http://dev.to/x" }, 3),
    ).toThrow(/\[3\].*https/);
  });

  it("rejects a missing source", () => {
    expect(() => parseExternalPost({ ...input, source: "" }, 0)).toThrow(
      /"source"/,
    );
  });
});

describe("mergePosts", () => {
  it("sorts newest first across local and external posts", () => {
    const merged = mergePosts(
      [
        local({ slug: "older", date: "2020-01-01" }),
        local({ slug: "newer", date: "2026-01-01" }),
      ],
      [external({ date: "2023-05-05" })],
    );
    expect(merged.map((p) => p.date)).toEqual([
      "2026-01-01",
      "2023-05-05",
      "2020-01-01",
    ]);
  });

  it("breaks date ties by title", () => {
    const merged = mergePosts(
      [local({ slug: "b", title: "B" }), local({ slug: "a", title: "A" })],
      [],
    );
    expect(merged.map((p) => p.title)).toEqual(["A", "B"]);
  });

  it("rejects duplicate slugs", () => {
    expect(() => mergePosts([local(), local()], [])).toThrow(
      /Duplicate slug: hello/,
    );
  });

  it("rejects duplicate external URLs", () => {
    expect(() => mergePosts([], [external(), external()])).toThrow(
      /Duplicate external URL/,
    );
  });
});

describe("selectVisible", () => {
  const posts = [local({ slug: "live" }), local({ slug: "wip", draft: true })];

  it("hides drafts by default", () => {
    expect(selectVisible(posts, false).map((p) => p.slug)).toEqual(["live"]);
  });

  it("keeps drafts when requested", () => {
    expect(selectVisible(posts, true).map((p) => p.slug)).toEqual([
      "live",
      "wip",
    ]);
  });
});

describe("formatPostDate", () => {
  it("formats as day, short month, year", () => {
    expect(formatPostDate("2019-08-15")).toBe("15 Aug 2019");
  });

  it("does not shift the day across time zones", () => {
    expect(formatPostDate("2020-01-01")).toBe("1 Jan 2020");
  });

  it("uses three-letter month abbreviations for every month", () => {
    expect(formatPostDate("2019-09-16")).toBe("16 Sep 2019");
    expect(formatPostDate("2021-06-30")).toBe("30 Jun 2021");
  });
});
