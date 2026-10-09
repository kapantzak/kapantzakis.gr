import { expect, test } from "@playwright/test";

const SECTIONS = [
  { label: "Experience", id: "experience", heading: "Experience" },
  { label: "Writing", id: "writing", heading: "Writing" },
  { label: "Contact", id: "contact", heading: "Say hello" },
];

test("every main-nav link scrolls to its section and marks it current", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const section of SECTIONS) {
    const link = nav.getByRole("link", { name: section.label });
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/#${section.id}$`));
    await expect(
      page.getByRole("heading", { level: 2, name: section.heading }),
    ).toBeInViewport();
    await expect(link).toHaveAttribute("aria-current", "true");
  }
});

test("scrolling through the sections updates the hash without adding history", async ({
  page,
}) => {
  await page.goto("/");
  const before = await page.evaluate(() => history.length);
  for (const section of SECTIONS) {
    await page
      .locator(`#${section.id}`)
      .evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
    await expect(page).toHaveURL(new RegExp(`/#${section.id}$`));
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => history.length)).toBe(before);
});

test("a page opened at a section keeps its hash", async ({ page }) => {
  await page.goto("/#contact");
  await expect(
    page.getByRole("heading", { level: 2, name: "Say hello" }),
  ).toBeInViewport();
  await expect(page).toHaveURL(/\/#contact$/);
});

test("nav links lead back to the sections from the 404 page", async ({
  page,
}) => {
  await page.goto("/no-such-page");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Writing" })
    .click();
  await expect(page).toHaveURL(/\/#writing$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "Writing" }),
  ).toBeInViewport();
});
