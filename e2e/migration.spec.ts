import { expect, test } from "@playwright/test";

test("/projects permanently redirects to /about", async ({ request }) => {
  const response = await request.get("/projects", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers()["location"]).toMatch(/\/about$/);
});

test("the service-worker kill switch is served", async ({ request }) => {
  const response = await request.get("/sw.js");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("registration.unregister()");
});

test("sitemap lists the canonical routes", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  for (const path of ["", "/about", "/posts", "/contact"]) {
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
  await page.goto("/about");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://kapantzakis.gr/about",
  );
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute(
    "href",
    /icon/,
  );
});
