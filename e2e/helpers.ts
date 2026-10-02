import { expect, type Page } from "@playwright/test";

export const DARK_BG = "rgb(11, 13, 18)";
export const LIGHT_BG = "rgb(244, 242, 238)";
export const DRAFTS_AVAILABLE = !process.env.BASE_URL;

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow, "page scrolls horizontally").toBeLessThanOrEqual(0);
}

export async function expectBodyBackground(
  page: Page,
  colour: string,
): Promise<void> {
  await expect(page.locator("body")).toHaveCSS("background-color", colour);
}
