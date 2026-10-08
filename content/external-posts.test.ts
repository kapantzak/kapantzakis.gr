import { describe, expect, it } from "vitest";
import { orderPosts, parsePost } from "@/lib/posts";
import { externalPosts } from "./external-posts";

describe("externalPosts", () => {
  it("contains the 10 DEV.TO, 2 Scalable Path and 2 Skroutz Engineering articles", () => {
    expect(externalPosts.filter((p) => p.source === "DEV.TO")).toHaveLength(10);
    expect(
      externalPosts.filter((p) => p.source === "Scalable Path"),
    ).toHaveLength(2);
    expect(
      externalPosts.filter((p) => p.source === "Skroutz Engineering"),
    ).toHaveLength(2);
  });

  it("every entry is valid and URLs are unique", () => {
    const parsed = externalPosts.map((entry, i) => parsePost(entry, i));
    expect(() => orderPosts(parsed)).not.toThrow();
  });
});
