import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { HOME_TITLE, PAPER_BG, expectNoHorizontalOverflow } from "./helpers";

// The site's title template: "{title} — {name}".
const name = HOME_TITLE.split(" — ")[0];

function typeOf(locator: Locator) {
  return locator.evaluate((el) => {
    const style = getComputedStyle(el);
    return [style.fontFamily, style.fontSize, style.lineHeight];
  });
}

test("the CV page renders the CV with its title, canonical URL and paper sheet (decision 233)", async ({
  page,
}) => {
  const response = await page.goto("/cv");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
  expect(await page.locator("main h2").allTextContents()).toEqual([
    "Experience",
    "Open Source & Community",
    "Selected Writing",
    "Skills",
    "Education",
  ]);
  await expect(page).toHaveTitle(`CV — ${name}`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://kapantzakis.gr/cv",
  );
  await expect(page.locator(".cv").locator("..")).toHaveCSS(
    "background-color",
    PAPER_BG,
  );
  await expectNoHorizontalOverflow(page);
});

test("the Download PDF link serves the PDF (decision 233)", async ({
  page,
  request,
}) => {
  await page.goto("/cv");
  const link = page.getByRole("link", { name: "Download PDF" });
  await expect(link).toHaveAttribute("download");
  const href = await link.getAttribute("href");
  expect(href).toMatch(/^\/[^/]+\.pdf$/);
  const response = await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
});

/** Elements whose right edge runs past the sheet's; the page itself may still fit. */
function pastTheSheet(page: Page) {
  return page.locator(".cv").evaluate((cv) => {
    const edge = cv.parentElement!.getBoundingClientRect().right;
    return [...cv.querySelectorAll("*")]
      .filter((el) => el.getBoundingClientRect().right > edge + 0.5)
      .map((el) => el.textContent);
  });
}

test("nothing runs past the sheet's edge", async ({ page }) => {
  await page.goto("/cv");
  expect(await pastTheSheet(page)).toEqual([]);
});

test("the CV fits a 320px-wide screen", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/cv");
  await expect(page.locator(".cv")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(await pastTheSheet(page)).toEqual([]);
});

test("the sheet keeps the CV's own type and link colour", async ({ page }) => {
  await page.goto("/cv");
  const cv = page.locator(".cv");
  // The site's global heading rule would give h3 the display font.
  expect(
    await page
      .locator(".cv h3")
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily),
  ).toBe(await cv.evaluate((el) => getComputedStyle(el).fontFamily));
  // The site's hover colour is lime, which fails on paper.
  const contact = page.locator(".cv .contact a").first();
  await contact.hover();
  await expect(contact).toHaveCSS("color", "rgb(21, 83, 61)");
});

test("leaves the home page's styles alone after visiting the CV", async ({
  page,
}) => {
  const heading = page.getByRole("heading", {
    level: 2,
    name: "Experience",
    exact: true,
  });
  await page.goto("/");
  const fresh = await typeOf(heading);
  await page.goto("/cv");
  await expect(page.locator(".cv")).toBeVisible();
  // A client navigation, so the CV's stylesheet stays loaded on the home page.
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Experience" })
    .click();
  await expect(page).toHaveURL(/\/experience$/);
  expect(await typeOf(heading)).toEqual(fresh);
});

test("the nav's CV link reaches the CV page from the home page and marks it current (decision 234)", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "CV" })
    .click();
  await expect(page).toHaveURL(/\/cv$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
  await expect(
    page.getByRole("navigation", { name: "Main" }).getByRole("link", {
      name: "CV",
    }),
  ).toHaveAttribute("aria-current", "page");
});

test("the footer's CV link reaches the CV page, even clicked as the scroll reveals it (decision 229)", async ({
  page,
}) => {
  await page.goto("/");
  // Playwright scrolls the link into view and clicks at once: the case that cancelled a client navigation.
  await page.getByRole("contentinfo").getByRole("link", { name: "CV" }).click();
  await expect(page).toHaveURL(/\/cv$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
});
