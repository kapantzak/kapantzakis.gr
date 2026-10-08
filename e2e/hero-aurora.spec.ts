import { expect, type Page, test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./helpers";

function glowStates(page: Page) {
  return page.locator("[data-glow]").evaluateAll((els) =>
    els.map((el) => {
      const style = getComputedStyle(el);
      return { name: style.animationName, state: style.animationPlayState };
    }),
  );
}

function pointerVars(page: Page) {
  return page.locator("[data-hero-aurora-root]").evaluate((el) => ({
    x: el.style.getPropertyValue("--pointer-x"),
    y: el.style.getPropertyValue("--pointer-y"),
  }));
}

async function moveOverHero(page: Page) {
  const box = await page.locator("[data-hero-aurora-root]").boundingBox();
  if (!box) throw new Error("hero not rendered");
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3);
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.7, {
    steps: 5,
  });
}

test("the home hero has a decorative aurora that drifts endlessly", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-hero-aurora]")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  const glows = await glowStates(page);
  expect(glows).toHaveLength(3);
  for (const glow of glows) {
    expect(glow.name).not.toBe("none");
    expect(glow.state).toBe("running");
  }
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("the headline stays on top of the aurora", async ({ page }) => {
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

test("the aurora leans toward a mouse pointer and only for a mouse", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await moveOverHero(page);
  if (isMobile) {
    await page.waitForTimeout(200);
    expect(await pointerVars(page)).toEqual({ x: "", y: "" });
    return;
  }
  await expect
    .poll(async () => Number((await pointerVars(page)).x))
    .toBeGreaterThan(0);
  await page.mouse.move(1, 1);
  await expect.poll(async () => (await pointerVars(page)).x).toBe("0");
});

test("reduced motion stops the drift and the pointer reaction", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const glow of await glowStates(page)) {
    expect(glow.name).toBe("none");
  }
  await moveOverHero(page);
  await page.waitForTimeout(200);
  expect(await pointerVars(page)).toEqual({ x: "", y: "" });
});

test("only the home page has the aurora", async ({ page }) => {
  await page.goto("/no-such-page");
  await expect(page.locator("[data-hero-aurora]")).toHaveCount(0);
});
