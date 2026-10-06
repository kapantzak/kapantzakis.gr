import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./helpers";

// Matches the 40rem breakpoint in components/Nav.module.css (spec §4.5, decision 20).
const STICKY_MIN_WIDTH = 640;

test("the main nav sticks on wide screens and scrolls away on phones", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  const header = page.locator("body > header");
  const sticky = (page.viewportSize()?.width ?? 0) >= STICKY_MIN_WIDTH;

  if (sticky) {
    expect(await header.evaluate((el) => el.getBoundingClientRect().top)).toBe(
      0,
    );
    await expect(header).toBeInViewport();
  } else {
    await expect(header).not.toBeInViewport();
  }
  await expectNoHorizontalOverflow(page);
});

test("the skip link is drawn above the header", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLinkOnTop = await page.evaluate(() => {
    const link = document.activeElement;
    if (!(link instanceof HTMLElement)) return false;
    const box = link.getBoundingClientRect();
    const hit = document.elementFromPoint(
      box.left + box.width / 2,
      box.top + box.height / 2,
    );
    return hit !== null && link.contains(hit);
  });
  expect(skipLinkOnTop).toBe(true);
});
