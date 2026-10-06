import { expect, test } from "@playwright/test";
import { externalPosts } from "../content/external-posts";
import {
  DARK_BG,
  expectBodyBackground,
  expectNoHorizontalOverflow,
} from "./helpers";

test("home renders the headline and every section without horizontal scroll", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "I build things for the web.",
  );
  for (const name of ["Experience", "Writing", "Say hello"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeAttached();
  }
  for (const name of ["Work", "Education", "Community"]) {
    await expect(page.getByRole("heading", { level: 3, name })).toBeAttached();
  }
  await expectBodyBackground(page, DARK_BG);
  await expectNoHorizontalOverflow(page);
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await expectNoHorizontalOverflow(page);
});

test("the skip link is the first tab stop and targets main content", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator("main#main")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveCSS("outline-style", "solid");
});

test("an experience row expands to reveal its details and collapses again", async ({
  page,
}) => {
  await page.goto("/");
  const row = page.getByRole("button", { name: /Netdata/ });
  await expect(row).toHaveAttribute("aria-expanded", "false");
  const panel = page.locator(`#${await row.getAttribute("aria-controls")}`);
  await expect(panel).toHaveAttribute("inert", "");

  await row.click();
  await expect(row).toHaveAttribute("aria-expanded", "true");
  await expect(panel).not.toHaveAttribute("inert");
  await expect(
    panel.getByRole("link", { name: /netdata\.cloud/ }),
  ).toBeVisible();
  await expect(panel.locator("[data-placeholder]")).toBeVisible();

  await row.click();
  await expect(row).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toHaveAttribute("inert", "");
});

test("education and community rows reveal their links", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /MSc in Applied Informatics/ })
    .click();
  await expect(
    page.getByRole("link", { name: /Thesis \(English\)/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /SKG JS/ }).click();
  await expect(page.getByText(/Organising meetups and talks/)).toBeVisible();
});

test("every post is a tile, newest first, opening off-site in a new tab", async ({
  page,
}) => {
  await page.goto("/");
  const tiles = page.getByRole("list", { name: "All posts" }).getByRole("link");
  await expect(tiles).toHaveCount(externalPosts.length);
  for (const tile of await tiles.all()) {
    await expect(tile).toHaveAttribute("target", "_blank");
    await expect(tile).toHaveAttribute("href", /^https:\/\//);
  }
  const dates = await page
    .getByRole("list", { name: "All posts" })
    .locator("time")
    .evaluateAll((els) => els.map((el) => el.getAttribute("datetime") ?? ""));
  expect(dates).toEqual([...dates].sort().reverse());
  await expect(
    page.getByRole("link", { name: /JS illustrated: The event loop/ }),
  ).toHaveAttribute(
    "href",
    "https://dev.to/kapantzak/js-illustrated-the-event-loop-4mco",
  );
});

test("contact offers a mailto link and social links, with no form", async ({
  page,
}) => {
  await page.goto("/");
  const contact = page.getByRole("region", { name: "Say hello" });
  await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(1);
  await expect(
    contact.getByRole("list", { name: "Elsewhere" }).getByRole("link"),
  ).not.toHaveCount(0);
  await expect(page.locator("main form")).toHaveCount(0);
});

test("reduced motion turns off the scroll-driven animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const names = await page
    .locator("main h1 span, main h2 > span, main li")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
  expect(names.length).toBeGreaterThan(0);
  expect(names.every((name) => name === "none")).toBe(true);
});
