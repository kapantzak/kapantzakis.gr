import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroAurora } from "./HeroAurora";

describe("HeroAurora", () => {
  it("renders its content above a decorative layer of curtains", () => {
    const { container } = render(
      <HeroAurora>
        <h1>Headline</h1>
      </HeroAurora>,
    );
    expect(
      screen.getByRole("heading", { name: "Headline" }),
    ).toBeInTheDocument();
    const layer = container.querySelector("[data-hero-aurora]");
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer?.querySelectorAll("[data-band]")).toHaveLength(4);
  });

  it("offers no controls of its own", () => {
    render(
      <HeroAurora>
        <p>Content</p>
      </HeroAurora>,
    );
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
