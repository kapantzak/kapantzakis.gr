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
  await expect(
    sheet.getByRole("region", { name: "Selected contributions" }),
  ).toBeAttached();
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

test("the Netdata sheet tells its story, and sheets without one keep their placeholders", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Netdata/ }).click();
  const sheet = page.getByRole("dialog", { name: "Netdata" });
  for (const name of ["Netdata", "My role"]) {
    await expect(sheet.getByRole("heading", { level: 3, name })).toBeVisible();
  }
  const region = sheet.getByRole("region", { name: "Selected contributions" });
  const panels = region.getByRole("listitem");
  await expect(panels).toHaveCount(9);
  await expect(sheet.locator("[data-placeholder]")).toHaveCount(0);

  // Screenshot and text share each panel without overlapping (decisions 102, 103, 106).
  const viewportWidth = page.viewportSize()!.width;
  for (const index of [0, 1]) {
    const panel = panels.nth(index);
    await panel.scrollIntoViewIfNeeded();
    const visual = panel.locator('[aria-hidden="true"]');
    await expect
      .poll(async () => {
        const art = (await visual.boundingBox())!;
        const text = (await panel.locator("h4").boundingBox())!;
        if (viewportWidth < 768) {
          return (
            art.width >= viewportWidth - 1 && art.y >= text.y + text.height
          );
        }
        return index === 0
          ? art.x + art.width <= viewportWidth / 2 + 1 &&
              text.x >= art.x + art.width
          : art.x >= viewportWidth / 2 - 1 && text.x + text.width <= art.x;
      })
      .toBe(true);
  }
  expect(
    await sheet.evaluate((el) => el.scrollWidth - el.clientWidth),
  ).toBeLessThanOrEqual(0);

  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await page
    .getByRole("button", { name: /MSc in Applied Informatics/ })
    .click();
  await expect(
    page
      .getByRole("dialog", { name: "MSc in Applied Informatics" })
      .locator("[data-placeholder]"),
  ).toHaveCount(3);
});

test("the Adzuna sheet tells its story, with a link to the product", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Adzuna/ }).click();
  const sheet = page.getByRole("dialog", { name: "Adzuna" });
  for (const name of ["Adzuna", "My role"]) {
    await expect(sheet.getByRole("heading", { level: 3, name })).toBeVisible();
  }
  const region = sheet.getByRole("region", { name: "Selected contributions" });
  await expect(region.locator("li[data-side]")).toHaveCount(3);
  await expect(sheet.locator("[data-placeholder]")).toHaveCount(0);
  await expect(
    region.getByRole("link", { name: "The product on adzuna.co.uk" }),
  ).toHaveAttribute("href", "https://www.adzuna.co.uk/adzuna-intelligence/");
  expect(
    await sheet.evaluate((el) => el.scrollWidth - el.clientWidth),
  ).toBeLessThanOrEqual(0);
});

test("the EpsilonNet sheet tells its story, ending with a timeline that fills in", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /EpsilonNet/ }).click();
  const sheet = page.getByRole("dialog", { name: "EpsilonNet" });
  for (const name of ["EpsilonNet", "My role"]) {
    await expect(sheet.getByRole("heading", { level: 3, name })).toBeVisible();
  }
  const region = sheet.getByRole("region", { name: "Selected contributions" });
  await expect(region.locator("li[data-side]")).toHaveCount(4);
  await expect(sheet.locator("[data-placeholder]")).toHaveCount(0);
  for (const [name, href] of [
    [
      "Using Redux in a legacy ASP.NET Web Forms project",
      "https://dev.to/kapantzak/using-redux-in-a-legacy-asp-net-web-forms-project-1805",
    ],
    [
      "Automating boilerplate code generation with Node.js and Handlebars",
      "https://dev.to/kapantzak/automating-boilerplate-code-generation-with-node-js-and-handlebars-2c09",
    ],
  ] as const) {
    await expect(region.getByRole("link", { name })).toHaveAttribute(
      "href",
      href,
    );
  }

  const timeline = sheet.getByRole("region", {
    name: "From web designer to full stack developer",
  });
  const stages = timeline.locator(":scope > ol > li");
  await expect(stages).toHaveCount(6);
  await expect(stages.first().getByRole("heading", { level: 4 })).toHaveText(
    "Junior web designer",
  );

  // The timeline closes the sheet, so its motion must finish at the bottom (decisions 129, 132).
  await sheet.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  const lastTitle = stages.last().getByRole("heading", { level: 4 });
  await expect(lastTitle).toBeInViewport();
  await expect
    .poll(() =>
      timeline
        .locator("ol")
        .first()
        .evaluate((list) => ({
          rail: getComputedStyle(list, "::after").transform,
          title: getComputedStyle(list.querySelector("li:last-child h4")!)
            .opacity,
        })),
    )
    .toEqual({ rail: "matrix(1, 0, 0, 1, 0, 0)", title: "1" });
  expect(
    await sheet.evaluate((el) => el.scrollWidth - el.clientWidth),
  ).toBeLessThanOrEqual(0);
});

test("the Skroutz sheet tells its story, with links to the pull requests", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Skroutz/ }).click();
  const sheet = page.getByRole("dialog", { name: "Skroutz" });
  for (const name of ["Skroutz", "My role"]) {
    await expect(sheet.getByRole("heading", { level: 3, name })).toBeVisible();
  }
  const region = sheet.getByRole("region", { name: "Selected contributions" });
  await expect(region.locator("li[data-side]")).toHaveCount(4);
  await expect(sheet.locator("[data-placeholder]")).toHaveCount(0);
  for (const n of [327, 367]) {
    await expect(
      region.getByRole("link", { name: `PR #${n} on GitHub` }),
    ).toHaveAttribute("href", `https://github.com/hotwired/turbo/pull/${n}`);
  }
  await expect(
    region.getByRole("link", { name: "Turbo 7 announcement" }),
  ).toHaveAttribute("href", "https://world.hey.com/hotwired/turbo-7-0dd7a27f");
  expect(
    await sheet.evaluate((el) => el.scrollWidth - el.clientWidth),
  ).toBeLessThanOrEqual(0);
});

// Scroll-driven reveals never finish mid-scroll; closing must not wait for them.
test("the sheet closes while a contribution is halfway through its reveal", async ({
  page,
}) => {
  await page.goto("/");
  const row = page.getByRole("button", { name: /Netdata/ });
  await row.click();
  const sheet = page.getByRole("dialog", { name: "Netdata" });
  await sheet.evaluate((el) => {
    const panel = el.querySelectorAll("li[data-side]")[4]!;
    el.scrollTop += panel.getBoundingClientRect().top - el.clientHeight * 0.8;
  });
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(row).toBeFocused();
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
  // Still on the home page; the hash may name the section scrolled into view (decision 124).
  await expect(page).toHaveURL(/\/(#experience)?$/);
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

  // Every work role has a brand, so an unbranded education entry stands in for a plain sheet.
  await page
    .getByRole("button", { name: /MSc in Informatics and Management/ })
    .click();
  const plain = page.getByRole("dialog", {
    name: "MSc in Informatics and Management",
  });
  await expect(plain).toBeVisible();
  await expect(plain.locator("[data-brand]")).toHaveCount(0);
  await expect(plain.getByRole("img")).toHaveCount(0);
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
  [
    "EpsilonNet",
    "Full stack developer",
    "rgb(255, 255, 255)",
    "rgb(240, 78, 35)",
  ],
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

// A degree takes a brand without a logo, so its title stays text (decisions 151–154).
test("the MSc in Applied Informatics sheet opens on a light band with a text title, gold links and the campus photo", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /MSc in Applied Informatics/ })
    .click();
  const band = page
    .getByRole("dialog", { name: "MSc in Applied Informatics" })
    .locator("[data-brand]");
  await expect(band).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(band).toHaveCSS("border-bottom-width", "1px");
  const title = band.getByRole("heading", { level: 2 });
  await expect(title).toHaveText("MSc in Applied Informatics");
  await expect(title.getByRole("img")).toHaveCount(0);
  // A word split across lines draws more than one box (decision 154).
  expect(
    await title.evaluate((el) => {
      const text = el.firstChild!;
      return [...text.textContent!.matchAll(/\S+/g)].flatMap((word) => {
        const range = document.createRange();
        range.setStart(text, word.index);
        range.setEnd(text, word.index + word[0].length);
        return range.getClientRects().length > 1 ? [word[0]] : [];
      });
    }),
  ).toEqual([]);
  // At most two lines (decision 154).
  expect(
    await title.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return new Set(
        [...range.getClientRects()].map((rect) => Math.round(rect.top)),
      ).size;
    }),
  ).toBeLessThanOrEqual(2);
  for (const name of [/MSc in Applied Informatics/, /Thesis \(English\)/]) {
    await expect(band.getByRole("link", { name })).toHaveCSS(
      "background-color",
      "rgb(246, 168, 0)",
    );
  }
  await expect
    .poll(() =>
      band
        .locator('[aria-hidden="true"] img')
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
});

// A community entry takes a brand like a work role (decisions 87–93).
test("the Thessaloniki JavaScript Meetup sheet opens on its dark band with its lockup, summary and site link", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText(/I co-organise SKG JS, Thessaloniki’s JavaScript community/),
  ).toBeVisible();
  const row = page.getByRole("button", {
    name: /Thessaloniki JavaScript Meetup/,
  });
  // The row wipes in the brand yellow the sheet grows out of (decision 53).
  await expect
    .poll(() =>
      row.evaluate((el) =>
        getComputedStyle(el.closest("li")!).getPropertyValue("--accent"),
      ),
    )
    .toBe("#f7dd3e");
  await row.click();
  const sheet = page.getByRole("dialog", {
    name: "Thessaloniki JavaScript Meetup",
  });
  const band = sheet.locator("[data-brand]");
  await expect(band).toHaveCSS("background-color", "rgb(26, 26, 26)");
  await expect(band).toHaveAttribute("data-tone", "dark");
  // The lockup names the heading; the logo beside it is decorative (decision 92).
  const title = band.getByRole("heading", {
    level: 2,
    name: "Thessaloniki JavaScript Meetup",
  });
  const logo = title.locator("img");
  await expect(logo).toHaveAttribute("alt", "");
  await expect(logo).toBeVisible();
  await expect
    .poll(() => logo.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  const first = title.getByText("Thessaloniki", { exact: true });
  const second = title.getByText("JavaScript Meetup", { exact: true });
  // White, then the brand yellow, as in the skgjs.gr hero (decision 93).
  await expect(first).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(second).toHaveCSS("color", "rgb(247, 221, 62)");
  await expect
    .poll(async () => {
      const mark = (await logo.boundingBox())!;
      const top = (await first.boundingBox())!;
      const bottom = (await second.boundingBox())!;
      return (
        top.x >= mark.x + mark.width &&
        top.y >= mark.y - 1 &&
        bottom.y + bottom.height <= mark.y + mark.height + mark.height * 0.25
      );
    })
    .toBe(true);
  await expect(band.getByText(/Organising meetups and talks/)).toHaveCSS(
    "color",
    "rgb(217, 220, 227)",
  );
  const site = band.getByRole("link", { name: /skgjs\.gr/ });
  await expect(site).toHaveAttribute("href", "https://skgjs.gr/");
  await expect(site).toHaveCSS("background-color", "rgb(247, 221, 62)");
  await expect(site).toHaveCSS("color", "rgb(11, 13, 18)");
  await expect
    .poll(() =>
      band
        .locator('[aria-hidden="true"] img')
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  expect(
    await sheet.evaluate((el) => el.scrollWidth - el.clientWidth),
  ).toBeLessThanOrEqual(0);
});

test("education and community sheets reveal their links", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /MSc in Applied Informatics/ })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("link", { name: /MSc in Applied Informatics/ }),
  ).toHaveAttribute("href", "https://www.uom.gr/en/mai");
  await expect(
    page.getByRole("dialog").getByRole("link", { name: /Thesis \(English\)/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page
    .getByRole("button", { name: /Thessaloniki JavaScript Meetup/ })
    .click();
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
