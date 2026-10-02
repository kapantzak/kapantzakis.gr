import { expect, test } from "@playwright/test";
import {
  DRAFTS_AVAILABLE,
  LIGHT_BG,
  expectBodyBackground,
  expectNoHorizontalOverflow,
} from "./helpers";

test("a local post renders through the MDX pipeline on the light theme", async ({
  page,
}) => {
  test.skip(!DRAFTS_AVAILABLE, "The draft fixture is only built locally");
  const response = await page.goto("/posts/draft-fixture");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Draft fixture" }),
  ).toBeVisible();
  await expect(
    page.getByText("This paragraph proves MDX body rendering works."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "A subheading" }),
  ).toBeVisible();
  await expect(page.getByText("1 Jan 2026")).toBeVisible();
  await expectBodyBackground(page, LIGHT_BG);
  await expectNoHorizontalOverflow(page);
});

test("an unknown post slug returns 404", async ({ page }) => {
  const response = await page.goto("/posts/does-not-exist");
  expect(response?.status()).toBe(404);
});

test("drafts are excluded from production builds", async ({
  page,
  request,
}) => {
  test.skip(DRAFTS_AVAILABLE, "Only meaningful when drafts are not built");
  expect((await request.get("/posts/draft-fixture")).status()).toBe(404);
  await page.goto("/posts");
  await expect(page.getByRole("list", { name: "All posts" })).not.toContainText(
    "Draft fixture",
  );
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "draft-fixture",
  );
});
