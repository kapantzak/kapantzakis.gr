import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Post } from "@/lib/posts";
import { PostList } from "./PostList";

const posts: Post[] = [
  {
    url: "https://www.scalablepath.com/blog/flow",
    source: "Scalable Path",
    title: "Flow",
    date: "2020-07-16",
    summary: "Flow summary",
  },
  {
    url: "https://dev.to/kapantzak/event-loop",
    source: "DEV.TO",
    title: "Event loop",
    date: "2019-08-15",
    summary: "External summary",
  },
];

describe("PostList", () => {
  it("is a labelled ordered list with one tile per post", () => {
    render(<PostList posts={posts} label="All posts" />);
    const list = screen.getByRole("list", { name: "All posts" });
    expect(list.tagName).toBe("OL");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });

  it("opens every post in a new tab and says so", () => {
    render(<PostList posts={posts} label="All posts" />);
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(
      posts.map((p) => p.url),
    );
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveAccessibleName(/\(opens in a new tab\)$/);
    }
  });

  it("names the source and shows readable dates with machine-readable datetime", () => {
    render(<PostList posts={posts} label="All posts" />);
    expect(screen.getByRole("link", { name: /Event loop/ })).toHaveTextContent(
      "DEV.TO",
    );
    expect(screen.getByText("15 Aug 2019")).toHaveAttribute(
      "dateTime",
      "2019-08-15",
    );
  });
});
