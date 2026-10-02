import { expect, test } from "@playwright/test";
import {
  LIGHT_BG,
  expectBodyBackground,
  expectNoHorizontalOverflow,
} from "./helpers";

test("posts index lists every entry newest first on the light theme", async ({
  page,
}) => {
  const response = await page.goto("/posts");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Posts" }),
  ).toBeVisible();

  const list = page.getByRole("list", { name: "All posts" });
  await expect(list.getByRole("listitem")).not.toHaveCount(0);
  expect(await list.getByRole("listitem").count()).toBeGreaterThanOrEqual(11);

  const dates = await list
    .locator("time")
    .evaluateAll((els) => els.map((el) => el.getAttribute("datetime") ?? ""));
  expect(dates).toEqual([...dates].sort().reverse());

  await expectBodyBackground(page, LIGHT_BG);
  await expectNoHorizontalOverflow(page);
});

test("external posts open off-site in a new tab", async ({ page }) => {
  await page.goto("/posts");
  const link = page.getByRole("link", {
    name: /JS illustrated: The event loop/,
  });
  await expect(link).toHaveAttribute(
    "href",
    "https://dev.to/kapantzak/js-illustrated-the-event-loop-4mco",
  );
  await expect(link).toHaveAttribute("target", "_blank");
});

test("posts is marked as the current page in the main nav", async ({
  page,
}) => {
  await page.goto("/posts");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Posts" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});
