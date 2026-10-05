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

  it("marks nothing away from the home page", () => {
    pathname.current = "/no-such-page";
    render(<NavLinks />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });
});
