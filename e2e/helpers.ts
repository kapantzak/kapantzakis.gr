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

export const HOME_TITLE = "John Kapantzakis — Senior software engineer";

/** Every sheet path and its dialog's accessible name (decision 162). */
export const SHEET_PAGES = [
  { path: "/experience/netdata", name: "Netdata" },
  { path: "/experience/adzuna", name: "Adzuna" },
  { path: "/experience/skroutz", name: "Skroutz" },
  { path: "/experience/epsilonnet", name: "EpsilonNet" },
  { path: "/projects/hoohooli", name: "hoohooli.gr" },
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

/** Every section path and the element it lands on (decision 173). */
export const REGION_PAGES = [
  { path: "/experience", id: "experience" },
  { path: "/projects", id: "projects" },
  { path: "/education", id: "education" },
  { path: "/community", id: "community" },
  { path: "/writing", id: "writing" },
  { path: "/contact", id: "contact" },
];

type PageView = { page_location: string; page_title: string };

/** The page views queued for gtag; the fixture blocks its script, so they stay in `dataLayer`. */
function queuedViews(page: Page): Promise<PageView[]> {
  return page.evaluate(() =>
    ((window as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? [])
      .map((entry) => Array.from(entry))
      .filter(([command, name]) => command === "event" && name === "page_view")
      .map(([, , params]) => params as PageView),
  );
}

/** The paths of the page views sent so far. */
export async function pageviews(page: Page): Promise<string[]> {
  return (await queuedViews(page)).map(
    (view) => new URL(view.page_location).pathname,
  );
}

/** The tab titles the page views carried. */
export async function pageviewTitles(page: Page): Promise<string[]> {
  return (await queuedViews(page)).map((view) => view.page_title);
}

/** The deployment has a GA ID: the server renders Cookie settings only then (decision 222). */
export async function analyticsEnabled(page: Page): Promise<boolean> {
  return (
    (await page.getByRole("button", { name: "Cookie settings" }).count()) > 0
  );
}
