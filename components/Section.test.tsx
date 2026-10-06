import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Section } from "./Section";

describe("Section", () => {
  it("is a landmark named by its title alone, despite the decorative repeats", () => {
    render(
      <Section id="writing" index="02" title="Writing">
        <p>Body</p>
      </Section>,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveAccessibleName("Writing");
    expect(screen.getByRole("region", { name: "Writing" })).toHaveAttribute(
      "id",
      "writing",
    );
  });
});
