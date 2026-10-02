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
});
