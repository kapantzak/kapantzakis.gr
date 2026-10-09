import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Story } from "@/content/profile";
import { RoleStory } from "./RoleStory";

const IMAGE = { src: "/dashboard.png", width: 1919, height: 1079 };

const STORY: Story = {
  intro: [
    { label: "Acme", text: "Acme makes things." },
    { label: "My role", text: "I build the frontend." },
  ],
  contributions: [
    { title: "First", body: "One.", image: IMAGE, tint: "#dff3e4" },
    { title: "Second", body: "Two.", image: IMAGE, tint: "#d7eeee" },
    { title: "Third", body: "Three.", image: IMAGE, tint: "#e9f3d6" },
  ],
};

describe("RoleStory", () => {
  it("labels each intro paragraph with its own heading", () => {
    render(<RoleStory story={STORY} />);
    for (const part of STORY.intro) {
      const heading = screen.getByRole("heading", {
        level: 3,
        name: part.label,
      });
      expect(heading.parentElement).toHaveTextContent(part.text);
    }
  });

  it("lists the contributions in order under a named region", () => {
    render(<RoleStory story={STORY} />);
    const region = screen.getByRole("region", {
      name: "Selected contributions",
    });
    const items = within(region).getAllByRole("listitem");
    expect(
      items.map(
        (item) => within(item).getByRole("heading", { level: 4 }).textContent,
      ),
    ).toEqual(["First", "Second", "Third"]);
    expect(items[1]).toHaveTextContent("Two.");
  });

  it("alternates the screenshot's side and gives each panel its own tint (decisions 103, 104)", () => {
    render(<RoleStory story={STORY} />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.dataset.side)).toEqual([
      "left",
      "right",
      "left",
    ]);
    expect(items.map((item) => item.style.getPropertyValue("--tint"))).toEqual(
      STORY.contributions.map((c) => c.tint),
    );
  });

  it("keeps the screenshots decorative (decision 105)", () => {
    const { container } = render(<RoleStory story={STORY} />);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(STORY.contributions.length);
    for (const img of images) {
      expect(img).toHaveAttribute("alt", "");
      expect(img.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });
});
