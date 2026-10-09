import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Contribution, Story } from "@/content/profile";
import { RoleStory } from "./RoleStory";

const IMAGE = { src: "/dashboard.png", width: 1919, height: 1079 };

const CONTRIBUTIONS: Contribution[] = [
  { title: "First", body: "One.", image: IMAGE, tint: "#dff3e4" },
  { title: "Second", body: "Two.", image: IMAGE, tint: "#d7eeee" },
  { title: "Third", body: "Three.", image: IMAGE, tint: "#e9f3d6" },
];

const STORY: Story = {
  intro: [
    { label: "Acme", text: "Acme makes things." },
    { label: "My role", text: "I build the frontend." },
  ],
  contributions: CONTRIBUTIONS,
};

const TIMELINE: NonNullable<Story["timeline"]> = {
  heading: "From intern to lead",
  stages: [
    { title: "Intern", body: "Fixed bugs.", tags: ["HTML", "CSS"] },
    { title: "Lead", body: "Led the team.", tags: ["TypeScript"] },
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
      CONTRIBUTIONS.map((c) => c.tint),
    );
  });

  it("lists a contribution's links under its text, opening in a new tab (decision 111)", () => {
    const story: Story = {
      ...STORY,
      contributions: [
        {
          ...CONTRIBUTIONS[0]!,
          links: [
            {
              label: "PR #1 on GitHub",
              url: "https://github.com/acme/x/pull/1",
            },
            { label: "Release notes", url: "https://acme.example/release" },
          ],
        },
        CONTRIBUTIONS[1]!,
      ],
    };
    const { container } = render(<RoleStory story={story} />);
    const panels = container.querySelectorAll("li[data-side]");
    const links = within(panels[0] as HTMLElement).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "PR #1 on GitHub ↗",
      "Release notes ↗",
    ]);
    expect(links[0]).toHaveAttribute(
      "href",
      "https://github.com/acme/x/pull/1",
    );
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(
      within(panels[1] as HTMLElement).queryAllByRole("link"),
    ).toHaveLength(0);
  });

  it("keeps the screenshots decorative (decision 105)", () => {
    const { container } = render(<RoleStory story={STORY} />);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(CONTRIBUTIONS.length);
    for (const img of images) {
      expect(img).toHaveAttribute("alt", "");
      expect(img.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it("lists the timeline's stages in order, each with its tags, after the contributions (decisions 128–131)", () => {
    const { container } = render(
      <RoleStory story={{ ...STORY, timeline: TIMELINE }} />,
    );
    const region = screen.getByRole("region", { name: TIMELINE.heading });
    const contributions = screen.getByRole("region", {
      name: "Selected contributions",
    });
    expect(
      contributions.compareDocumentPosition(region) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const stages = region.querySelectorAll(":scope > ol > li");
    expect(
      Array.from(stages, (stage) =>
        within(stage as HTMLElement).getByRole("heading", { level: 4 }),
      ).map((heading) => heading.textContent),
    ).toEqual(["Intern", "Lead"]);
    expect(stages[0]).toHaveTextContent("Fixed bugs.");
    const tags = within(stages[0] as HTMLElement).getByRole("list", {
      name: "Technologies",
    });
    expect(
      within(tags)
        .getAllByRole("listitem")
        .map((tag) => tag.textContent),
    ).toEqual(["HTML", "CSS"]);
    expect(container.querySelectorAll("li[data-side]")).toHaveLength(
      CONTRIBUTIONS.length,
    );
  });

  it("renders a timeline without contributions, and contributions without a timeline", () => {
    const { unmount } = render(
      <RoleStory story={{ intro: STORY.intro, timeline: TIMELINE }} />,
    );
    expect(
      screen.queryByRole("region", { name: "Selected contributions" }),
    ).toBeNull();
    expect(
      screen.getByRole("region", { name: TIMELINE.heading }),
    ).toBeInTheDocument();
    unmount();

    render(<RoleStory story={STORY} />);
    expect(screen.getAllByRole("region")).toHaveLength(1);
  });
});
