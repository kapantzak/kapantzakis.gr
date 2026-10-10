import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SectionLink } from "./SectionLink";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

function renderLink() {
  render(<SectionLink id="writing">Writing</SectionLink>);
  const region = document.createElement("section");
  region.id = "writing";
  region.scrollIntoView = vi.fn();
  document.body.append(region);
  return { link: screen.getByRole("link", { name: "Writing" }), region };
}

afterEach(() => {
  document.body.replaceChildren();
  history.replaceState(null, "", "/");
});

describe("SectionLink", () => {
  it("links to its region's path", () => {
    expect(renderLink().link).toHaveAttribute("href", "/writing");
  });

  it("on the home page, pushes the path and scrolls to the region (decision 175)", () => {
    pathname.current = "/";
    const before = history.length;
    const { link, region } = renderLink();
    expect(fireEvent.click(link)).toBe(false);
    expect(window.location.pathname).toBe("/writing");
    expect(history.length).toBe(before + 1);
    expect(region.scrollIntoView).toHaveBeenCalledWith();
  });

  it("adds no history entry when the path is already the URL", () => {
    pathname.current = "/writing";
    history.replaceState(null, "", "/writing");
    const before = history.length;
    const { link, region } = renderLink();
    fireEvent.click(link);
    expect(history.length).toBe(before);
    expect(history.state).toEqual({});
    expect(region.scrollIntoView).toHaveBeenCalledOnce();
  });

  it.each(["metaKey", "ctrlKey", "shiftKey", "altKey"])(
    "leaves a %s click to the browser",
    (key) => {
      pathname.current = "/";
      const { link, region } = renderLink();
      // Keeps jsdom and the router from navigating; only the handler's choice is under test.
      link.addEventListener("click", (event) => event.preventDefault());
      fireEvent.click(link, { [key]: true });
      expect(window.location.pathname).toBe("/");
      expect(region.scrollIntoView).not.toHaveBeenCalled();
    },
  );

  it("leaves navigation to the link away from the home page", () => {
    pathname.current = "/no-such-page";
    const { link, region } = renderLink();
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(region.scrollIntoView).not.toHaveBeenCalled();
  });
});
