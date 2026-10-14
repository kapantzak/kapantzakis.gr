import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavLinks } from "./NavLinks";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

function stubObserver(): { fire: Callback } {
  let callback: Callback = () => {};
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: Callback) {
        callback = cb;
      }
      observe() {}
      disconnect() {}
    },
  );
  return { fire: (entries) => callback(entries) };
}

function region(id: string): HTMLElement {
  const el = document.createElement("section");
  el.id = id;
  document.body.append(el);
  return el;
}

/** As if the browser had loaded the page on `path`. */
function loadAt(path: string) {
  pathname.current = path;
  history.replaceState(null, "", path);
}

/** The labels of the links marked current. */
function current(): string[] {
  return screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current") === "true")
    .map((link) => link.textContent ?? "");
}

beforeEach(() => {
  // The release from decision 184's hold waits a frame; run it at once.
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  history.replaceState(null, "", "/");
});

describe("NavLinks", () => {
  it("links to every section's path (decision 175)", () => {
    loadAt("/");
    render(<NavLinks />);
    expect(
      screen.getAllByRole("link").map((a) => a.getAttribute("href")),
    ).toEqual(["/experience", "/writing", "/contact"]);
  });

  it("marks only the section in view as current", () => {
    loadAt("/");
    const observer = stubObserver();
    const writing = region("writing");
    render(<NavLinks />);
    act(() => observer.fire([{ target: writing, isIntersecting: true }]));
    expect(current()).toEqual(["Writing"]);
    act(() => observer.fire([{ target: writing, isIntersecting: false }]));
    expect(current()).toEqual([]);
  });

  it("writes the current region into the path without adding history (decision 174)", () => {
    loadAt("/");
    history.replaceState({ key: "router" }, "", "/?q=1#top");
    const before = history.length;
    const observer = stubObserver();
    const writing = region("writing");
    render(<NavLinks />);
    act(() => observer.fire([{ target: writing, isIntersecting: true }]));
    expect(window.location.pathname).toBe("/writing");
    expect(window.location.search).toBe("?q=1");
    expect(window.location.hash).toBe("");
    expect(history.state).toEqual({});
    expect(history.length).toBe(before);
    act(() => observer.fire([{ target: writing, isIntersecting: false }]));
    expect(window.location.pathname).toBe("/");
  });

  it("prefers a group inside Experience, and marks Experience for it (decisions 174, 181)", () => {
    loadAt("/");
    const observer = stubObserver();
    const experience = region("experience");
    const education = region("education");
    render(<NavLinks />);
    act(() =>
      observer.fire([
        { target: experience, isIntersecting: true },
        { target: education, isIntersecting: true },
      ]),
    );
    expect(window.location.pathname).toBe("/education");
    expect(current()).toEqual(["Experience"]);
    act(() => observer.fire([{ target: education, isIntersecting: false }]));
    expect(window.location.pathname).toBe("/experience");
  });

  it("keeps the path a page arrived on, and marks its section, until the first scroll (decision 184)", () => {
    loadAt("/community");
    const observer = stubObserver();
    const community = region("community");
    const writing = region("writing");
    render(<NavLinks />);
    expect(current()).toEqual(["Experience"]);
    act(() =>
      observer.fire([
        { target: community, isIntersecting: false },
        { target: writing, isIntersecting: true },
      ]),
    );
    expect(window.location.pathname).toBe("/community");
    expect(current()).toEqual(["Experience"]);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(window.location.pathname).toBe("/writing");
    expect(current()).toEqual(["Writing"]);
  });

  it("after the first scroll, an empty band gives / (decisions 174, 184)", () => {
    loadAt("/writing");
    const observer = stubObserver();
    const writing = region("writing");
    render(<NavLinks />);
    act(() => observer.fire([{ target: writing, isIntersecting: false }]));
    expect(window.location.pathname).toBe("/writing");
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(window.location.pathname).toBe("/");
    expect(current()).toEqual([]);
  });

  it("keeps an incoming hash until a region becomes current", () => {
    loadAt("/");
    history.replaceState(null, "", "/#contact");
    const observer = stubObserver();
    const experience = region("experience");
    render(<NavLinks />);
    act(() => observer.fire([{ target: experience, isIntersecting: false }]));
    expect(window.location.hash).toBe("#contact");
  });

  it("does not carry a stale region back to the home page", () => {
    loadAt("/");
    const observer = stubObserver();
    const experience = region("experience");
    const { rerender } = render(<NavLinks />);
    act(() => observer.fire([{ target: experience, isIntersecting: true }]));
    loadAt("/no-such-page");
    rerender(<NavLinks />);
    loadAt("/");
    rerender(<NavLinks />);
    expect(window.location.pathname).toBe("/");
    expect(current()).toEqual([]);
  });

  it.each(["/no-such-page", "/experience/netdata"])(
    "marks nothing and leaves the URL alone away from the home page (%s)",
    (path) => {
      loadAt(path);
      history.replaceState(null, "", `${path}#top`);
      render(<NavLinks />);
      expect(current()).toEqual([]);
      expect(window.location.pathname + window.location.hash).toBe(
        `${path}#top`,
      );
    },
  );
});
