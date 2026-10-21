import { expect, test } from "./fixtures";
import { HOME_TITLE, expectNoHorizontalOverflow } from "./helpers";

// One page for privacy and cookies (decision 221).
test("the privacy page renders with its title, canonical URL and a contact link", async ({
  page,
}) => {
  const response = await page.goto("/privacy");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy");
  // The site's title template: "{title} — {name}".
  const name = HOME_TITLE.split(" — ")[0];
  await expect(page).toHaveTitle(`Privacy — ${name}`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://kapantzakis.gr/privacy",
  );
  await expect(page.locator('main a[href^="mailto:"]').first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("the footer's Privacy link reaches the privacy page, even clicked as the scroll reveals it (decision 229)", async ({
  page,
}) => {
  await page.goto("/");
  // Playwright scrolls the link into view and clicks at once: the case that cancelled a client navigation.
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Privacy" })
    .click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy");
});
