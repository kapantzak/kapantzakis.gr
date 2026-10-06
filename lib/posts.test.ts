import { describe, expect, it } from "vitest";
import {
  formatPostDate,
  orderPosts,
  parsePost,
  type Post,
  PostValidationError,
} from "./posts";

const VALID = {
  title: "Elsewhere",
  date: "2019-08-15",
  summary: "An external summary.",
  url: "https://dev.to/example/post",
  source: "DEV",
};

const post = (overrides: Partial<Post> = {}): Post => ({
  ...VALID,
  ...overrides,
});

describe("parsePost", () => {
  it("builds a post from a valid entry", () => {
    expect(parsePost(VALID, 0)).toEqual(post());
  });

  it.each([
    ["a non-object entry", "nope", /entry must be an object/],
    ["a blank title", { ...VALID, title: "  " }, /"title"/],
    ["a missing summary", { ...VALID, summary: undefined }, /"summary"/],
    ["a missing source", { ...VALID, source: "" }, /"source"/],
    ["a non-ISO date", { ...VALID, date: "02/01/2026" }, /"date"/],
    ["an impossible date", { ...VALID, date: "2026-02-30" }, /"date"/],
    ["an out-of-range month", { ...VALID, date: "2026-13-01" }, /"date"/],
  ])("rejects %s", (_, input, message) => {
    expect(() => parsePost(input, 0)).toThrow(message);
  });

  it("rejects non-https URLs and names the offending entry", () => {
    expect(() => parsePost({ ...VALID, url: "http://dev.to/x" }, 3)).toThrow(
      /\[3\].*https/,
    );
  });

  it("throws PostValidationError", () => {
    expect(() => parsePost(undefined, 0)).toThrow(PostValidationError);
  });
});

describe("orderPosts", () => {
  it("sorts newest first", () => {
    const ordered = orderPosts([
      post({ url: "https://a.example/1", date: "2020-01-01" }),
      post({ url: "https://a.example/2", date: "2026-01-01" }),
      post({ url: "https://a.example/3", date: "2023-05-05" }),
    ]);
    expect(ordered.map((p) => p.date)).toEqual([
      "2026-01-01",
      "2023-05-05",
      "2020-01-01",
    ]);
  });

  it("breaks date ties by title", () => {
    const ordered = orderPosts([
      post({ url: "https://a.example/b", title: "B" }),
      post({ url: "https://a.example/a", title: "A" }),
    ]);
    expect(ordered.map((p) => p.title)).toEqual(["A", "B"]);
  });

  it("rejects duplicate URLs", () => {
    expect(() => orderPosts([post(), post()])).toThrow(/Duplicate URL/);
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
