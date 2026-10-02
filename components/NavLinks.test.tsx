import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavLinks } from "./NavLinks";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("NavLinks", () => {
  it("marks only the current section with aria-current", () => {
    pathname.current = "/posts/hello";
    render(<NavLinks />);
    expect(screen.getByRole("link", { name: "Posts" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    for (const name of ["Home", "About", "Contact"]) {
      expect(screen.getByRole("link", { name })).not.toHaveAttribute(
        "aria-current",
      );
    }
  });

  it("links to every route", () => {
    pathname.current = "/";
    render(<NavLinks />);
    expect(
      screen.getAllByRole("link").map((a) => a.getAttribute("href")),
    ).toEqual(["/", "/about", "/posts", "/contact"]);
  });
});
