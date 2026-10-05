import { describe, expect, it } from "vitest";
import { orderPosts, parsePost } from "@/lib/posts";
import { externalPosts } from "./external-posts";

describe("externalPosts", () => {
  it("contains the 10 DEV articles and the Scalable Path article", () => {
    expect(externalPosts.filter((p) => p.source === "DEV")).toHaveLength(10);
    expect(
      externalPosts.filter((p) => p.source === "Scalable Path"),
    ).toHaveLength(1);
  });

  it("every entry is valid and URLs are unique", () => {
    const parsed = externalPosts.map((entry, i) => parsePost(entry, i));
    expect(() => orderPosts(parsed)).not.toThrow();
  });
});
