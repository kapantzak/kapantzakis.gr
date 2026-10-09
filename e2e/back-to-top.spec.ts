import { expect, test, type Page } from "@playwright/test";

// Matches the 40rem breakpoint in components/Nav.module.css; below it the header scrolls away (decision 20).
const STICKY_MIN_WIDTH = 640;

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

async function scrollToBottom(page: Page): Promise<void> {
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  expect(await scrollY(page)).toBeGreaterThan(0);
}

const brandLink = (page: Page) =>
  page.getByRole("navigation", { name: "Main" }).getByRole("link").first();

test.describe("the logo link", () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) < STICKY_MIN_WIDTH,
    "on phones the header is out of view once the page scrolls",
  );

  test("scrolls back to the top when the URL is already /", async ({
    page,
  }) => {
    await page.goto("/");
    await scrollToBottom(page);
    await brandLink(page).click();
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test("scrolls back to the top and drops the section hash", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Writing" })
      .click();
    await expect(page).toHaveURL(/\/#writing$/);
    await brandLink(page).click();
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(page).toHaveURL(/\/$/);
  });
});

test("back to top scrolls up and hands focus to the logo link", async ({
  page,
}) => {
  await page.goto("/");
  await scrollToBottom(page);
  const button = page
    .getByRole("contentinfo")
    .getByRole("button", { name: "Back to top" });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => scrollY(page)).toBe(0);
  await expect(brandLink(page)).toBeFocused();
  await expect(page).toHaveURL(/\/$/);
});

test("back to top jumps without gliding under reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await scrollToBottom(page);
  await page.getByRole("button", { name: "Back to top" }).click();
  expect(await scrollY(page)).toBe(0);
});

test("the 404 page has no back-to-top button and its logo link goes home", async ({
  page,
}) => {
  await page.goto("/no-such-page");
  await expect(page.getByRole("button", { name: "Back to top" })).toHaveCount(
    0,
  );
  await brandLink(page).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "I build things for the web.",
  );
});
