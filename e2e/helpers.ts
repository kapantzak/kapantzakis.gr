import { expect, type Page } from "@playwright/test";

export const DARK_BG = "rgb(11, 13, 18)";
export const PAPER_BG = "rgb(247, 246, 242)";

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
