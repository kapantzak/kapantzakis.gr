import { expect, type Page, test } from "@playwright/test";
import { REGION_PAGES } from "./helpers";

const SECTIONS = [
  { label: "Experience", id: "experience", heading: "Experience" },
  { label: "Writing", id: "writing", heading: "Writing" },
  { label: "Contact", id: "contact", heading: "Say hello" },
];

/** Puts a region's top inside the reading band, as scrolling down to it would (decision 174). */
async function scrollIntoBand(page: Page, id: string): Promise<void> {
  await page.locator(`#${id}`).evaluate((el) =>
    window.scrollTo({
      top:
        el.getBoundingClientRect().top +
        window.scrollY -
        window.innerHeight * 0.47,
      behavior: "instant",
    }),
  );
}

test("every main-nav link scrolls to its section, marks it current and adds one Back step (decision 175)", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const section of SECTIONS) {
    const link = nav.getByRole("link", { name: section.label });
    await link.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => history.length);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/${section.id}$`));
    await expect(
      page.getByRole("heading", { level: 2, name: section.heading }),
    ).toBeInViewport();
    await expect(link).toHaveAttribute("aria-current", "true");
    expect(await page.evaluate(() => history.length)).toBe(before + 1);
  }
});

test("Back after a nav click returns to where the reader was, and Forward to the section", async ({
  page,
}) => {
  // Instant scrolling, so Back and Forward restore at once; the smooth glide's timing is the browser's (decision 126).
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 2, name: "Say hello" });
  const contact = page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Contact" });
  await contact.click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(heading).toBeInViewport();
  await expect(contact).toHaveAttribute("aria-current", "true");
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect
    .poll(() => page.evaluate(() => Math.round(window.scrollY)))
    .toBe(0);
  await page.goForward();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(heading).toBeInViewport();
  await expect(contact).toHaveAttribute("aria-current", "true");
});

test("scrolling through the regions writes each path without adding history (decision 174)", async ({
  page,
}) => {
  await page.goto("/");
  const before = await page.evaluate(() => history.length);
  for (const { path, id } of REGION_PAGES) {
    await scrollIntoBand(page, id);
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => history.length)).toBe(before);
});

test("an old section hash still lands on its section, then takes its path (decision 177)", async ({
  page,
}) => {
  await page.goto("/#contact");
  await expect(
    page.getByRole("heading", { level: 2, name: "Say hello" }),
  ).toBeInViewport();
  await expect(page).toHaveURL(/\/contact$/);
});

test("the hero's cue scrolls to Experience at its path (decision 175)", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Scroll" }).click();
  await expect(page).toHaveURL(/\/experience$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "Experience" }),
  ).toBeInViewport();
});

test("nav links lead to the sections' paths from the 404 page", async ({
  page,
}) => {
  await page.goto("/no-such-page");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Writing" })
    .click();
  await expect(page).toHaveURL(/\/writing$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "Writing" }),
  ).toBeInViewport();
});
