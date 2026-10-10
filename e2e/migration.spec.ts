import { expect, test } from "@playwright/test";
import { SHEET_PAGES } from "./helpers";

// The site is one page, with a path per sheet and per section (decisions 30–31, 35, 161, 173).
test("retired routes return 404", async ({ request }) => {
  for (const path of [
    "/about",
    "/posts",
    "/projects",
    "/posts/draft-fixture",
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(404);
  }
});

test("the service-worker kill switch is served", async ({ request }) => {
  const response = await request.get("/sw.js");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("registration.unregister()");
});

test("sitemap lists the home page and every sheet path (decision 168)", async ({
  request,
}) => {
  const body = await (await request.get("/sitemap.xml")).text();
  expect(body.match(/<loc>/g)).toHaveLength(1 + SHEET_PAGES.length);
  expect(body).toContain("<loc>https://kapantzakis.gr</loc>");
  for (const { path } of SHEET_PAGES) {
    expect(body).toContain(`<loc>https://kapantzakis.gr${path}</loc>`);
  }
});

test("robots.txt allows crawling and points to the sitemap", async ({
  request,
}) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).toContain("Allow: /");
  expect(body).toContain("Sitemap: https://kapantzakis.gr/sitemap.xml");
});

test("pages declare a canonical URL and an icon", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /^https:\/\/kapantzakis\.gr\/?$/,
  );
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute(
    "href",
    /icon/,
  );
});
