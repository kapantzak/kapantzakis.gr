import { expect, test } from "@playwright/test";

// The site is one page now (decisions 30–31, 35).
test("retired routes return 404", async ({ request }) => {
  for (const path of [
    "/about",
    "/posts",
    "/contact",
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

test("sitemap lists the home page only", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  expect(body.match(/<loc>/g)).toHaveLength(1);
  expect(body).toContain("<loc>https://kapantzakis.gr</loc>");
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
