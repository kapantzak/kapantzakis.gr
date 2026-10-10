import { expect, type Locator, test } from "@playwright/test";
import {
  HOME_TITLE,
  PAPER_BG,
  SHEET_PAGES,
  expectNoHorizontalOverflow,
  pageviews,
} from "./helpers";

/** Waits for the sheet's own animations (not the scroll-driven ones) to finish. */
async function settled(sheet: Locator): Promise<void> {
  await sheet.evaluate((el) =>
    Promise.all(
      el
        .getAnimations({ subtree: true })
        .filter((a) => a.timeline === document.timeline)
        .map((a) => a.finished),
    ),
  );
}

test("a row opens its sheet at the sheet's path, growing out of the row", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Netdata/ }).click();
  const sheet = page.getByRole("dialog", { name: "Netdata" });
  await expect(sheet).toBeVisible();
  await expect(sheet).toHaveCSS("animation-name", /grow/);
  await expect(page).toHaveURL(/\/experience\/netdata$/);
  await expect(page).toHaveTitle("Netdata — John Kapantzakis");
});

test("the sheet is a direct child of <body>, after <main>, however it opened (decision 163)", async ({
  page,
}) => {
  const placement = (sheet: Locator) =>
    sheet.evaluate((el) => ({
      parent: el.parentElement?.tagName,
      before: el.previousElementSibling?.tagName,
    }));
  const expected = { parent: "BODY", before: "MAIN" };

  await page.goto("/");
  await page.getByRole("button", { name: /Netdata/ }).click();
  expect(
    await placement(page.getByRole("dialog", { name: "Netdata" })),
  ).toEqual(expected);

  await page.goto("/community/skgjs");
  expect(
    await placement(
      page.getByRole("dialog", { name: "Thessaloniki JavaScript Meetup" }),
    ),
  ).toEqual(expected);
});

test("Back closes the sheet and Forward opens it again, without remounting the page", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("main").evaluate((el) => {
    el.dataset.probe = "kept";
  });
  const row = page.getByRole("button", { name: /Netdata/ });
  const sheet = page.getByRole("dialog", { name: "Netdata" });
  await row.click();
  await expect(sheet).toBeVisible();

  await page.goBack();
  await expect(sheet).toHaveCount(0);
  await expect(page).toHaveURL(/\/(#experience)?$/);
  await expect(page).toHaveTitle(HOME_TITLE);
  await expect(row).toBeFocused();

  await page.goForward();
  await expect(sheet).toBeVisible();
  await expect(page).toHaveURL(/\/experience\/netdata$/);
  await expect(page.locator("main")).toHaveAttribute("data-probe", "kept");
});

test("Forward during the closing animation leaves the sheet open", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Netdata/ }).click();
  const sheet = page.getByRole("dialog", { name: "Netdata" });
  await settled(sheet);
  await page.goBack();
  // Forward must land while the sheet is still shrinking, or the test proves nothing.
  await expect(sheet).toHaveAttribute("data-closing");
  await page.goForward();
  await expect(page).toHaveURL(/\/experience\/netdata$/);
  await settled(sheet);
  await expect(sheet).toBeVisible();
  await expect(sheet).not.toHaveAttribute("data-closing");
});

test("Back from a sheet returns to the section hash it opened from", async ({
  page,
}) => {
  await page.goto("/#experience");
  await page.getByRole("button", { name: /Adzuna/ }).click();
  await expect(page.getByRole("dialog", { name: "Adzuna" })).toBeVisible();
  await expect(page).toHaveURL(/\/experience\/adzuna$/);
  await page.goBack();
  await expect(page.getByRole("dialog", { name: "Adzuna" })).toHaveCount(0);
  await expect(page).toHaveURL(/\/#experience$/);
});

test("the section hash is never written onto a sheet path", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Netdata/ }).click();
  const sheet = page.getByRole("dialog", { name: "Netdata" });
  await settled(sheet);
  const url = new URL(page.url());
  expect(url.pathname + url.hash).toBe("/experience/netdata");
});

for (const { path, name } of SHEET_PAGES) {
  test(`${path} loads with its sheet open, titled, described and canonical`, async ({
    page,
  }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    const sheet = page.getByRole("dialog", { name });
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveCSS("background-color", PAPER_BG);
    await expect(page).toHaveTitle(`${name} — John Kapantzakis`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://kapantzakis.gr${path}`,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /\.$/,
    );
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a sheet path's HTML holds the open sheet and its story (decision 166)", async ({
    page,
  }) => {
    await page.goto("/education/msc-applied-informatics");
    const sheet = page.getByRole("dialog", {
      name: "MSc in Applied Informatics",
    });
    await expect(sheet).toBeVisible();
    await expect(
      sheet.getByRole("region", { name: "The application" }),
    ).toBeAttached();
  });
});

test("a sheet opened by URL starts full screen and closes into its row at /", async ({
  page,
}) => {
  await page.goto("/experience/skroutz");
  const sheet = page.getByRole("dialog", { name: "Skroutz" });
  await expect(sheet).toHaveCSS("animation-name", "none");
  await expect(sheet.getByRole("button", { name: "Close" })).toBeFocused();
  const before = await page.evaluate(() => history.length);

  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  const row = page.getByRole("button", { name: /Skroutz/ });
  await expect(row).toBeFocused();
  await expect(row).toBeInViewport();
  await expect(page).toHaveURL(/\/(#experience)?$/);
  await expect(page).toHaveTitle(HOME_TITLE);
  expect(await page.evaluate(() => history.length)).toBe(before);
  await expectNoHorizontalOverflow(page);
});

test("after closing a sheet opened by URL, a nav link scrolls without remounting the page", async ({
  page,
}) => {
  await page.goto("/experience/adzuna");
  const sheet = page.getByRole("dialog", { name: "Adzuna" });
  await expect(sheet.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await page.locator("main").evaluate((el) => {
    el.dataset.probe = "kept";
  });
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Writing" })
    .click();
  await expect(page).toHaveURL(/\/#writing$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "Writing" }),
  ).toBeInViewport();
  await expect(page.locator("main")).toHaveAttribute("data-probe", "kept");
});

test("reloading on a sheet opened by a click keeps it open, and closing lands on /", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /EpsilonNet/ }).click();
  await expect(page).toHaveURL(/\/experience\/epsilonnet$/);
  await page.reload();
  const sheet = page.getByRole("dialog", { name: "EpsilonNet" });
  const close = sheet.getByRole("button", { name: "Close" });
  await expect(close).toBeFocused();
  await close.click();
  await expect(sheet).toHaveCount(0);
  await expect(page).toHaveURL(/\/(#experience)?$/);
});

test("a trailing slash lands on the sheet", async ({ page }) => {
  await page.goto("/experience/netdata/");
  await expect(page).toHaveURL(/\/experience\/netdata$/);
  await expect(page.getByRole("dialog", { name: "Netdata" })).toBeVisible();
});

test("unknown sheet paths return 404", async ({ request }) => {
  for (const path of [
    "/experience/nope",
    "/education/nope",
    "/community/nope",
    "/education/netdata",
    "/experiense/netdata",
    "/experience/netdata/extra",
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(404);
  }
});

test("reduced motion opens a sheet by URL with the short fade", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/experience/netdata");
  await expect(page.getByRole("dialog", { name: "Netdata" })).toHaveCSS(
    "animation-name",
    /fade-in/,
  );
});

test.describe("analytics", () => {
  const home = { route: "/", path: "/" };
  const netdata = {
    route: "/experience/[slug]",
    path: "/experience/netdata",
  };

  test("a sheet opened in the page is reported under its route, and closing it is no home view (decisions 171–172)", async ({
    page,
  }) => {
    const adzuna = { route: "/experience/[slug]", path: "/experience/adzuna" };
    await page.goto("/");
    await page.getByRole("button", { name: /Netdata/ }).click();
    const sheet = page.getByRole("dialog", { name: "Netdata" });
    await expect(sheet).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await page.getByRole("button", { name: /Adzuna/ }).click();
    await expect(page.getByRole("dialog", { name: "Adzuna" })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.goForward();
    await expect(page.getByRole("dialog", { name: "Adzuna" })).toBeVisible();
    await expect
      .poll(() => pageviews(page))
      .toEqual([home, netdata, adzuna, adzuna]);
  });

  test("a sheet loaded by URL is reported under its route, and closing it counts / once (decision 172)", async ({
    page,
  }) => {
    const msc = {
      route: "/education/[slug]",
      path: "/education/msc-applied-informatics",
    };
    await page.goto(msc.path);
    const sheet = page.getByRole("dialog", {
      name: "MSc in Applied Informatics",
    });
    await expect(sheet.getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await page.getByRole("button", { name: /Netdata/ }).click();
    await expect(page.getByRole("dialog", { name: "Netdata" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect.poll(() => pageviews(page)).toEqual([msc, home, netdata]);
  });
});
