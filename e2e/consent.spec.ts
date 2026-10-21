import type { Page } from "@playwright/test";
import { GOOGLE, expect, test } from "./fixtures";
import { analyticsEnabled, pageviews } from "./helpers";

// The banner's own specs start with no stored choice (decisions 218–220, 225, 228).
test.use({ consent: null });

const banner = (page: Page) =>
  page.getByRole("region", { name: "Cookie consent" });

/** Opens `path`; skips where the deployment has no GA ID (decision 222). */
async function open(page: Page, path: string): Promise<void> {
  await page.goto(path);
  test.skip(!(await analyticsEnabled(page)), "no GA ID on this deployment");
}

/** The measurement ID the tag was configured with, for the cookie names. */
function configuredId(page: Page): Promise<string> {
  return page.evaluate(() => {
    const entries = (window as { dataLayer?: ArrayLike<unknown>[] }).dataLayer;
    const config = Array.from(entries ?? [])
      .map((entry) => Array.from(entry))
      .find(([command]) => command === "config");
    return String(config?.[1]);
  });
}

test("a first visit asks, and Reject loads nothing from Google", async ({
  page,
}) => {
  const google: string[] = [];
  page.on("request", (request) => {
    if (GOOGLE.test(request.url())) google.push(request.url());
  });
  await open(page, "/");
  await expect(banner(page)).toBeVisible();
  await expect(
    banner(page).getByRole("link", { name: "Privacy" }),
  ).toHaveAttribute("href", "/privacy");
  await banner(page).getByRole("button", { name: "Reject" }).click();
  await expect(banner(page)).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Cookie settings" }),
  ).toBeVisible();
  await expect(banner(page)).toHaveCount(0);
  expect(google).toEqual([]);
});

test("Accept requests the tag and counts the page in view (decision 224)", async ({
  page,
}) => {
  await open(page, "/");
  const tag = page.waitForRequest(/googletagmanager\.com\/gtag\/js\?id=/);
  await banner(page).getByRole("button", { name: "Accept" }).click();
  await tag;
  await expect(banner(page)).toHaveCount(0);
  await expect.poll(() => pageviews(page)).toEqual(["/"]);
});

test("Cookie settings reopens the banner, and Reject after Accept clears the GA cookies (decision 225)", async ({
  page,
  context,
  baseURL,
}) => {
  await open(page, "/");
  await banner(page).getByRole("button", { name: "Accept" }).click();
  await expect.poll(() => pageviews(page)).toEqual(["/"]);
  const id = await configuredId(page);
  // The tag is blocked, so the cookies it would set are planted.
  const names = ["_ga", `_ga_${id.replace(/^G-/, "")}`];
  await context.addCookies(
    names.map((name) => ({ name, value: "1", url: baseURL! })),
  );
  await page.getByRole("button", { name: "Cookie settings" }).click();
  await expect(banner(page)).toBeFocused();
  const reloaded = page.waitForEvent("load");
  await banner(page).getByRole("button", { name: "Reject" }).click();
  await reloaded;
  const left = (await context.cookies()).map((cookie) => cookie.name);
  expect(left.filter((name) => names.includes(name))).toEqual([]);
  await expect(banner(page)).toHaveCount(0);
  expect(await pageviews(page)).toEqual([]);
});

test.describe("over a sheet (decision 228)", () => {
  test("on a sheet loaded by URL, the bar keeps clear of the sheet's end and Accept works", async ({
    page,
  }) => {
    await open(page, "/experience/netdata");
    const sheet = page.getByRole("dialog", { name: "Netdata" });
    await expect(banner(page)).toBeVisible();
    await sheet.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
    const barTop = (await banner(page).boundingBox())!.y;
    const end = await sheet.evaluate(
      (el) => el.lastElementChild!.getBoundingClientRect().bottom,
    );
    expect(end).toBeLessThanOrEqual(barTop + 1);
    await banner(page).getByRole("button", { name: "Accept" }).click();
    await expect(banner(page)).toHaveCount(0);
    await expect.poll(() => pageviews(page)).toEqual(["/experience/netdata"]);
  });

  test("on a sheet opened in the page, Reject works", async ({ page }) => {
    await open(page, "/");
    await expect(banner(page)).toBeVisible();
    await page.getByRole("button", { name: /Netdata/ }).click();
    await expect(page.getByRole("dialog", { name: "Netdata" })).toBeVisible();
    await banner(page).getByRole("button", { name: "Reject" }).click();
    await expect(banner(page)).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: "Netdata" })).toBeVisible();
  });

  test("Tab from the sheet reaches the bar", async ({ page }) => {
    await open(page, "/experience/netdata");
    const sheet = page.getByRole("dialog", { name: "Netdata" });
    await expect(sheet.getByRole("button", { name: "Close" })).toBeFocused();
    await expect(banner(page)).toBeVisible();
    const inBar = () =>
      page.evaluate(
        () => !!document.activeElement?.closest("[data-consent-banner]"),
      );
    for (let i = 0; i < 40 && !(await inBar()); i++) {
      await page.keyboard.press("Tab");
    }
    expect(await inBar()).toBe(true);
  });
});
