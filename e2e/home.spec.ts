import { expect, test } from "@playwright/test";
import {
  DARK_BG,
  expectBodyBackground,
  expectNoHorizontalOverflow,
} from "./helpers";

test("home renders the headline on the dark theme without horizontal scroll", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "I build things for the web.",
  );
  await expectBodyBackground(page, DARK_BG);
  await expectNoHorizontalOverflow(page);
});

test("home is marked as the current page in the main nav", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute(
    "aria-current",
    "page",
  );
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

test("home shows the three latest posts and links onward", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 2, name: "Latest writing" }),
  ).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Latest posts" }).getByRole("listitem"),
  ).toHaveCount(3);
  await page.getByRole("link", { name: "All posts" }).click();
  await expect(page).toHaveURL(/\/posts$/);
});
