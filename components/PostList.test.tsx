import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Post } from "@/lib/posts";
import { PostList } from "./PostList";

const posts: Post[] = [
  {
    kind: "local",
    slug: "new-site",
    title: "New site",
    date: "2026-01-02",
    summary: "Local summary",
    draft: false,
  },
  {
    kind: "external",
    url: "https://dev.to/kapantzak/event-loop",
    source: "DEV",
    title: "Event loop",
    date: "2019-08-15",
    summary: "External summary",
  },
];

describe("PostList", () => {
  it("is a labelled ordered list with one item per post", () => {
    render(<PostList posts={posts} label="All posts" headingLevel={2} />);
    const list = screen.getByRole("list", { name: "All posts" });
    expect(list.tagName).toBe("OL");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("links local posts to their page in the same tab", () => {
    render(<PostList posts={posts} label="All posts" headingLevel={2} />);
    const link = screen.getByRole("link", { name: "New site" });
    expect(link).toHaveAttribute("href", "/posts/new-site");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens external posts in a new tab and names the source", () => {
    render(<PostList posts={posts} label="All posts" headingLevel={2} />);
    const link = screen.getByRole("link", { name: "Event loop on DEV" });
    expect(link).toHaveAttribute("href", "https://dev.to/kapantzak/event-loop");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows readable dates with machine-readable datetime", () => {
    render(<PostList posts={posts} label="All posts" headingLevel={2} />);
    expect(screen.getByText("15 Aug 2019")).toHaveAttribute(
      "dateTime",
      "2019-08-15",
    );
  });

  it("uses the requested heading level", () => {
    render(<PostList posts={posts} label="Latest posts" headingLevel={3} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });
});
