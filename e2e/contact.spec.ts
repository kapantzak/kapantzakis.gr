import { expect, test } from "@playwright/test";
import {
  DARK_BG,
  expectBodyBackground,
  expectNoHorizontalOverflow,
} from "./helpers";

test("contact offers a mailto link and social links without overflow", async ({
  page,
}) => {
  const response = await page.goto("/contact");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Say hello." }),
  ).toBeVisible();
  await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(1);
  await expect(
    page.getByRole("list", { name: "Elsewhere" }).getByRole("link"),
  ).not.toHaveCount(0);
  await expect(page.locator("main form")).toHaveCount(0);
  await expectBodyBackground(page, DARK_BG);
  await expectNoHorizontalOverflow(page);
});

test("an unknown route renders the 404 page", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle(/^Not found/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Not found." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to the home page" }).click();
  await expect(page).toHaveURL(/\/$/);
});
