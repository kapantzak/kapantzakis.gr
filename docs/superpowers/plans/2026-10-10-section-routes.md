# Section Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the section hash with real paths (`/experience`, `/education`, `/community`, `/writing`, `/contact`) that follow the scroll, load at their region and behave like the home page.

**Architecture:** `lib/nav.ts` names five regions and says which pathnames are the home page. Each region gets an empty route in `app/(home)/` whose HTML carries a tiny inline script that jumps to the region before the first paint; a client `RegionScroll` covers arrivals by client navigation. `NavLinks` tracks the deepest region in the reading band and replaces the URL's path with a plain state object, holding a path the page arrived on until the first scroll; a client `SectionLink` pushes a region's path and scrolls to it. Everything keyed to "home" (`BrandLink`, `BackToTop`, `scrollToTop`, `PageAnalytics`) accepts every home path.

**Tech Stack:** Next.js 16.3.8 App Router, React 19.3.0, TypeScript, CSS Modules, Vitest 5 + React Testing Library + jsdom, Playwright, ESLint (`eslint-config-next`, `eslint-plugin-react-hooks` 7) + Prettier, npm, Node 24.

**Spec:** `docs/superpowers/specs/2026-10-02-personal-website-design.md`, decisions 173–184 and section 26.

## Global Constraints

- Package manager is **npm** only; add no dependencies.
- Region paths, exactly: `/experience`, `/education`, `/community`, `/writing`, `/contact`; element ids `experience`, `education`, `community`, `writing`, `contact`; Education and Community mark the Experience nav item (decisions 173, 181).
- Scrolling replaces the current history entry with a plain state object (`{}`) and drops any hash; it never pushes (decision 174).
- A nav or hero click on a home path pushes the region's path with `history.pushState(null, "", path)`, or replaces it with `{}` when it is already the URL (decision 175).
- Section paths: canonical `/`, the home title, not in the sitemap (decisions 178–179).
- The inline script jumps only when the navigation type is `navigate` (decision 176).
- `components/SheetHost.tsx` and `components/DetailSheet.tsx` are **not** modified.
- No non-null assertions (`!`) in source files; the codebase has none.
- Code comments: short, professional, explain "why", and cite decisions as `(decision N)` like the surrounding code.
- Git: stage files by explicit path, never `git add -A` or `git add .`. Commit messages are an imperative sentence describing the change (as in `git log`) and carry no tool or AI attribution and no co-author trailer.
- Before every commit: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run format:check` and `npm run e2e` pass.

## Review Focus

- Reloading part-way through a region must restore the exact position, not jump to the region's top → e2e in Task 2.
- On a phone, a loaded `/community` must keep `/community` and the Experience highlight, though the group ends above the band (decision 184) → e2e in Task 4 (runs in the `mobile` project).
- Back from a sheet opened at `/education` must return to `/education` → e2e in Task 4.
- A nav link from the 404 page must land on its region even though Next.js scrolls a new segment to the top → e2e in Task 4.
- Scrolling through every region must send no page view (decision 180) → e2e in Task 4.

---

### Task 1: Regions and home paths

**Files:**
- Modify: `lib/nav.ts`
- Modify: `lib/nav.test.ts`
- Modify: `lib/scroll-top.ts:4-15`
- Modify: `lib/scroll-top.test.ts:17-24`
- Modify: `components/BrandLink.tsx:6,16`
- Modify: `components/BrandLink.test.tsx`
- Modify: `components/BackToTop.tsx:3,7-9`
- Modify: `components/BackToTop.test.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces (in `lib/nav.ts`):
  - `type RegionId = "experience" | "education" | "community" | "writing" | "contact"`
  - `const REGIONS: RegionId[]` in reading order
  - `function regionPath(id: RegionId): string` → `"/<id>"`
  - `function regionOf(pathname: string): RegionId | null`
  - `function isHomePath(pathname: string): boolean`
  - `function sectionOf(id: RegionId): SectionId`
  - `sectionHref` stays until Task 4.

- [ ] **Step 1: Write the failing tests**

In `lib/nav.test.ts`, replace the import line with:

```ts
import {
  NAV_ITEMS,
  REGIONS,
  isHomePath,
  regionOf,
  regionPath,
  sectionHref,
  sectionOf,
} from "./nav";
```

and append:

```ts
describe("REGIONS", () => {
  it("lists every place with a path of its own, in reading order (decision 173)", () => {
    expect(REGIONS).toEqual([
      "experience",
      "education",
      "community",
      "writing",
      "contact",
    ]);
    expect(REGIONS.map(regionPath)).toEqual([
      "/experience",
      "/education",
      "/community",
      "/writing",
      "/contact",
    ]);
  });

  it("marks Experience for the groups inside it (decision 181)", () => {
    expect(REGIONS.map(sectionOf)).toEqual([
      "experience",
      "experience",
      "experience",
      "writing",
      "contact",
    ]);
  });
});

describe("regionOf and isHomePath", () => {
  it("names a region only for its exact path", () => {
    expect(regionOf("/education")).toBe("education");
    for (const path of [
      "/",
      "/education/bsc-economic-science",
      "/Education",
      "/education/",
      "/no-such-page",
    ]) {
      expect(regionOf(path), path).toBeNull();
    }
  });

  it("counts / and every region path as the home page (decision 183)", () => {
    for (const path of ["/", ...REGIONS.map(regionPath)]) {
      expect(isHomePath(path), path).toBe(true);
    }
    for (const path of ["/experience/netdata", "/no-such-page", ""]) {
      expect(isHomePath(path), path).toBe(false);
    }
  });
});
```

In `lib/scroll-top.test.ts`, replace the test `"drops the section hash but keeps the history state"` (lines 17–24) with:

```ts
  it("returns a section path or hash to /, with a plain state object (decision 174)", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    history.replaceState({ key: "router" }, "", "/writing?q=1#top");
    scrollToTop();
    expect(window.location.pathname + window.location.search).toBe("/?q=1");
    expect(window.location.hash).toBe("");
    expect(history.state).toEqual({});
  });

  it("leaves the history entry alone when the URL is already /", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    history.replaceState({ key: "router" }, "", "/");
    scrollToTop();
    expect(history.state).toEqual({ key: "router" });
  });
```

In `components/BrandLink.test.tsx`, add after the test `"scrolls to the top on the home page instead of navigating"`:

```ts
  it("scrolls to the top on a section path too (decision 183)", () => {
    pathname.current = "/writing";
    const notPrevented = fireEvent.click(renderLink());
    expect(notPrevented).toBe(false);
    expect(scrollToTop).toHaveBeenCalledOnce();
  });
```

In `components/BackToTop.test.tsx`, add before `"is absent away from the home page"`:

```ts
  it("is shown on a section path too (decision 183)", () => {
    pathname.current = "/community";
    render(<BackToTop />);
    expect(screen.getByRole("button", { name: "Back to top" })).toBeVisible();
  });
```

and extend `"is absent away from the home page"` so it also covers a sheet path:

```ts
  it.each(["/no-such-page", "/experience/netdata"])(
    "is absent away from the home page (%s)",
    (path) => {
      pathname.current = path;
      render(<BackToTop />);
      expect(screen.queryByRole("button")).toBeNull();
    },
  );
```

(replacing the old single-path test).

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/nav.test.ts lib/scroll-top.test.ts components/BrandLink.test.tsx components/BackToTop.test.tsx`
Expected: FAIL — `REGIONS`/`regionPath`/`regionOf`/`isHomePath`/`sectionOf` are not exported; `scrollToTop` leaves `/writing`; BrandLink does not scroll on `/writing`; BackToTop renders nothing on `/community`.

- [ ] **Step 3: Implement**

Replace `lib/nav.ts` with:

```ts
/** In-page sections of the one-page site (decision 40); `id` matches the section's element id. */
export const NAV_ITEMS = [
  { id: "experience", label: "Experience" },
  { id: "writing", label: "Writing" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof NAV_ITEMS)[number]["id"];

/** Absolute so the links also work from the 404 page. */
export function sectionHref(id: SectionId): string {
  return `/#${id}`;
}

// Each place with a path of its own (decision 173) and the nav item it marks as current (decision 181).
const REGION_SECTIONS = {
  experience: "experience",
  education: "experience",
  community: "experience",
  writing: "writing",
  contact: "contact",
} as const satisfies Record<string, SectionId>;

/** A region's element id; Education and Community are groups inside Experience. */
export type RegionId = keyof typeof REGION_SECTIONS;

/** In reading order, so a group comes after the section it sits in (decision 174). */
export const REGIONS = Object.keys(REGION_SECTIONS) as RegionId[];

/** A region's own path; absolute, so links also work from the 404 page (decision 173). */
export function regionPath(id: RegionId): string {
  return `/${id}`;
}

/** The region a pathname names; null for `/` and every other path. */
export function regionOf(pathname: string): RegionId | null {
  return REGIONS.find((id) => regionPath(id) === pathname) ?? null;
}

/** `/` and the region paths are all the home page (decision 183). */
export function isHomePath(pathname: string): boolean {
  return pathname === "/" || regionOf(pathname) !== null;
}

/** The nav item a region marks as current (decision 181). */
export function sectionOf(id: RegionId): SectionId {
  return REGION_SECTIONS[id];
}
```

In `lib/scroll-top.ts`, replace the function with:

```ts
/** Scrolls the home page back to the top and returns the URL to `/` (decisions 94–97, 174). */
export function scrollToTop(): void {
  // No `behavior`: the CSS `scroll-behavior` on <html> decides, so reduced motion jumps instead of gliding.
  window.scrollTo({ top: 0 });
  if (window.location.pathname !== "/" || window.location.hash) {
    // A plain state object, so Next.js syncs usePathname to `/` (section 26).
    history.replaceState({}, "", "/" + window.location.search);
  }
  document.getElementById(BRAND_LINK_ID)?.focus({ preventScroll: true });
}
```

In `components/BrandLink.tsx`, add `import { isHomePath } from "@/lib/nav";` after the `next/navigation` import and change line 16 to:

```ts
  const onHome = isHomePath(usePathname());
```

In `components/BackToTop.tsx`, add `import { isHomePath } from "@/lib/nav";` after the `next/navigation` import, and change the comment and check to:

```tsx
// Home page only, on any of its paths: the other pages do not scroll (decisions 98, 183).
export function BackToTop() {
  if (!isHomePath(usePathname())) return null;
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/nav.test.ts lib/scroll-top.test.ts components/BrandLink.test.tsx components/BackToTop.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run the gates and commit**

Run: `npm run lint && npm run typecheck && npm run test && npm run format:check && npm run e2e`
Expected: all pass (no route yet serves a region path, so e2e is unchanged).

```bash
git add lib/nav.ts lib/nav.test.ts lib/scroll-top.ts lib/scroll-top.test.ts components/BrandLink.tsx components/BrandLink.test.tsx components/BackToTop.tsx components/BackToTop.test.tsx
git commit -m "Name the home page's regions and treat their paths as home"
```

---

### Task 2: Region routes that land on their region

**Files:**
- Create: `lib/region-entry.ts`, `lib/region-entry.test.ts`
- Create: `components/RegionEntry.tsx`
- Create: `components/RegionScroll.tsx`, `components/RegionScroll.test.tsx`
- Create: `app/(home)/experience/page.tsx`, `app/(home)/education/page.tsx`, `app/(home)/community/page.tsx`, `app/(home)/writing/page.tsx`, `app/(home)/contact/page.tsx`
- Modify: `app/(home)/layout.tsx`
- Modify: `components/Experience.tsx` (`GroupData` line 23, `groupsOf` Education and Community entries, `Group`)
- Modify: `e2e/helpers.ts`, `e2e/migration.spec.ts:4-16`
- Create: `e2e/section-routes.spec.ts`

**Interfaces:**
- Consumes: `RegionId`, `regionOf` from Task 1.
- Produces:
  - `function regionEntryScript(id: RegionId): string` and `Window.__regionPlaced?: boolean` (`lib/region-entry.ts`)
  - `<RegionEntry id={RegionId} />` (server component), `<RegionScroll />` (client component)
  - `REGION_PAGES: { path: string; id: string }[]` in `e2e/helpers.ts`
  - Elements `#education` and `#community` on the home page.

- [ ] **Step 1: Write the failing unit tests**

Create `lib/region-entry.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { regionEntryScript } from "./region-entry";

/** Runs the script as the browser would, for a navigation of `type`. */
function run(type: string | undefined) {
  vi.stubGlobal("performance", {
    getEntriesByType: () => (type ? [{ type }] : []),
  });
  const region = document.createElement("section");
  region.id = "writing";
  region.scrollIntoView = vi.fn();
  document.body.append(region);
  new Function(regionEntryScript("writing"))();
  return region.scrollIntoView;
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  delete window.__regionPlaced;
});

describe("regionEntryScript", () => {
  it("jumps to its region on a fresh navigation and marks the document placed (decision 176)", () => {
    expect(run("navigate")).toHaveBeenCalledWith({ behavior: "instant" });
    expect(window.__regionPlaced).toBe(true);
  });

  it.each(["reload", "back_forward", undefined])(
    "leaves the position to the browser on %s",
    (type) => {
      expect(run(type)).not.toHaveBeenCalled();
      expect(window.__regionPlaced).toBe(true);
    },
  );
});
```

Create `components/RegionScroll.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RegionScroll } from "./RegionScroll";

function region(id: string): HTMLElement {
  const el = document.createElement("section");
  el.id = id;
  el.scrollIntoView = vi.fn();
  document.body.append(el);
  return el;
}

afterEach(() => {
  document.body.replaceChildren();
  delete window.__regionPlaced;
  history.replaceState(null, "", "/");
});

describe("RegionScroll", () => {
  it("jumps to the region a client navigation arrived on (decision 182)", () => {
    history.replaceState(null, "", "/writing");
    const writing = region("writing");
    render(<RegionScroll />);
    expect(writing.scrollIntoView).toHaveBeenCalledWith({ behavior: "instant" });
  });

  it("leaves a document its inline script placed to the browser (decision 176)", () => {
    history.replaceState(null, "", "/writing");
    window.__regionPlaced = true;
    const writing = region("writing");
    render(<RegionScroll />);
    expect(writing.scrollIntoView).not.toHaveBeenCalled();
  });

  it("does nothing on /", () => {
    const writing = region("writing");
    render(<RegionScroll />);
    expect(writing.scrollIntoView).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run lib/region-entry.test.ts components/RegionScroll.test.tsx`
Expected: FAIL — `./region-entry` and `./RegionScroll` do not exist.

- [ ] **Step 3: Implement the script, the components and the routes**

Create `lib/region-entry.ts`:

```ts
import type { RegionId } from "./nav";

declare global {
  interface Window {
    /** Set by a section path's inline script: the document was placed while it loaded (decision 176). */
    __regionPlaced?: boolean;
  }
}

/** The script a section path's HTML runs while it is parsed, before the first paint (decision 176). */
export function regionEntryScript(id: RegionId): string {
  // Only a fresh navigation jumps; a reload, or a Back or Forward that reloads, leaves the browser to restore the exact position.
  return [
    "window.__regionPlaced=true;",
    'if(performance.getEntriesByType("navigation")[0]?.type==="navigate")',
    `document.getElementById(${JSON.stringify(id)})?.scrollIntoView({behavior:"instant"});`,
  ].join("");
}
```

Create `components/RegionEntry.tsx`:

```tsx
import type { RegionId } from "@/lib/nav";
import { regionEntryScript } from "@/lib/region-entry";

// Rendered after the home page's markup, so a fresh load is at its region before the first paint; after a client
// navigation React renders it without running it, and RegionScroll lands there instead (decisions 176, 182).
export function RegionEntry({ id }: { id: RegionId }) {
  return <script dangerouslySetInnerHTML={{ __html: regionEntryScript(id) }} />;
}
```

Create `components/RegionScroll.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { regionOf } from "@/lib/nav";

// Within one document the home page mounts again only after a link from the 404 page, where the region's inline
// script never runs (decision 182).
export function RegionScroll() {
  // An effect, not a layout effect, so it runs after Next.js's own scroll for the navigation (section 26).
  useEffect(() => {
    if (window.__regionPlaced) return;
    const region = regionOf(window.location.pathname);
    if (region) {
      document.getElementById(region)?.scrollIntoView({ behavior: "instant" });
    }
  }, []);
  return null;
}
```

Create `app/(home)/experience/page.tsx`:

```tsx
import type { Metadata } from "next";
import { RegionEntry } from "@/components/RegionEntry";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// The home layout renders the page; this route lands on its region under the home title (decisions 173, 176, 178–179).
export default function ExperiencePage() {
  return <RegionEntry id="experience" />;
}
```

Create the other four the same way, changing only the component name and the id:
- `app/(home)/education/page.tsx`: `export default function EducationPage()` with `<RegionEntry id="education" />`
- `app/(home)/community/page.tsx`: `export default function CommunityPage()` with `<RegionEntry id="community" />`
- `app/(home)/writing/page.tsx`: `export default function WritingPage()` with `<RegionEntry id="writing" />`
- `app/(home)/contact/page.tsx`: `export default function ContactPage()` with `<RegionEntry id="contact" />`

Each file carries the same `metadata` export and the same comment.

In `app/(home)/layout.tsx`, add `import { RegionScroll } from "@/components/RegionScroll";` after the `PostList` import, and render it after `{children}`:

```tsx
      {children}
      <RegionScroll />
    </>
```

In `components/Experience.tsx`:
- add `import type { RegionId } from "@/lib/nav";` after the `@/content/profile` import;
- change line 23 to:

```ts
type GroupData = {
  title: string;
  /** The group's own path, for a group that has one (decision 173). */
  id?: RegionId;
  entries: Entry[];
};
```

- in `groupsOf`, add `id: "education",` after `title: "Education",` and `id: "community",` after `title: "Community",`;
- change `Group` to:

```tsx
function Group({ title, id, entries }: GroupData) {
  return (
    <div className={styles.group} id={id}>
```

(the rest of `Group` is unchanged).

- [ ] **Step 4: Run the unit tests to verify they pass**

Run: `npx vitest run lib/region-entry.test.ts components/RegionScroll.test.tsx`
Expected: PASS.

- [ ] **Step 5: Write the e2e tests**

Append to `e2e/helpers.ts`:

```ts
/** Every section path and the element it lands on (decision 173). */
export const REGION_PAGES = [
  { path: "/experience", id: "experience" },
  { path: "/education", id: "education" },
  { path: "/community", id: "community" },
  { path: "/writing", id: "writing" },
  { path: "/contact", id: "contact" },
];
```

In `e2e/migration.spec.ts`, change the comment and drop `/contact` from the retired list:

```ts
// The site is one page, with a path per sheet and per section (decisions 30–31, 35, 161, 173).
test("retired routes return 404", async ({ request }) => {
  for (const path of ["/about", "/posts", "/projects", "/posts/draft-fixture"]) {
```

Create `e2e/section-routes.spec.ts`:

```ts
import { expect, type Page, test } from "@playwright/test";
import { HOME_TITLE, REGION_PAGES } from "./helpers";

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

for (const { path, id } of REGION_PAGES) {
  test(`${path} loads at its region, with the home title and canonical / (decisions 173, 176, 178–179)`, async ({
    page,
  }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`#${id}`)).toBeInViewport();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page).toHaveTitle(HOME_TITLE);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /^https:\/\/kapantzakis\.gr\/?$/,
    );
  });
}

test("a fresh load is at its region from the first frame (decision 176)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    requestAnimationFrame(() => {
      (window as { firstFrameY?: number }).firstFrameY = Math.round(
        window.scrollY,
      );
    });
  });
  await page.goto("/writing");
  await expect(page.locator("#writing")).toBeInViewport();
  const firstFrameY = await page.evaluate(
    () => (window as { firstFrameY?: number }).firstFrameY,
  );
  expect(firstFrameY).toBeGreaterThan(0);
  expect(firstFrameY).toBe(await scrollY(page));
});

test("a reload inside a region keeps the exact position (decision 176)", async ({
  page,
}) => {
  await page.goto("/writing");
  await expect(page.locator("#writing")).toBeInViewport();
  await page.evaluate(() => window.scrollBy({ top: 200, behavior: "instant" }));
  const y = await scrollY(page);
  await page.reload();
  await expect.poll(() => scrollY(page)).toBe(y);
});
```

- [ ] **Step 6: Run the e2e tests**

Run: `npx playwright test e2e/section-routes.spec.ts e2e/migration.spec.ts`
Expected: PASS (desktop, mobile; Firefox skips as it does for every spec but the heading one).

- [ ] **Step 7: Run the gates and commit**

Run: `npm run lint && npm run typecheck && npm run test && npm run format:check && npm run e2e`
Expected: all pass.

```bash
git add lib/region-entry.ts lib/region-entry.test.ts components/RegionEntry.tsx components/RegionScroll.tsx components/RegionScroll.test.tsx "app/(home)/experience/page.tsx" "app/(home)/education/page.tsx" "app/(home)/community/page.tsx" "app/(home)/writing/page.tsx" "app/(home)/contact/page.tsx" "app/(home)/layout.tsx" components/Experience.tsx e2e/helpers.ts e2e/migration.spec.ts e2e/section-routes.spec.ts
git commit -m "Give each home page region a route that lands on it"
```

---

### Task 3: One page in analytics

**Files:**
- Modify: `components/PageAnalytics.tsx` (`Tracked` and `track`, lines 8–33)
- Modify: `components/PageAnalytics.test.tsx`
- Modify: `e2e/helpers.ts`, `e2e/sheet-routes.spec.ts` (move `pageviews`)
- Modify: `e2e/section-routes.spec.ts`

**Interfaces:**
- Consumes: `isHomePath` from Task 1; the region routes from Task 2.
- Produces: `pageviews(page: Page): Promise<unknown[]>` in `e2e/helpers.ts`.

- [ ] **Step 1: Write the failing unit tests**

Append inside `describe("PageAnalytics", …)` in `components/PageAnalytics.test.tsx`:

```tsx
  it("sends nothing for moves between / and the section paths (decision 180)", () => {
    visit("/", {}, "/experience", "/education", "/", NETDATA.path, "/experience", "/writing");
    expect(pageviews()).toEqual([HOME, NETDATA]);
  });

  it("counts a section path a page load or the 404 page arrives on, under its own path (decision 180)", () => {
    visit("/nope", {}, "/writing", "/contact");
    expect(pageviews()).toEqual([
      { route: "/nope", path: "/nope" },
      { route: "/writing", path: "/writing" },
    ]);
  });

  it("counts the home page once after closing a sheet the page load opened, whichever path it shows (decision 180)", () => {
    visit(MSC.path, { slug: "msc-applied-informatics" }, "/", "/education", MSC.path, "/education");
    expect(pageviews()).toEqual([MSC, HOME, MSC]);
  });
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run components/PageAnalytics.test.tsx`
Expected: FAIL — the three new tests receive extra page views for `/experience`, `/education`, `/writing` and `/contact`.

- [ ] **Step 3: Implement**

In `components/PageAnalytics.tsx`, add `import { isHomePath } from "@/lib/nav";` after the `next/navigation` import, and replace `Tracked` and `track` with:

```ts
type Tracked = {
  path: string;
  onSheet: boolean;
  home: boolean;
  homeCounted: boolean;
  /** The page view to report, or null for one that does not count. */
  view: View | null;
};

function track(
  previous: Tracked | null,
  path: string,
  route: string,
  onSheet: boolean,
): Tracked {
  const home = isHomePath(path);
  // `/` and the section paths are one page, so moving between them is not a view (decision 180), nor is closing a
  // sheet over the home page once it has counted (decision 172).
  const counts = !(
    home &&
    (previous?.home || (previous?.onSheet && previous.homeCounted))
  );
  return {
    path,
    onSheet,
    home,
    homeCounted: (previous?.homeCounted ?? false) || home,
    view: counts ? { route, path } : null,
  };
}
```

- [ ] **Step 4: Run the unit tests to verify they pass**

Run: `npx vitest run components/PageAnalytics.test.tsx`
Expected: PASS, 7 tests.

- [ ] **Step 5: Share the e2e helper and add the load test**

Move the `pageviews` function from `e2e/sheet-routes.spec.ts` (its doc comment and body, unchanged) to the end of `e2e/helpers.ts`, exported, and add `type Page` to the helpers' `@playwright/test` import (it already imports `type Page`). In `e2e/sheet-routes.spec.ts`, delete the local function, drop `type Page` from its `@playwright/test` import if nothing else uses it, and add `pageviews` to its `./helpers` import.

Append to `e2e/section-routes.spec.ts` (adding `pageviews` to its `./helpers` import):

```ts
test("a section path load counts once, under its own path (decision 180)", async ({
  page,
}) => {
  await page.goto("/writing");
  await expect(page.locator("#writing")).toBeInViewport();
  await expect
    .poll(() => pageviews(page))
    .toEqual([{ route: "/writing", path: "/writing" }]);
});
```

- [ ] **Step 6: Run the gates and commit**

Run: `npm run lint && npm run typecheck && npm run test && npm run format:check && npm run e2e`
Expected: all pass.

```bash
git add components/PageAnalytics.tsx components/PageAnalytics.test.tsx e2e/helpers.ts e2e/sheet-routes.spec.ts e2e/section-routes.spec.ts
git commit -m "Count the home page's paths as one page in analytics"
```

---

### Task 4: The path follows the scroll, and section links

**Files:**
- Create: `components/SectionLink.tsx`, `components/SectionLink.test.tsx`
- Modify: `components/NavLinks.tsx` (whole file)
- Modify: `components/NavLinks.test.tsx` (whole file)
- Modify: `components/Hero.tsx:48-50`, `components/Hero.test.tsx`
- Modify: `lib/nav.ts`, `lib/nav.test.ts` (remove `sectionHref`)
- Modify: `e2e/navigation.spec.ts` (whole file), `e2e/back-to-top.spec.ts:37-49`, `e2e/home.spec.ts:267-268`, `e2e/sheet-routes.spec.ts`, `e2e/section-routes.spec.ts`

**Interfaces:**
- Consumes: `REGIONS`, `RegionId`, `regionPath`, `regionOf`, `isHomePath`, `sectionOf`, `NAV_ITEMS` (Task 1); `#education`, `#community`, region routes, `REGION_PAGES` (Task 2); `pageviews` (Task 3).
- Produces: `<SectionLink id={RegionId} className? aria-current?>` (client component).

- [ ] **Step 1: Write the failing unit tests**

Create `components/SectionLink.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SectionLink } from "./SectionLink";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

function renderLink() {
  render(<SectionLink id="writing">Writing</SectionLink>);
  const region = document.createElement("section");
  region.id = "writing";
  region.scrollIntoView = vi.fn();
  document.body.append(region);
  return { link: screen.getByRole("link", { name: "Writing" }), region };
}

afterEach(() => {
  document.body.replaceChildren();
  history.replaceState(null, "", "/");
});

describe("SectionLink", () => {
  it("links to its region's path", () => {
    expect(renderLink().link).toHaveAttribute("href", "/writing");
  });

  it("on the home page, pushes the path and scrolls to the region (decision 175)", () => {
    pathname.current = "/";
    const before = history.length;
    const { link, region } = renderLink();
    expect(fireEvent.click(link)).toBe(false);
    expect(window.location.pathname).toBe("/writing");
    expect(history.length).toBe(before + 1);
    expect(region.scrollIntoView).toHaveBeenCalledWith();
  });

  it("adds no history entry when the path is already the URL", () => {
    pathname.current = "/writing";
    history.replaceState(null, "", "/writing");
    const before = history.length;
    const { link, region } = renderLink();
    fireEvent.click(link);
    expect(history.length).toBe(before);
    expect(history.state).toEqual({});
    expect(region.scrollIntoView).toHaveBeenCalledOnce();
  });

  it.each(["metaKey", "ctrlKey", "shiftKey", "altKey"])(
    "leaves a %s click to the browser",
    (key) => {
      pathname.current = "/";
      const { link, region } = renderLink();
      // Keeps jsdom and the router from navigating; only the handler's choice is under test.
      link.addEventListener("click", (event) => event.preventDefault());
      fireEvent.click(link, { [key]: true });
      expect(window.location.pathname).toBe("/");
      expect(region.scrollIntoView).not.toHaveBeenCalled();
    },
  );

  it("leaves navigation to the link away from the home page", () => {
    pathname.current = "/no-such-page";
    const { link, region } = renderLink();
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(region.scrollIntoView).not.toHaveBeenCalled();
  });
});
```

Replace `components/NavLinks.test.tsx` with:

```tsx
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavLinks } from "./NavLinks";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

function stubObserver(): { fire: Callback } {
  let callback: Callback = () => {};
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: Callback) {
        callback = cb;
      }
      observe() {}
      disconnect() {}
    },
  );
  return { fire: (entries) => callback(entries) };
}

function region(id: string): HTMLElement {
  const el = document.createElement("section");
  el.id = id;
  document.body.append(el);
  return el;
}

/** As if the browser had loaded the page on `path`. */
function loadAt(path: string) {
  pathname.current = path;
  history.replaceState(null, "", path);
}

/** The labels of the links marked current. */
function current(): string[] {
  return screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current") === "true")
    .map((link) => link.textContent ?? "");
}

beforeEach(() => {
  // The release from decision 184's hold waits a frame; run it at once.
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  history.replaceState(null, "", "/");
});

describe("NavLinks", () => {
  it("links to every section's path (decision 175)", () => {
    loadAt("/");
    render(<NavLinks />);
    expect(
      screen.getAllByRole("link").map((a) => a.getAttribute("href")),
    ).toEqual(["/experience", "/writing", "/contact"]);
  });

  it("marks only the section in view as current", () => {
    loadAt("/");
    const observer = stubObserver();
    const writing = region("writing");
    render(<NavLinks />);
    act(() => observer.fire([{ target: writing, isIntersecting: true }]));
    expect(current()).toEqual(["Writing"]);
    act(() => observer.fire([{ target: writing, isIntersecting: false }]));
    expect(current()).toEqual([]);
  });

  it("writes the current region into the path without adding history (decision 174)", () => {
    loadAt("/");
    history.replaceState({ key: "router" }, "", "/?q=1#top");
    const before = history.length;
    const observer = stubObserver();
    const writing = region("writing");
    render(<NavLinks />);
    act(() => observer.fire([{ target: writing, isIntersecting: true }]));
    expect(window.location.pathname).toBe("/writing");
    expect(window.location.search).toBe("?q=1");
    expect(window.location.hash).toBe("");
    expect(history.state).toEqual({});
    expect(history.length).toBe(before);
    act(() => observer.fire([{ target: writing, isIntersecting: false }]));
    expect(window.location.pathname).toBe("/");
  });

  it("prefers a group inside Experience, and marks Experience for it (decisions 174, 181)", () => {
    loadAt("/");
    const observer = stubObserver();
    const experience = region("experience");
    const education = region("education");
    render(<NavLinks />);
    act(() =>
      observer.fire([
        { target: experience, isIntersecting: true },
        { target: education, isIntersecting: true },
      ]),
    );
    expect(window.location.pathname).toBe("/education");
    expect(current()).toEqual(["Experience"]);
    act(() => observer.fire([{ target: education, isIntersecting: false }]));
    expect(window.location.pathname).toBe("/experience");
  });

  it("keeps the path a page arrived on, and marks its section, until the first scroll (decision 184)", () => {
    loadAt("/community");
    const observer = stubObserver();
    const community = region("community");
    const writing = region("writing");
    render(<NavLinks />);
    expect(current()).toEqual(["Experience"]);
    act(() =>
      observer.fire([
        { target: community, isIntersecting: false },
        { target: writing, isIntersecting: true },
      ]),
    );
    expect(window.location.pathname).toBe("/community");
    expect(current()).toEqual(["Experience"]);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(window.location.pathname).toBe("/writing");
    expect(current()).toEqual(["Writing"]);
  });

  it("after the first scroll, an empty band gives / (decisions 174, 184)", () => {
    loadAt("/writing");
    const observer = stubObserver();
    const writing = region("writing");
    render(<NavLinks />);
    act(() => observer.fire([{ target: writing, isIntersecting: false }]));
    expect(window.location.pathname).toBe("/writing");
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(window.location.pathname).toBe("/");
    expect(current()).toEqual([]);
  });

  it("keeps an incoming hash until a region becomes current", () => {
    loadAt("/");
    history.replaceState(null, "", "/#contact");
    const observer = stubObserver();
    const experience = region("experience");
    render(<NavLinks />);
    act(() => observer.fire([{ target: experience, isIntersecting: false }]));
    expect(window.location.hash).toBe("#contact");
  });

  it("does not carry a stale region back to the home page", () => {
    loadAt("/");
    const observer = stubObserver();
    const experience = region("experience");
    const { rerender } = render(<NavLinks />);
    act(() => observer.fire([{ target: experience, isIntersecting: true }]));
    loadAt("/no-such-page");
    rerender(<NavLinks />);
    loadAt("/");
    rerender(<NavLinks />);
    expect(window.location.pathname).toBe("/");
    expect(current()).toEqual([]);
  });

  it.each(["/no-such-page", "/experience/netdata"])(
    "marks nothing and leaves the URL alone away from the home page (%s)",
    (path) => {
      loadAt(path);
      history.replaceState(null, "", `${path}#top`);
      render(<NavLinks />);
      expect(current()).toEqual([]);
      expect(window.location.pathname + window.location.hash).toBe(
        `${path}#top`,
      );
    },
  );
});
```

In `components/Hero.test.tsx`, add `vi` to the vitest import, add after the imports:

```tsx
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
```

and append inside `describe("Hero", …)`:

```tsx
  it("cues the reader to Experience's path (decision 175)", () => {
    render(
      <Hero
        eyebrow="Role"
        headline="I build things for the web."
        intro={["Intro."]}
      />,
    );
    expect(screen.getByRole("link", { name: "Scroll" })).toHaveAttribute(
      "href",
      "/experience",
    );
  });
```

In `lib/nav.test.ts`, remove `sectionHref` from the import and delete the `describe("sectionHref", …)` block.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run components/SectionLink.test.tsx components/NavLinks.test.tsx components/Hero.test.tsx lib/nav.test.ts`
Expected: FAIL — `./SectionLink` does not exist; NavLinks links to `/#…` and writes hashes; the hero cue's `href` is `#experience`. (`lib/nav.test.ts` still passes.)

- [ ] **Step 3: Implement**

Create `components/SectionLink.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { isHomePath, regionPath, type RegionId } from "@/lib/nav";

type Props = {
  id: RegionId;
  className?: string;
  "aria-current"?: "true";
  children: ReactNode;
};

// On the home page a Link would be a router navigation that scrolls to the top, so the click is handled here; from
// another page (the 404) the Link navigates and the home page lands on the region (decision 175).
export function SectionLink({
  id,
  className,
  "aria-current": ariaCurrent,
  children,
}: Props) {
  const onHome = isHomePath(usePathname());
  const path = regionPath(id);
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const modified =
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey;
    if (!onHome || modified) return;
    event.preventDefault();
    // Plain state objects, so Next.js syncs usePathname (section 26); clicking the current path adds no Back step.
    if (window.location.pathname === path) history.replaceState({}, "", path);
    else history.pushState(null, "", path);
    // No `behavior`: the CSS `scroll-behavior` on <html> decides, so reduced motion jumps (decision 96).
    document.getElementById(id)?.scrollIntoView();
  }
  return (
    <Link
      href={path}
      className={className}
      aria-current={ariaCurrent}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
```

Replace `components/NavLinks.tsx` with:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  NAV_ITEMS,
  REGIONS,
  type RegionId,
  isHomePath,
  regionOf,
  regionPath,
  sectionOf,
} from "@/lib/nav";
import styles from "./Nav.module.css";
import { SectionLink } from "./SectionLink";

// A region counts as current while it crosses a band around the middle of the viewport.
const BAND = "-45% 0px -50% 0px";

// `undefined` while no report counts: until a region has been current, so a hash the page was opened with survives
// the first report, and, when tracking starts on a section path, until the first scroll (decision 184).
function useRegionInView(enabled: boolean): RegionId | null | undefined {
  const [current, setCurrent] = useState<RegionId | null>();
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    const inBand = new Set<RegionId>();
    let latest: RegionId | null = null;
    let holding = regionOf(window.location.pathname) !== null;
    const report = () =>
      setCurrent((value) =>
        value === undefined && latest === null ? undefined : latest,
      );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as RegionId;
          if (entry.isIntersecting) inBand.add(id);
          else inBand.delete(id);
        }
        // A group inside Experience comes after it in REGIONS, so it wins (decision 174).
        latest = REGIONS.findLast((id) => inBand.has(id)) ?? null;
        if (!holding) report();
      },
      { rootMargin: BAND },
    );
    for (const id of REGIONS) {
      const region = document.getElementById(id);
      if (region) observer.observe(region);
    }
    // The first scroll ends the hold; from there an empty band means `/`, even before any region has counted.
    const release = () => {
      holding = false;
      setCurrent(latest);
    };
    // The jump that placed the region scrolls before the next frame; the visitor's own scroll comes after it.
    const frame = holding
      ? requestAnimationFrame(() =>
          window.addEventListener("scroll", release, { once: true }),
        )
      : 0;
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", release);
      // Returning home must not resurrect the region that was current before leaving.
      setCurrent(undefined);
    };
  }, [enabled]);
  return enabled ? current : undefined;
}

// Replaced, not pushed, so scrolling never adds Back steps (decision 174).
function usePathFollows(current: RegionId | null | undefined): void {
  useEffect(() => {
    if (current === undefined) return;
    const path = current ? regionPath(current) : "/";
    if (window.location.pathname === path && !window.location.hash) return;
    // A plain state object, so Next.js syncs usePathname (section 26).
    history.replaceState({}, "", path + window.location.search);
  }, [current]);
}

export function NavLinks() {
  const pathname = usePathname();
  const current = useRegionInView(isHomePath(pathname));
  usePathFollows(current);
  // Until a report counts, the path the page arrived on says which item is current (decision 184).
  const region = current === undefined ? regionOf(pathname) : current;
  const section = region ? sectionOf(region) : null;
  return (
    <ul className={styles.links}>
      {NAV_ITEMS.map((item) => (
        <li key={item.id}>
          <SectionLink
            id={item.id}
            className={styles.link}
            aria-current={section === item.id ? "true" : undefined}
          >
            {item.label}
          </SectionLink>
        </li>
      ))}
    </ul>
  );
}
```

In `components/Hero.tsx`, add `import { SectionLink } from "./SectionLink";` after the `HeroAurora` import and replace lines 48–50 with:

```tsx
        <SectionLink id="experience" className={styles.cue}>
          Scroll <span aria-hidden="true">↓</span>
        </SectionLink>
```

In `lib/nav.ts`, delete `sectionHref` and its doc comment.

- [ ] **Step 4: Run the unit tests to verify they pass**

Run: `npx vitest run components/SectionLink.test.tsx components/NavLinks.test.tsx components/Hero.test.tsx lib/nav.test.ts`
Expected: PASS.

- [ ] **Step 5: Move the e2e tests from hashes to paths**

Replace `e2e/navigation.spec.ts` with:

```ts
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
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 2, name: "Say hello" });
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Contact" })
    .click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(heading).toBeInViewport();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect
    .poll(() => page.evaluate(() => Math.round(window.scrollY)))
    .toBe(0);
  await page.goForward();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(heading).toBeInViewport();
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
```

In `e2e/back-to-top.spec.ts`, replace the test `"scrolls back to the top and drops the section hash"` with:

```ts
  test("scrolls back to the top and returns a section path to /", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Writing" })
      .click();
    await expect(page).toHaveURL(/\/writing$/);
    await brandLink(page).click();
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(page).toHaveURL(/\/$/);
  });
```

In `e2e/home.spec.ts`, replace lines 267–268 with:

```ts
  // Still on the home page; the path may name the region scrolled into view (decision 174).
  await expect(page).toHaveURL(/\/(experience)?$/);
```

In `e2e/sheet-routes.spec.ts`:
- in "Back closes the sheet and Forward opens it again…", "a sheet opened by URL starts full screen…" and "reloading on a sheet opened by a click…", change `/\/(#experience)?$/` to `/\/(experience)?$/`;
- replace the test "Back from a sheet returns to the section hash it opened from" with:

```ts
test("Back from a sheet returns to the section path it opened from", async ({
  page,
}) => {
  await page.goto("/experience");
  await page.getByRole("button", { name: /Adzuna/ }).click();
  await expect(page.getByRole("dialog", { name: "Adzuna" })).toBeVisible();
  await expect(page).toHaveURL(/\/experience\/adzuna$/);
  await page.goBack();
  await expect(page.getByRole("dialog", { name: "Adzuna" })).toHaveCount(0);
  await expect(page).toHaveURL(/\/experience$/);
});
```

- rename the test "the section hash is never written onto a sheet path" to "the section path never replaces a sheet path" (its body is unchanged);
- in "after closing a sheet opened by URL, a nav link scrolls without remounting the page", change `/\/#writing$/` to `/\/writing$/`.

Append to `e2e/section-routes.spec.ts`:

```ts
/** Waits for hydration and two frames, so the observer has reported. */
async function settled(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

test("a loaded /community keeps its path and marks Experience until the first scroll, on any screen (decision 184)", async ({
  page,
}) => {
  await page.goto("/community");
  await expect(page.locator("#community")).toBeInViewport();
  await settled(page);
  await expect(page).toHaveURL(/\/community$/);
  await expect(
    page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Experience" }),
  ).toHaveAttribute("aria-current", "true");
});

test("Back from a sheet opened at /education returns to /education", async ({
  page,
}) => {
  await page.goto("/education");
  await page.getByRole("button", { name: /MSc in Applied Informatics/ }).click();
  const sheet = page.getByRole("dialog", { name: "MSc in Applied Informatics" });
  await expect(sheet).toBeVisible();
  await expect(page).toHaveURL(/\/education\/msc-applied-informatics$/);
  await page.goBack();
  await expect(sheet).toHaveCount(0);
  await expect(page).toHaveURL(/\/education$/);
});

test("closing a sheet opened by URL lands on its group's path", async ({
  page,
}) => {
  await page.goto("/education/bsc-economic-science");
  const sheet = page.getByRole("dialog", { name: "BSc in Economic Science" });
  await expect(sheet.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(page).toHaveURL(/\/education$/);
});

test("scrolling between the home page's paths sends no page view (decision 180)", async ({
  page,
}) => {
  await page.goto("/writing");
  await settled(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page).toHaveURL(/\/$/);
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  await expect(page).toHaveURL(/\/contact$/);
  expect(await pageviews(page)).toEqual([
    { route: "/writing", path: "/writing" },
  ]);
});
```

- [ ] **Step 6: Run the e2e tests**

Run: `npx playwright test e2e/navigation.spec.ts e2e/back-to-top.spec.ts e2e/home.spec.ts e2e/sheet-routes.spec.ts e2e/section-routes.spec.ts`
Expected: PASS in the desktop and mobile projects.

- [ ] **Step 7: Run the gates and commit**

Run: `npm run lint && npm run typecheck && npm run test && npm run format:check && npm run e2e`
Expected: all pass.

```bash
git add components/SectionLink.tsx components/SectionLink.test.tsx components/NavLinks.tsx components/NavLinks.test.tsx components/Hero.tsx components/Hero.test.tsx lib/nav.ts lib/nav.test.ts e2e/navigation.spec.ts e2e/back-to-top.spec.ts e2e/home.spec.ts e2e/sheet-routes.spec.ts e2e/section-routes.spec.ts
git commit -m "Let the URL path follow the scroll and link the sections by path"
```
