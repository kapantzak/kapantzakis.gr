import { expect, test } from "@playwright/test";
import { externalPosts } from "../content/external-posts";
import {
  DARK_BG,
  PAPER_BG,
  expectBodyBackground,
  expectNoHorizontalOverflow,
} from "./helpers";

test("home renders the headline and every section without horizontal scroll", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "I build things for the web.",
  );
  for (const name of ["Experience", "Writing", "Say hello"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeAttached();
  }
  for (const name of ["Work", "Education", "Community"]) {
    await expect(page.getByRole("heading", { level: 3, name })).toBeAttached();
  }
  await expectBodyBackground(page, DARK_BG);
  await expectNoHorizontalOverflow(page);
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await expectNoHorizontalOverflow(page);
});

test("the skip link is the first tab stop and targets main content", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator("main#main")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveCSS("outline-style", "solid");
});

test("an experience row opens a full-page light sheet that scrolls and closes on Escape", async ({
  page,
}) => {
  await page.goto("/");
  const row = page.getByRole("button", { name: /Netdata/ });
  await expect(row).toHaveAttribute("aria-haspopup", "dialog");
  await row.click();

  const sheet = page.getByRole("dialog", { name: "Netdata" });
  await expect(sheet).toBeVisible();
  await expect(sheet).toHaveCSS("background-color", PAPER_BG);
  await expect(sheet.getByRole("button", { name: "Close" })).toBeFocused();
  await expect(
    sheet.getByRole("link", { name: /netdata\.cloud/ }),
  ).toBeVisible();
  await expect(sheet.locator("[data-placeholder]").first()).toBeVisible();
  const box = await sheet.boundingBox();
  const viewport = page.viewportSize()!;
  expect(box).toMatchObject({ x: 0, y: 0, width: viewport.width });
  expect(await sheet.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
    true,
  );
  await expect(page.locator("main")).toHaveAttribute("inert", "");

  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(row).toBeFocused();
  await expect(page.locator("main")).not.toHaveAttribute("inert");
  await expectNoHorizontalOverflow(page);
});

test("the close button and the browser Back button both close the sheet", async ({
  page,
}) => {
  await page.goto("/");
  const row = page.getByRole("button", { name: /Netdata/ });
  const sheet = page.getByRole("dialog", { name: "Netdata" });

  await row.click();
  await sheet.getByRole("button", { name: "Close" }).click();
  await expect(sheet).toHaveCount(0);

  await row.click();
  await expect(sheet).toBeVisible();
  await page.goBack();
  await expect(sheet).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
  await expect(row).toBeFocused();
});

test("the Netdata sheet opens on a brand band with its logo, and other sheets do not", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Netdata/ }).click();
  const sheet = page.getByRole("dialog", { name: "Netdata" });
  const band = sheet.locator("[data-brand]");
  await expect(band).toHaveCSS("background-color", "rgb(2, 5, 3)");
  const logo = band
    .getByRole("heading", { level: 2 })
    .getByRole("img", { name: "Netdata" });
  await expect(logo).toBeVisible();
  await expect
    .poll(() => logo.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await expect(band.getByRole("list", { name: "Stack" })).toContainText(
    "AI coding agents",
  );
  const site = band.getByRole("link", { name: /netdata\.cloud/ });
  await site.hover();
  // Dark text stays on the green fill; white would fall to 3:1 (decision 54).
  await expect(site).toHaveCSS("color", "rgb(11, 13, 18)");
  // Decorative brand art: right half on wide screens, a strip below the text on phones.
  const visual = band.locator('[aria-hidden="true"]').filter({
    has: page.locator('img[alt=""]'),
  });
  await expect
    .poll(() =>
      visual
        .locator("img")
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  const viewportWidth = page.viewportSize()!.width;
  await expect
    .poll(async () => {
      const art = (await visual.boundingBox())!;
      const text = (await band.locator("header").boundingBox())!;
      return viewportWidth >= 768
        ? art.x >= viewportWidth / 2 - 1 && text.x + text.width <= art.x
        : art.width >= viewportWidth - 1 && art.y >= text.y + text.height;
    })
    .toBe(true);
  // Tilted in perspective on wide screens only (decisions 60–62).
  await expect(visual.locator("img")).toHaveCSS(
    "transform",
    viewportWidth >= 768 ? /^matrix3d\(/ : "none",
  );
  // The tilted screen fills the band's full height, from its top edge (decision 70).
  if (viewportWidth >= 768) {
    await expect.poll(async () => (await visual.boundingBox())!.y).toBe(0);
  }
  // The band reaches up behind the close bar, leaving no paper strip above it.
  await expect.poll(async () => (await band.boundingBox())?.y).toBe(0);
  expect(
    await sheet.evaluate((el) => el.scrollWidth - el.clientWidth),
  ).toBeLessThanOrEqual(0);
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);

  await page.getByRole("button", { name: /Independent/ }).click();
  const plain = page.getByRole("dialog", { name: "Independent" });
  await expect(plain).toBeVisible();
  await expect(plain.locator("[data-brand]")).toHaveCount(0);
  await expect(plain.getByRole("img")).toHaveCount(0);
  await expect(
    plain.locator("header").getByRole("list", { name: "Stack" }),
  ).toContainText("jQuery");
});

// Light-toned bands: dark text on the brand background, the link filled in the brand's link colour.
for (const [org, role, background, link] of [
  [
    "Adzuna",
    "Senior frontend developer",
    "rgb(255, 255, 255)",
    "rgb(39, 155, 55)",
  ],
  ["Skroutz", "Software engineer", "rgb(246, 139, 36)", "rgb(255, 184, 0)"],
  ["EpsilonNet", "Web developer", "rgb(255, 255, 255)", "rgb(240, 78, 35)"],
]) {
  test(`the ${org} sheet opens on its light band with dark text, its logo and link colour`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: new RegExp(org) }).click();
    const band = page
      .getByRole("dialog", { name: org })
      .locator("[data-brand]");
    await expect(band).toHaveCSS("background-color", background);
    // Keeps a light band distinct from the off-white sheet (decision 65).
    await expect(band).toHaveCSS("border-bottom-width", "1px");
    await expect(
      band.getByRole("heading", { level: 2 }).getByRole("img", { name: org }),
    ).toBeVisible();
    await expect(band.getByText(role, { exact: true })).toHaveCSS(
      "color",
      "rgb(11, 13, 18)",
    );
    await expect(
      band.getByRole("list", { name: "Stack" }).getByRole("listitem").first(),
    ).toHaveCSS("color", "rgb(11, 13, 18)");
    // The date uses the body grey on light bands (decision 69).
    await expect(band.locator("header > p").first()).toHaveCSS(
      "color",
      "rgb(42, 46, 55)",
    );
    await expect(band.getByRole("link")).toHaveCSS("background-color", link);
    await expect
      .poll(() =>
        band
          .locator('[aria-hidden="true"] img')
          .evaluate((img: HTMLImageElement) => img.naturalWidth),
      )
      .toBeGreaterThan(0);
  });
}

test("education and community sheets reveal their links", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /MSc in Applied Informatics/ })
    .click();
  await expect(
    page.getByRole("dialog").getByRole("link", { name: /Thesis \(English\)/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: /SKG JS/ }).click();
  await expect(
    page.getByRole("dialog").getByText(/Organising meetups and talks/),
  ).toBeVisible();
});

test("every post is a tile, newest first, opening off-site in a new tab", async ({
  page,
}) => {
  await page.goto("/");
  const tiles = page.getByRole("list", { name: "All posts" }).getByRole("link");
  await expect(tiles).toHaveCount(externalPosts.length);
  for (const tile of await tiles.all()) {
    await expect(tile).toHaveAttribute("target", "_blank");
    await expect(tile).toHaveAttribute("href", /^https:\/\//);
  }
  const dates = await page
    .getByRole("list", { name: "All posts" })
    .locator("time")
    .evaluateAll((els) => els.map((el) => el.getAttribute("datetime") ?? ""));
  expect(dates).toEqual([...dates].sort().reverse());
  await expect(
    page.getByRole("link", { name: /JS illustrated: The event loop/ }),
  ).toHaveAttribute(
    "href",
    "https://dev.to/kapantzak/js-illustrated-the-event-loop-4mco",
  );
});

test("contact offers a mailto link and social links, with no form", async ({
  page,
}) => {
  await page.goto("/");
  const contact = page.getByRole("region", { name: "Say hello" });
  await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(1);
  await expect(
    contact.getByRole("list", { name: "Elsewhere" }).getByRole("link"),
  ).not.toHaveCount(0);
  await expect(page.locator("main form")).toHaveCount(0);
});

test("reduced motion turns off the scroll-driven animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const names = await page
    .locator("main h1 span, main h2 > span, main li")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
  expect(names.length).toBeGreaterThan(0);
  expect(names.every((name) => name === "none")).toBe(true);
});

test("reduced motion opens the sheet with a short fade only", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: /Netdata/ }).click();
  const sheet = page.getByRole("dialog", { name: "Netdata" });
  await expect(sheet).toHaveCSS("animation-name", /fade-in/);
  const names = await sheet
    .locator(":scope > *, :scope > * > *")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
  expect(names.every((name) => name === "none")).toBe(true);
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
});
