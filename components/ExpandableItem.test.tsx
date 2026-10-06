import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExpandableItem } from "./ExpandableItem";

function renderItem() {
  return render(
    <ol>
      <ExpandableItem
        period="Feb 2023 – Present"
        title="Netdata"
        subtitle="Senior software engineer"
      >
        <a href="https://example.com/">Details link</a>
      </ExpandableItem>
    </ol>,
  );
}

describe("ExpandableItem", () => {
  it("is a collapsed disclosure button inside a heading", () => {
    renderItem();
    const button = screen.getByRole("button", { name: /Netdata/ });
    expect(button.closest("h4")).not.toBeNull();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the closed panel out of reach and opens it on click", () => {
    renderItem();
    const button = screen.getByRole("button", { name: /Netdata/ });
    const panel = document.getElementById(
      button.getAttribute("aria-controls")!,
    )!;
    expect(panel).toHaveAttribute("inert");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("inert");
    expect(screen.getByRole("region", { name: /Netdata/ })).toBe(panel);

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("inert");
  });
});
