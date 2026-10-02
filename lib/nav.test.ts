import { describe, expect, it } from "vitest";
import { isActive, NAV_ITEMS } from "./nav";

describe("NAV_ITEMS", () => {
  it("lists the four routes in order", () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual([
      "/",
      "/about",
      "/posts",
      "/contact",
    ]);
  });
});

describe("isActive", () => {
  it("matches Home only on the root path", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/", "/about")).toBe(false);
  });

  it("matches a section and its children", () => {
    expect(isActive("/posts", "/posts")).toBe(true);
    expect(isActive("/posts", "/posts/hello")).toBe(true);
  });

  it("does not match a different route that shares a prefix", () => {
    expect(isActive("/posts", "/postscript")).toBe(false);
  });
});
