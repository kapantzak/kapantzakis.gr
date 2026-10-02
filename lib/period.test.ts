import { describe, expect, it } from "vitest";
import { formatPeriod } from "./period";

describe("formatPeriod", () => {
  it("joins start and end with an en dash", () => {
    expect(formatPeriod({ start: "Jun 2020", end: "Jan 2022" })).toBe(
      "Jun 2020 – Jan 2022",
    );
  });

  it("shows Present for an open period", () => {
    expect(formatPeriod({ start: "Feb 2022" })).toBe("Feb 2022 – Present");
  });
});
