import { expect, test } from "@playwright/test";
import {
  DARK_BG,
  expectBodyBackground,
  expectNoHorizontalOverflow,
} from "./helpers";

test("about shows intro, experience, education and community on the dark theme", async ({
  page,
}) => {
  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "About" }),
  ).toBeVisible();
  for (const name of ["Experience", "Education", "Community"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Netdata" })).toBeVisible();
  await expect(page.getByText(/– Present$/).first()).toBeVisible();
  await expectBodyBackground(page, DARK_BG);
  await expectNoHorizontalOverflow(page);
});
