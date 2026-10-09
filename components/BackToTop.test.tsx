import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackToTop } from "./BackToTop";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));
const scrollToTop = vi.hoisted(() => vi.fn());
vi.mock("@/lib/scroll-top", () => ({ scrollToTop }));

afterEach(() => {
  scrollToTop.mockClear();
});

describe("BackToTop", () => {
  it("is a button named without its decorative arrow", () => {
    pathname.current = "/";
    render(<BackToTop />);
    expect(screen.getByRole("button")).toHaveAccessibleName("Back to top");
  });

  it("scrolls to the top when pressed", () => {
    pathname.current = "/";
    render(<BackToTop />);
    fireEvent.click(screen.getByRole("button", { name: "Back to top" }));
    expect(scrollToTop).toHaveBeenCalledOnce();
  });

  it("is absent away from the home page", () => {
    pathname.current = "/no-such-page";
    render(<BackToTop />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
