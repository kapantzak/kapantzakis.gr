import { expect, type Page, test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./helpers";

// The only hero text colours tested against the aurora (decision 82): --color-fg-strong, --color-fg, lime.
const HERO_TEXT_COLOURS = [
  "rgb(255, 255, 255)",
  "rgb(217, 220, 227)",
  "rgb(198, 255, 61)",
];

function bandStates(page: Page) {
  return page.locator("[data-band]").evaluateAll((els) =>
    els.map((el) => {
      const style = getComputedStyle(el);
      return { name: style.animationName, state: style.animationPlayState };
    }),
  );
}

// Freezes the sway so only the pointer lean moves the curtains.
async function freezeSway(page: Page) {
  await page.addStyleTag({
    content: "[data-band] { animation-play-state: paused !important; }",
  });
}

// The deepest curtain moves the most; its left edge tracks the lean.
function deepestBandX(page: Page) {
  return page
    .locator("[data-band]")
    .last()
    .evaluate((el) => el.getBoundingClientRect().x);
}

async function auroraBox(page: Page) {
  const box = await page.locator("[data-hero-aurora]").boundingBox();
  if (!box) throw new Error("aurora not rendered");
  return box;
}

test("the home hero has a decorative aurora that sways endlessly", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-hero-aurora]")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  const bands = await bandStates(page);
  expect(bands).toHaveLength(4);
  for (const band of bands) {
    expect(band.name).not.toBe("none");
    expect(band.state).toBe("running");
  }
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("the hero uses only text colours tested against the aurora", async ({
  page,
}) => {
  await page.goto("/");
  const colours = await page
    .locator("[data-hero-aurora-root] :is(p, h1, a, span)")
    .evaluateAll((els) =>
      els
        .filter((el) => !el.closest("[data-hero-aurora]"))
        .filter((el) => el.textContent?.trim())
        .map((el) => getComputedStyle(el).color),
    );
  expect(colours.length).toBeGreaterThan(0);
  for (const colour of colours) expect(HERO_TEXT_COLOURS).toContain(colour);
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

test("the curtains lean toward a mouse pointer anywhere over the aurora", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await freezeSway(page);
  const box = await auroraBox(page);
  const rest = await deepestBandX(page);
  // The right gutter: inside the aurora, outside the hero's content column.
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.move(box.x + box.width - 4, box.y + box.height / 2, {
    steps: 10,
  });
  if (isMobile) {
    await page.waitForTimeout(1500);
    expect(Math.abs((await deepestBandX(page)) - rest)).toBeLessThan(1);
    return;
  }
  await expect
    .poll(async () => (await deepestBandX(page)) - rest)
    .toBeGreaterThan(box.width * 0.06);
  // Above the aurora (the nav): the curtains ease back.
  await page.mouse.move(box.x + box.width / 2, 1, { steps: 5 });
  await expect
    .poll(async () => Math.abs((await deepestBandX(page)) - rest))
    .toBeLessThan(2);
});

test("reduced motion stops the sway and the pointer lean", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const band of await bandStates(page)) {
    expect(band.name).toBe("none");
  }
  const box = await auroraBox(page);
  const rest = await deepestBandX(page);
  await page.mouse.move(box.x + box.width - 4, box.y + box.height / 2, {
    steps: 10,
  });
  await page.waitForTimeout(1500);
  expect(Math.abs((await deepestBandX(page)) - rest)).toBeLessThan(1);
});

test("only the home page has the aurora", async ({ page }) => {
  await page.goto("/no-such-page");
  await expect(page.locator("[data-hero-aurora]")).toHaveCount(0);
});
