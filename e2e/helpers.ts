import { expect, type Page } from "@playwright/test";

export const DARK_BG = "rgb(11, 13, 18)";
export const PAPER_BG = "rgb(247, 246, 242)";

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow, "page scrolls horizontally").toBeLessThanOrEqual(0);
}

export async function expectBodyBackground(
  page: Page,
  colour: string,
): Promise<void> {
  await expect(page.locator("body")).toHaveCSS("background-color", colour);
}

export const HOME_TITLE = "John Kapantzakis — Senior frontend engineer";

/** Every sheet path and its dialog's accessible name (decision 162). */
export const SHEET_PAGES = [
  { path: "/experience/netdata", name: "Netdata" },
  { path: "/experience/adzuna", name: "Adzuna" },
  { path: "/experience/skroutz", name: "Skroutz" },
  { path: "/experience/epsilonnet", name: "EpsilonNet" },
  {
    path: "/education/msc-applied-informatics",
    name: "MSc in Applied Informatics",
  },
  {
    path: "/education/msc-informatics-and-management",
    name: "MSc in Informatics and Management",
  },
  { path: "/education/bsc-economic-science", name: "BSc in Economic Science" },
  { path: "/community/skgjs", name: "Thessaloniki JavaScript Meetup" },
];
