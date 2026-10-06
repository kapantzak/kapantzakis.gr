import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero, splitHeadline } from "./Hero";

describe("splitHeadline", () => {
  it("splits into two lines, the first one longer when odd", () => {
    expect(splitHeadline("I build things for the web.")).toEqual([
      ["I", "build", "things"],
      ["for", "the", "web."],
    ]);
    expect(splitHeadline("one two three")).toEqual([["one", "two"], ["three"]]);
  });
});

describe("Hero", () => {
  it("keeps the headline readable as one sentence", () => {
    render(
      <Hero
        eyebrow="Role"
        headline="I build things for the web."
        intro={["First.", "Second."]}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /^I build things for the web\.$/,
    );
    expect(screen.getByText("Second.")).toBeInTheDocument();
  });
});
