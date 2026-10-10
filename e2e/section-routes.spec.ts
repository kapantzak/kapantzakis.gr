import { expect, type Page, test } from "@playwright/test";
import { HOME_TITLE, REGION_PAGES, pageviews } from "./helpers";

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

test("a section path load counts once, under its own path (decision 180)", async ({
  page,
}) => {
  await page.goto("/writing");
  await expect(page.locator("#writing")).toBeInViewport();
  await expect
    .poll(() => pageviews(page))
    .toEqual([{ route: "/writing", path: "/writing" }]);
});

/** Waits for hydration and two frames, so the observer has reported. */
async function settled(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

test("a loaded /community keeps its path and marks Experience until the first scroll, on any screen (decision 184)", async ({
  page,
}) => {
  await page.goto("/community");
  await expect(page.locator("#community")).toBeInViewport();
  await settled(page);
  await expect(page).toHaveURL(/\/community$/);
  await expect(
    page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Experience" }),
  ).toHaveAttribute("aria-current", "true");
});

test("Back from a sheet opened at /education returns to /education", async ({
  page,
}) => {
  await page.goto("/education");
  await page
    .getByRole("button", { name: /MSc in Applied Informatics/ })
    .click();
  const sheet = page.getByRole("dialog", {
    name: "MSc in Applied Informatics",
  });
  await expect(sheet).toBeVisible();
  await expect(page).toHaveURL(/\/education\/msc-applied-informatics$/);
  await page.goBack();
  await expect(sheet).toHaveCount(0);
  await expect(page).toHaveURL(/\/education$/);
});

test("closing a sheet opened by URL lands on its group's path", async ({
  page,
}) => {
  await page.goto("/education/bsc-economic-science");
  const sheet = page.getByRole("dialog", { name: "BSc in Economic Science" });
  await expect(sheet.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(page).toHaveURL(/\/education$/);
});

test("scrolling between the home page's paths sends no page view (decision 180)", async ({
  page,
}) => {
  await page.goto("/writing");
  await settled(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page).toHaveURL(/\/$/);
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  await expect(page).toHaveURL(/\/contact$/);
  expect(await pageviews(page)).toEqual([
    { route: "/writing", path: "/writing" },
  ]);
});
