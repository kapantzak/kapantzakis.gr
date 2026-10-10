import { expect, type Page, test } from "@playwright/test";
import { HOME_TITLE, REGION_PAGES } from "./helpers";

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

for (const { path, id } of REGION_PAGES) {
  test(`${path} loads at its region, with the home title and canonical / (decisions 173, 176, 178–179)`, async ({
    page,
  }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`#${id}`)).toBeInViewport();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page).toHaveTitle(HOME_TITLE);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /^https:\/\/kapantzakis\.gr\/?$/,
    );
  });
}

test("a fresh load is at its region from the first frame (decision 176)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    requestAnimationFrame(() => {
      (window as { firstFrameY?: number }).firstFrameY = Math.round(
        window.scrollY,
      );
    });
  });
  await page.goto("/writing");
  await expect(page.locator("#writing")).toBeInViewport();
  const firstFrameY = await page.evaluate(
    () => (window as { firstFrameY?: number }).firstFrameY,
  );
  expect(firstFrameY).toBeGreaterThan(0);
  expect(firstFrameY).toBe(await scrollY(page));
});

test("a reload inside a region keeps the exact position (decision 176)", async ({
  page,
}) => {
  await page.goto("/writing");
  await expect(page.locator("#writing")).toBeInViewport();
  await page.evaluate(() => window.scrollBy({ top: 200, behavior: "instant" }));
  const y = await scrollY(page);
  await page.reload();
  await expect.poll(() => scrollY(page)).toBe(y);
});
