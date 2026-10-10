import { describe, expect, it } from "vitest";
import { HOME_TITLE, TITLE_TEMPLATE, pageTitle } from "./titles";

describe("titles", () => {
  it("names the home page after the owner and role", () => {
    expect(HOME_TITLE).toBe("John Kapantzakis — Senior frontend engineer");
  });

  it("titles other pages through the site template", () => {
    expect(TITLE_TEMPLATE).toBe("%s — John Kapantzakis");
    expect(pageTitle("Netdata")).toBe("Netdata — John Kapantzakis");
  });
});
