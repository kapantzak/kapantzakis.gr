import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

function section(id: string): HTMLElement {
  const el = document.createElement("section");
  el.id = id;
  document.body.append(el);
  return el;
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  history.replaceState(null, "", "/");
});

describe("NavLinks", () => {
  it("links to every section of the home page", () => {
    pathname.current = "/";
    render(<NavLinks />);
    expect(
      screen.getAllByRole("link").map((a) => a.getAttribute("href")),
    ).toEqual(["/#experience", "/#writing", "/#contact"]);
  });

  it("marks only the section in view as current", () => {
    pathname.current = "/";
    const observer = stubObserver();
    const writing = section("writing");
    render(<NavLinks />);
    act(() => observer.fire([{ target: writing, isIntersecting: true }]));
    expect(screen.getByRole("link", { name: "Writing" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    for (const name of ["Experience", "Contact"]) {
      expect(screen.getByRole("link", { name })).not.toHaveAttribute(
        "aria-current",
      );
    }
    act(() => observer.fire([{ target: writing, isIntersecting: false }]));
    expect(screen.getByRole("link", { name: "Writing" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("writes the current section into the hash without adding history", () => {
    pathname.current = "/";
    history.replaceState({ key: "router" }, "", "/?q=1");
    const before = history.length;
    const observer = stubObserver();
    const writing = section("writing");
    render(<NavLinks />);
    act(() => observer.fire([{ target: writing, isIntersecting: true }]));
    expect(window.location.hash).toBe("#writing");
    expect(window.location.search).toBe("?q=1");
    expect(history.state).toEqual({ key: "router" });
    expect(history.length).toBe(before);
    act(() => observer.fire([{ target: writing, isIntersecting: false }]));
    expect(window.location.hash).toBe("");
    expect(window.location.search).toBe("?q=1");
  });

  it("keeps the incoming hash until a section becomes current", () => {
    pathname.current = "/";
    history.replaceState(null, "", "/#contact");
    const observer = stubObserver();
    const experience = section("experience");
    render(<NavLinks />);
    expect(window.location.hash).toBe("#contact");
    act(() => observer.fire([{ target: experience, isIntersecting: false }]));
    expect(window.location.hash).toBe("#contact");
  });

  it("does not carry a stale section back to the home page", () => {
    pathname.current = "/";
    const observer = stubObserver();
    const experience = section("experience");
    const { rerender } = render(<NavLinks />);
    act(() => observer.fire([{ target: experience, isIntersecting: true }]));
    pathname.current = "/no-such-page";
    rerender(<NavLinks />);
    pathname.current = "/";
    history.replaceState(null, "", "/#writing");
    rerender(<NavLinks />);
    expect(window.location.hash).toBe("#writing");
    expect(
      screen.getByRole("link", { name: "Experience" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("marks nothing and leaves the hash alone away from the home page", () => {
    pathname.current = "/no-such-page";
    history.replaceState(null, "", "/no-such-page#top");
    render(<NavLinks />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
    expect(window.location.hash).toBe("#top");
  });
});
