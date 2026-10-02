import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./helpers";

// Matches the 40rem breakpoint in components/Nav.module.css (decision 27).
const DESKTOP_MIN_WIDTH = 640;

for (const path of ["/", "/posts"]) {
  test(`the logo sits before the name in the main nav on ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    const brand = page.locator("body > header nav a").first();
    const logo = brand.locator("img");

    // Decorative image inside the name link: one link, named by the name alone.
    await expect(logo).toHaveAttribute("alt", "");
    expect(await brand.getAttribute("href")).toBe("/");
    expect(
      await logo.evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
    ).toBe(true);

    const logoBox = await logo.boundingBox();
    const nameBox = await brand.locator("span").boundingBox();
    expect(logoBox && nameBox && logoBox.x + logoBox.width <= nameBox.x).toBe(
      true,
    );

    const wide = (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH;
    expect(Math.round(logoBox?.width ?? 0)).toBe(wide ? 40 : 32);
    await expectNoHorizontalOverflow(page);
  });
}

test("the logo is the site icon", async ({ page, request }) => {
  expect((await request.get("/favicon.ico")).status()).toBe(200);
  expect((await request.get("/apple-icon.png")).status()).toBe(200);
  await page.goto("/");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
});
