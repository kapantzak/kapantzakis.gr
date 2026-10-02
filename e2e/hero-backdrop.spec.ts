import { expect, type Page, test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./helpers";

// Matches the 40rem breakpoint in components/HeroBackdrop.module.css (decision 25).
const DESKTOP_MIN_WIDTH = 640;

function glyphStates(page: Page) {
  return page.locator("[data-glyph]").evaluateAll((els) =>
    els
      .filter((el) => getComputedStyle(el).display !== "none")
      .map((el) => {
        const style = getComputedStyle(el);
        return { name: style.animationName, state: style.animationPlayState };
      }),
  );
}

test("the home hero has a decorative, animated glyph backdrop", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-hero-backdrop]")).toHaveAttribute(
    "aria-hidden",
    "true",
  );

  const glyphs = await glyphStates(page);
  const wide = (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH;
  expect(glyphs).toHaveLength(wide ? 12 : 7);
  for (const glyph of glyphs) {
    expect(glyph.name).not.toBe("none");
    expect(glyph.state).toBe("running");
  }
  await expectNoHorizontalOverflow(page);
});

test("the headline stays on top of the backdrop", async ({ page }) => {
  await page.goto("/");
  const headlineOnTop = await page.locator("h1").evaluate((h1) => {
    const box = h1.getBoundingClientRect();
    const hit = document.elementFromPoint(
      box.left + 10,
      box.top + box.height / 2,
    );
    return hit !== null && h1.contains(hit);
  });
  expect(headlineOnTop).toBe(true);
});

test("the pause toggle freezes the backdrop", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("checkbox", { name: "Pause motion" }).check();
  for (const glyph of await glyphStates(page)) {
    expect(glyph.state).toBe("paused");
  }
});

test("reduced motion stops the backdrop and hides the toggle", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const glyph of await glyphStates(page)) {
    expect(glyph.name).toBe("none");
  }
  await expect(
    page.getByRole("checkbox", { name: "Pause motion" }),
  ).toBeHidden();
});

test("only the home page has the backdrop", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("[data-hero-backdrop]")).toHaveCount(0);
});
