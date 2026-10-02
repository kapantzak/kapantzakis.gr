import { expect, test } from "@playwright/test";

const ROUTES = [
  { label: "About", path: "/about", heading: "About" },
  { label: "Posts", path: "/posts", heading: "Posts" },
  { label: "Contact", path: "/contact", heading: "Say hello." },
  { label: "Home", path: "/", heading: "I build things for the web." },
];

test("every main-nav link reaches its page and marks it current", async ({
  page,
}) => {
  await page.goto("/contact");
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const route of ROUTES) {
    await nav.getByRole("link", { name: route.label }).click();
    await expect(page).toHaveURL(
      new RegExp(`${route.path === "/" ? "/" : route.path}$`),
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      route.heading,
    );
    await expect(nav.getByRole("link", { name: route.label })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
});

test("trailing-slash URLs from the old site resolve", async ({ page }) => {
  for (const path of ["/about/", "/posts/", "/contact/"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`${path.slice(0, -1)}$`));
  }
});
