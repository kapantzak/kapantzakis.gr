import { afterEach, describe, expect, it, vi } from "vitest";
import { BRAND_LINK_ID, scrollToTop } from "./scroll-top";

afterEach(() => {
  vi.restoreAllMocks();
  history.replaceState(null, "", "/");
  document.body.replaceChildren();
});

describe("scrollToTop", () => {
  it("scrolls to the top and leaves smoothness to CSS", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    scrollToTop();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  it("returns a section path or hash to /, with a plain state object (decision 174)", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    history.replaceState({ key: "router" }, "", "/writing?q=1#top");
    scrollToTop();
    expect(window.location.pathname + window.location.search).toBe("/?q=1");
    expect(window.location.hash).toBe("");
    expect(history.state).toEqual({});
  });

  it("leaves the history entry alone when the URL is already /", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    history.replaceState({ key: "router" }, "", "/");
    scrollToTop();
    expect(history.state).toEqual({ key: "router" });
  });

  it("moves focus to the logo link without scrolling again", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const link = document.createElement("a");
    link.id = BRAND_LINK_ID;
    link.href = "/";
    document.body.append(link);
    const focus = vi.spyOn(link, "focus");
    scrollToTop();
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(document.activeElement).toBe(link);
  });
});
