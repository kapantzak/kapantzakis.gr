import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline, type TimelineEntry } from "./Timeline";

const entries: TimelineEntry[] = [
  {
    id: "acme",
    period: { start: "Feb 2022" },
    title: "Engineer",
    org: "Acme",
    orgUrl: "https://acme.example/",
    meta: "React · Next.js",
  },
  {
    id: "uni",
    period: { start: "2015", end: "2018" },
    title: "MSc",
    org: "University",
    description: "Applied informatics.",
    link: { label: "Thesis", url: "https://uni.example/thesis.pdf" },
  },
];

describe("Timeline", () => {
  it("renders one item per entry with formatted periods", () => {
    render(<Timeline entries={entries} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Feb 2022 – Present")).toBeInTheDocument();
    expect(screen.getByText("2015 – 2018")).toBeInTheDocument();
  });

  it("links the organisation when a URL is given", () => {
    render(<Timeline entries={entries} />);
    expect(screen.getByRole("link", { name: "Acme" })).toHaveAttribute(
      "href",
      "https://acme.example/",
    );
    expect(screen.queryByRole("link", { name: "University" })).toBeNull();
    expect(screen.getByText("University")).toBeInTheDocument();
  });

  it("renders optional meta, description and link only when present", () => {
    render(<Timeline entries={entries} />);
    expect(screen.getByText("React · Next.js")).toBeInTheDocument();
    expect(screen.getByText("Applied informatics.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Thesis" })).toHaveAttribute(
      "target",
      "_blank",
    );
  });
});
