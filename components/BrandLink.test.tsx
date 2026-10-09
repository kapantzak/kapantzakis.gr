import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BrandLink } from "./BrandLink";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));
const scrollToTop = vi.hoisted(() => vi.fn());
vi.mock("@/lib/scroll-top", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/scroll-top")>()),
  scrollToTop,
}));

afterEach(() => {
  scrollToTop.mockClear();
});

function renderLink() {
  render(<BrandLink>John Kapantzakis</BrandLink>);
  return screen.getByRole("link", { name: "John Kapantzakis" });
}

describe("BrandLink", () => {
  it("links home and is the focus target after scrolling up", () => {
    const link = renderLink();
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveAttribute("id", "brand-link");
  });

  it("scrolls to the top on the home page instead of navigating", () => {
    pathname.current = "/";
    const notPrevented = fireEvent.click(renderLink());
    expect(notPrevented).toBe(false);
    expect(scrollToTop).toHaveBeenCalledOnce();
  });

  it.each(["metaKey", "ctrlKey", "shiftKey", "altKey"])(
    "leaves a %s click to the browser",
    (key) => {
      pathname.current = "/";
      fireEvent.click(renderLink(), { [key]: true });
      expect(scrollToTop).not.toHaveBeenCalled();
    },
  );

  it("leaves navigation to the link away from the home page", () => {
    pathname.current = "/no-such-page";
    const link = renderLink();
    // Keeps jsdom and the router from navigating; only the handler's choice is under test.
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(scrollToTop).not.toHaveBeenCalled();
  });
});
