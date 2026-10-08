import { expect, type Page, test } from "@playwright/test";

// Mirrors the slide keyframes in components/Section.module.css: 20vw at progress 0, -30vw at 1.
function expectedX(progress: number, viewportWidth: number, reverse: boolean) {
  const p = reverse ? 1 - progress : progress;
  return ((20 - 50 * p) * viewportWidth) / 100;
}

function headingState(page: Page, sectionId: string) {
  return page.locator(`#${sectionId} h2`).evaluate((heading) => {
    const track = heading.firstElementChild as HTMLElement;
    const box = heading.getBoundingClientRect();
    const progress = Math.min(
      1,
      Math.max(0, (innerHeight - box.top) / (innerHeight + box.height)),
    );
    return {
      progress,
      x: new DOMMatrix(getComputedStyle(track).transform).m41,
      variable: track.style.getPropertyValue("--slide-progress"),
    };
  });
}

async function scrollHeadingTo(
  page: Page,
  sectionId: string,
  fraction: number,
) {
  await page.locator(`#${sectionId} h2`).evaluate((heading, f) => {
    const top = heading.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top - innerHeight * f, behavior: "instant" });
  }, fraction);
}

function nativeSupport(page: Page) {
  return page.evaluate(() => CSS.supports("animation-timeline: view()"));
}

test("the fallback stays off where scroll-driven animations are native", async ({
  page,
}) => {
  await page.goto("/");
  test.skip(!(await nativeSupport(page)), "native support required");
  await scrollHeadingTo(page, "experience", 0.5);
  expect((await headingState(page, "experience")).variable).toBe("");
});

test("without native support, section headings slide on the native path", async ({
  page,
}) => {
  await page.goto("/");
  test.skip(await nativeSupport(page), "covered by the native animation");
  const width = page.viewportSize()!.width;
  for (const [sectionId, reverse] of [
    ["experience", false],
    ["writing", true],
  ] as const) {
    const settled: number[] = [];
    for (const fraction of [0.85, 0.4]) {
      await scrollHeadingTo(page, sectionId, fraction);
      // The fallback updates on the next frame; read only once it has caught up with the scroll.
      await expect
        .poll(async () => {
          const state = await headingState(page, sectionId);
          return Math.abs(state.x - expectedX(state.progress, width, reverse));
        })
        .toBeLessThan(4);
      settled.push((await headingState(page, sectionId)).x);
    }
    // The slide must actually move between the two scroll positions.
    const moved = settled[1]! - settled[0]!;
    if (reverse) expect(moved).toBeGreaterThan(width * 0.05);
    else expect(moved).toBeLessThan(-width * 0.05);
  }
});

test("without native support, reduced motion keeps the headings still", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  test.skip(await nativeSupport(page), "covered by the native animation");
  await scrollHeadingTo(page, "experience", 0.5);
  await page.waitForTimeout(300);
  const state = await headingState(page, "experience");
  expect(state.variable).toBe("");
  expect(state.x).toBe(0);
});
