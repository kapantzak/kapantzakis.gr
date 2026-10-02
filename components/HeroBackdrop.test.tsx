import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroBackdrop } from "./HeroBackdrop";

describe("HeroBackdrop", () => {
  it("renders its content above a decorative glyph layer", () => {
    const { container } = render(
      <HeroBackdrop>
        <h1>Headline</h1>
      </HeroBackdrop>,
    );
    expect(
      screen.getByRole("heading", { name: "Headline" }),
    ).toBeInTheDocument();
    const layer = container.querySelector("[data-hero-backdrop]");
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer?.querySelectorAll("[data-glyph]")).toHaveLength(12);
  });

  it("offers a pause toggle whose label does not change with its state", () => {
    render(
      <HeroBackdrop>
        <p>Content</p>
      </HeroBackdrop>,
    );
    const toggle = screen.getByRole("checkbox", { name: "Pause motion" });
    expect(toggle).not.toBeChecked();
    toggle.click();
    expect(
      screen.getByRole("checkbox", { name: "Pause motion" }),
    ).toBeChecked();
  });
});
