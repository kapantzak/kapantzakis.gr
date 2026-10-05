import { expect, test } from "@playwright/test";

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
