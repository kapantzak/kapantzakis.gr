# Sheet Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every Work, Education and Community detail sheet its own URL (`/experience/<slug>`, `/education/<slug>`, `/community/<slug>`) while keeping the grow-from-row animation.

**Architecture:** The home page moves into `app/(home)/layout.tsx`, so it stays mounted across `/` and every sheet path; the route pages render nothing and only carry metadata, static params and the 404. A client `SheetHost` in that layout owns which sheet is open: a row click pushes the sheet's path with `history.pushState`, Back and Forward arrive as `popstate`, and a page loaded on a sheet path opens it on the first render, server-rendered. `DetailSheet` keeps its markup and animations but renders in place, as a direct child of `<body>`, instead of through a portal.

**Tech Stack:** Next.js 16.3.8 App Router, React 19.3.0, TypeScript, CSS Modules, Vitest 5 + React Testing Library + jsdom, Playwright, ESLint (`eslint-config-next`, `eslint-plugin-react-hooks` 7) + Prettier, npm, Node 24.

**Spec:** `docs/superpowers/specs/2026-10-02-personal-website-design.md`, decisions 161–170 and section 24.

## Global Constraints

- Package manager is **npm** only; add no dependencies.
- Paths: `/experience/<slug>` for work, `/education/<slug>` for degrees, `/community/<slug>` for community roles (decision 161).
- Slugs, exactly: `netdata`, `adzuna`, `skroutz`, `epsilonnet`; `msc-applied-informatics`, `msc-informatics-and-management`, `bsc-economic-science`; `skgjs` (decision 162).
- Meta descriptions: work and community "{subtitle} at {title}, {period}."; education "{title}, {subtitle}, {period}." (decision 168).
- Page titles go through the site template `%s — John Kapantzakis`; the home title is `John Kapantzakis — Senior frontend engineer`.
- No `createPortal` for the sheet after Task 3; the sheet must be a direct child of `<body>` in production (decision 163).
- `NavLinks.tsx`, `BackToTop.tsx` and `BrandLink.tsx` are **not** modified; they stay keyed to `usePathname() === "/"` (decision 170).
- Code comments: short, professional, explain "why", and cite decisions as `(decision N)` like the surrounding code.
- Git: stage files by explicit path, never `git add -A` or `git add .`. Commit messages are an imperative sentence describing the change (as in `git log`) and carry no tool or AI attribution and no co-author trailer.
- Before every commit: `npm run lint`, `npm run typecheck`, `npm run test` and `npm run format:check` pass; from Task 3 on, `npm run e2e` passes too.
- File moves and deletions in this plan (`app/page.tsx`, `app/page.module.css`, `components/ExpandableItem.test.tsx`) use `git mv`; no other file is deleted.

## Review Focus

- Pressing Escape twice (or Escape then the close button) before the sheet closes must go back **once**, not leave the site → unit test in Task 3.
- Back then Forward quickly, while the sheet is still shrinking, must leave the sheet open at its path → e2e in Task 3.
- Reloading on a sheet that was opened by a click must open it by URL and close it to `/` → e2e in Task 3.
- A trailing slash (`/experience/netdata/`) must land on the sheet, and a misspelled group (`/experiense/netdata`) or extra segment must be a 404 → e2e in Task 3.
- Opening a sheet from `/#experience` and pressing Back must return to `/#experience` → e2e in Task 3.

---

### Task 1: Slugs, sheet metadata and titles

**Files:**
- Modify: `content/profile.ts` (types `Role`, `Degree`, `CommunityRole` at lines 83–108; each entry)
- Modify: `content/profile.test.ts`
- Create: `lib/sheets.ts`, `lib/sheets.test.ts`
- Create: `lib/titles.ts`, `lib/titles.test.ts`
- Modify: `app/layout.tsx:12-19`

**Interfaces:**
- Produces:
  - `Role.slug`, `Degree.slug`, `CommunityRole.slug: string`
  - `lib/sheets.ts`: `type SheetGroup = "experience" | "education" | "community"`; `type SheetMeta = { group; slug; path; title; subtitle; period; description }` (all `string` except `group: SheetGroup`); `sheetPath(group, slug): string`; `roleSheet(role: Role): SheetMeta`; `degreeSheet(degree: Degree): SheetMeta`; `communitySheet(entry: CommunityRole): SheetMeta`; `sheetsOf(profile: Profile): SheetMeta[]`; `sheetParams(group: SheetGroup): { slug: string }[]`; `sheetMetadata(group: SheetGroup, slug: string): Metadata`
  - `lib/titles.ts`: `HOME_TITLE: string`; `TITLE_TEMPLATE: string`; `pageTitle(title: string): string`

- [ ] **Step 1: Write the failing tests**

Append to the `describe("profile", …)` block in `content/profile.test.ts`:

```ts
  it("gives every sheet a URL-safe slug, unique within its group", () => {
    for (const group of [
      profile.experience,
      profile.education,
      profile.community,
    ]) {
      const slugs = group.map((entry) => entry.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
```

Create `lib/titles.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { HOME_TITLE, TITLE_TEMPLATE, pageTitle } from "./titles";

describe("titles", () => {
  it("names the home page after the owner and role", () => {
    expect(HOME_TITLE).toBe("John Kapantzakis — Senior frontend engineer");
  });

  it("titles other pages through the site template", () => {
    expect(TITLE_TEMPLATE).toBe("%s — John Kapantzakis");
    expect(pageTitle("Netdata")).toBe("Netdata — John Kapantzakis");
  });
});
```

Create `lib/sheets.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { profile } from "@/content/profile";
import {
  communitySheet,
  degreeSheet,
  roleSheet,
  sheetMetadata,
  sheetParams,
  sheetPath,
  sheetsOf,
} from "./sheets";

describe("sheetPath", () => {
  it("puts the slug under its group", () => {
    expect(sheetPath("education", "bsc-economic-science")).toBe(
      "/education/bsc-economic-science",
    );
  });
});

describe("sheet metadata", () => {
  it("describes a role by its title, organisation and period", () => {
    expect(roleSheet(profile.experience[0]!)).toEqual({
      group: "experience",
      slug: "netdata",
      path: "/experience/netdata",
      title: "Netdata",
      subtitle: "Senior software engineer",
      period: "Feb 2023 – Present",
      description: "Senior software engineer at Netdata, Feb 2023 – Present.",
    });
  });

  it("describes a degree by its name, institution and period", () => {
    expect(degreeSheet(profile.education[0]!)).toMatchObject({
      path: "/education/msc-applied-informatics",
      title: "MSc in Applied Informatics",
      subtitle: "University of Macedonia",
      description: "MSc in Applied Informatics, University of Macedonia, 2015 – 2018.",
    });
  });

  it("describes a community role like a work role", () => {
    expect(communitySheet(profile.community[0]!)).toMatchObject({
      path: "/community/skgjs",
      title: "Thessaloniki JavaScript Meetup",
      description:
        "Co-organiser at Thessaloniki JavaScript Meetup, Apr 2025 – Present.",
    });
  });

  it("lists every sheet in page order", () => {
    expect(sheetsOf(profile).map((sheet) => sheet.path)).toEqual([
      "/experience/netdata",
      "/experience/adzuna",
      "/experience/skroutz",
      "/experience/epsilonnet",
      "/education/msc-applied-informatics",
      "/education/msc-informatics-and-management",
      "/education/bsc-economic-science",
      "/community/skgjs",
    ]);
  });
});

describe("sheet routes", () => {
  it("lists a group's slugs as static params", () => {
    expect(sheetParams("education")).toEqual([
      { slug: "msc-applied-informatics" },
      { slug: "msc-informatics-and-management" },
      { slug: "bsc-economic-science" },
    ]);
  });

  it("titles, describes and canonicalises a sheet route", () => {
    expect(sheetMetadata("community", "skgjs")).toEqual({
      title: "Thessaloniki JavaScript Meetup",
      description:
        "Co-organiser at Thessaloniki JavaScript Meetup, Apr 2025 – Present.",
      alternates: { canonical: "/community/skgjs" },
    });
  });

  it("treats an unknown slug, or a slug from another group, as not found", () => {
    expect(() => sheetMetadata("experience", "nope")).toThrow();
    expect(() => sheetMetadata("education", "netdata")).toThrow();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run content/profile.test.ts lib/sheets.test.ts lib/titles.test.ts`
Expected: FAIL — `lib/sheets` and `lib/titles` cannot be resolved; the slug test fails because `slug` is `undefined` (`new Set([undefined…]).size` is 1).

- [ ] **Step 3: Add `slug` to the content types and entries**

In `content/profile.ts`, add as the **first** property of each type `Role`, `Degree` and `CommunityRole`:

```ts
  /** Its sheet's path segment, unique within its group (decision 162). */
  slug: string;
```

Then add `slug` as the first property of each entry, directly above the line shown:

| Above this line                                   | Add                                        |
|---------------------------------------------------|--------------------------------------------|
| `org: "Netdata",`                                 | `slug: "netdata",`                         |
| `org: "Adzuna",`                                  | `slug: "adzuna",`                          |
| `org: "Skroutz",`                                 | `slug: "skroutz",`                         |
| `org: "EpsilonNet",`                              | `slug: "epsilonnet",`                      |
| `institution: "University of Macedonia",`         | `slug: "msc-applied-informatics",`         |
| the `institution` line before `degree: "MSc in Informatics and Management",` | `slug: "msc-informatics-and-management",` |
| the `institution` line before `degree: "BSc in Economic Science",` | `slug: "bsc-economic-science",` |
| `org: "Thessaloniki JavaScript Meetup",`          | `slug: "skgjs",`                           |

- [ ] **Step 4: Create `lib/titles.ts`**

```ts
import { profile } from "@/content/profile";

/** The home page's title, which a closing sheet restores (decision 169). */
export const HOME_TITLE = `${profile.name} — ${profile.role}`;

/** Every other page's title, as Next.js applies `title.template`. */
export const TITLE_TEMPLATE = `%s — ${profile.name}`;

export function pageTitle(title: string): string {
  return TITLE_TEMPLATE.replace("%s", title);
}
```

- [ ] **Step 5: Create `lib/sheets.ts`**

```ts
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  type CommunityRole,
  type Degree,
  type Profile,
  type Role,
  profile,
} from "@/content/profile";
import { formatPeriod } from "./period";

/** The first path segment of each group's sheets (decision 161). */
export type SheetGroup = "experience" | "education" | "community";

/** What a sheet's row, route metadata and sitemap entry share. */
export type SheetMeta = {
  group: SheetGroup;
  slug: string;
  path: string;
  title: string;
  subtitle: string;
  period: string;
  /** The route's meta description (decision 168). */
  description: string;
};

export function sheetPath(group: SheetGroup, slug: string): string {
  return `/${group}/${slug}`;
}

export function roleSheet(role: Role): SheetMeta {
  const period = formatPeriod(role.period);
  return {
    group: "experience",
    slug: role.slug,
    path: sheetPath("experience", role.slug),
    title: role.org,
    subtitle: role.title,
    period,
    description: `${role.title} at ${role.org}, ${period}.`,
  };
}

export function degreeSheet(degree: Degree): SheetMeta {
  const period = formatPeriod(degree.period);
  return {
    group: "education",
    slug: degree.slug,
    path: sheetPath("education", degree.slug),
    title: degree.degree,
    subtitle: degree.institution,
    period,
    description: `${degree.degree}, ${degree.institution}, ${period}.`,
  };
}

export function communitySheet(entry: CommunityRole): SheetMeta {
  const period = formatPeriod(entry.period);
  return {
    group: "community",
    slug: entry.slug,
    path: sheetPath("community", entry.slug),
    title: entry.org,
    subtitle: entry.title,
    period,
    description: `${entry.title} at ${entry.org}, ${period}.`,
  };
}

/** Every sheet, in the order the page shows its rows. */
export function sheetsOf(source: Profile): SheetMeta[] {
  return [
    ...source.experience.map(roleSheet),
    ...source.education.map(degreeSheet),
    ...source.community.map(communitySheet),
  ];
}

/** Static params for a group's `[slug]` route. */
export function sheetParams(group: SheetGroup): { slug: string }[] {
  return sheetsOf(profile)
    .filter((sheet) => sheet.group === group)
    .map(({ slug }) => ({ slug }));
}

/** A sheet route's metadata (decision 168); an unknown slug is a 404. */
export function sheetMetadata(group: SheetGroup, slug: string): Metadata {
  const sheet = sheetsOf(profile).find(
    (s) => s.group === group && s.slug === slug,
  );
  if (!sheet) notFound();
  return {
    title: sheet.title,
    description: sheet.description,
    alternates: { canonical: sheet.path },
  };
}
```

- [ ] **Step 6: Use the shared titles in the root layout**

In `app/layout.tsx`, add `import { HOME_TITLE, TITLE_TEMPLATE } from "@/lib/titles";` with the other `@/lib` import, and replace the `title` object:

```ts
  title: {
    default: HOME_TITLE,
    template: TITLE_TEMPLATE,
  },
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run content/profile.test.ts lib/sheets.test.ts lib/titles.test.ts`
Expected: PASS.

- [ ] **Step 8: Run the full checks**

Run: `npm run lint && npm run typecheck && npm run test && npm run format:check`
Expected: all pass. If `format:check` fails, run `npx prettier --write` on the files of this task only and re-run.

- [ ] **Step 9: Commit**

```bash
git add content/profile.ts content/profile.test.ts lib/sheets.ts lib/sheets.test.ts lib/titles.ts lib/titles.test.ts app/layout.tsx
git commit -m "Give every experience, education and community entry a sheet slug"
```

---

### Task 2: Sheets opened by URL, and modality from anywhere

`DetailSheet` learns a second entry mode and stops assuming it is a child of `<body>`; it is still portalled in this task, so the page behaves exactly as before.

**Files:**
- Modify: `components/DetailSheet.tsx`
- Modify: `components/DetailSheet.module.css` (the `prefers-reduced-motion: no-preference` block, lines 248–277)
- Create: `components/DetailSheet.test.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `DetailSheet` prop `origin: Origin | null` (was `Origin`); with `null` the sheet has `data-entry="url"` and no `--from-*` variables. `Origin` stays exported.

- [ ] **Step 1: Write the failing test**

Create `components/DetailSheet.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DetailSheet, type Origin } from "./DetailSheet";

function renderSheet(origin: Origin | null) {
  return render(
    <>
      <div data-testid="outside">Page</div>
      <DetailSheet
        period="Feb 2023 – Present"
        title="Netdata"
        subtitle="Senior software engineer"
        origin={origin}
        closing={false}
        onClose={() => {}}
        onClosed={() => {}}
      >
        <p>Details</p>
      </DetailSheet>
    </>,
  );
}

describe("DetailSheet", () => {
  it("grows from the row: it carries the row's insets and no entry mark", () => {
    renderSheet({ top: 1, right: 2, bottom: 3, left: 4 });
    const sheet = screen.getByRole("dialog", { name: "Netdata" });
    expect(sheet.style.getPropertyValue("--from-top")).toBe("1px");
    expect(sheet.style.getPropertyValue("--from-left")).toBe("4px");
    expect(sheet).not.toHaveAttribute("data-entry");
  });

  it("opened by URL: it is marked as such and carries no insets (decision 165)", () => {
    renderSheet(null);
    const sheet = screen.getByRole("dialog", { name: "Netdata" });
    expect(sheet).toHaveAttribute("data-entry", "url");
    expect(sheet.style.getPropertyValue("--from-top")).toBe("");
  });

  it("makes everything outside it inert, and lifts that when it unmounts", () => {
    const { unmount } = renderSheet(null);
    const outside = screen.getByTestId("outside");
    const sheet = screen.getByRole("dialog", { name: "Netdata" });
    expect(outside.closest("[inert]")).not.toBeNull();
    expect(sheet.closest("[inert]")).toBeNull();
    unmount();
    expect(outside.closest("[inert]")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/DetailSheet.test.tsx`
Expected: FAIL — the "opened by URL" test throws reading `origin.top` of `null` (and TypeScript would reject `null`).

- [ ] **Step 3: Accept a null origin**

In `components/DetailSheet.tsx`:

Keep the `Origin` type as is. In `Props`, replace `origin: Origin;` with:

```ts
  /** The row it grows from; null when the page load opened it (decision 165). */
  origin: Origin | null;
```

Replace the start of the `vars` object:

```ts
  const vars = {
    ...(origin && {
      "--from-top": `${origin.top}px`,
      "--from-right": `${origin.right}px`,
      "--from-bottom": `${origin.bottom}px`,
      "--from-left": `${origin.left}px`,
    }),
    ...(brand && {
```

(the `brand` spread and the closing `} as CSSProperties;` stay unchanged), and add the attribute to the sheet `<div>`, after `data-closing={closing || undefined}`:

```tsx
      data-entry={origin ? undefined : "url"}
```

- [ ] **Step 4: Make everything outside the sheet inert, wherever it renders**

In `components/DetailSheet.tsx`, add above `export function DetailSheet`:

```ts
/** Everything beside the sheet and beside each of its ancestors, up to <body>. */
function outsideOf(sheet: HTMLElement): Element[] {
  const outside: Element[] = [];
  for (
    let node: Element = sheet;
    node.parentElement && node !== document.body;
    node = node.parentElement
  ) {
    for (const sibling of Array.from(node.parentElement.children)) {
      if (sibling !== node) outside.push(sibling);
    }
  }
  return outside;
}
```

and in the modality effect replace

```ts
    const others = Array.from(document.body.children).filter(
      (el) => el !== sheet && !el.hasAttribute("inert"),
    );
```

with

```ts
    // Not only <body>'s children: the sheet need not sit directly in <body> (tests, decision 163).
    const others = outsideOf(sheet).filter((el) => !el.hasAttribute("inert"));
```

- [ ] **Step 5: Skip the grow for a sheet opened by URL**

In `components/DetailSheet.module.css`, inside `@media (prefers-reduced-motion: no-preference) { … }`, directly after the `.sheet[data-closing] { animation: shrink … }` rule, add:

```css
  /* Opened by URL: already full screen, so only the content rises in (decision 165). */
  .sheet[data-entry="url"]:not([data-closing]) {
    animation: none;
  }
```

Do not touch the reduced-motion block: its `fade-in` applies to both entries (section 24).

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run components/DetailSheet.test.tsx components/ExpandableItem.test.tsx`
Expected: PASS (the existing `ExpandableItem` tests still pass: they always pass an origin).

- [ ] **Step 7: Run the full checks**

Run: `npm run lint && npm run typecheck && npm run test && npm run format:check`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add components/DetailSheet.tsx components/DetailSheet.module.css components/DetailSheet.test.tsx
git commit -m "Let a detail sheet open without a row to grow from"
```

---

### Task 3: Sheet host, home layout and sheet routes

**Files:**
- Create: `components/SheetHost.tsx`
- Modify (rewrite): `components/ExpandableItem.tsx`
- Modify: `components/DetailSheet.tsx` (remove the portal)
- Modify: `components/Experience.tsx`
- Move: `components/ExpandableItem.test.tsx` → `components/SheetHost.test.tsx` (`git mv`, then rewrite)
- Move: `app/page.tsx` → `app/(home)/page.tsx` (`git mv`, then rewrite)
- Move: `app/page.module.css` → `app/(home)/layout.module.css` (`git mv`, unchanged)
- Create: `app/(home)/layout.tsx`
- Create: `app/(home)/experience/[slug]/page.tsx`, `app/(home)/education/[slug]/page.tsx`, `app/(home)/community/[slug]/page.tsx`
- Modify: `e2e/helpers.ts`
- Create: `e2e/sheet-routes.spec.ts`

**Interfaces:**
- Consumes: `roleSheet`, `degreeSheet`, `communitySheet`, `SheetMeta`, `sheetParams`, `sheetMetadata` (`lib/sheets.ts`); `HOME_TITLE`, `pageTitle` (`lib/titles.ts`); `DetailSheet` with `origin: Origin | null` (Task 2).
- Produces:
  - `components/SheetHost.tsx`: `type SheetEntry = { path: string; period: string; title: string; subtitle: string; brand?: Brand; facts?: ReactNode; content: ReactNode; documentTitle: string }`; `SheetHost({ sheets: SheetEntry[]; homeTitle: string; children: ReactNode })`; `useSheets(): { shownPath: string | null; open(path: string): void; registerRow(path: string, row: HTMLButtonElement | null): void }`
  - `components/ExpandableItem.tsx`: `ExpandableItem({ path, period, title, subtitle, brand? })` — no `facts`, no `children`.
  - `components/Experience.tsx`: `Experience({ profile })` (rows only) and `experienceSheets(profile: Profile): SheetEntry[]`.
  - `e2e/helpers.ts`: `HOME_TITLE`, `SHEET_PAGES: { path: string; name: string }[]` (Task 4 reuses `SHEET_PAGES`).

- [ ] **Step 1: Move the row tests to the host and rewrite them (failing)**

Run: `git mv components/ExpandableItem.test.tsx components/SheetHost.test.tsx`

Replace the whole content of `components/SheetHost.test.tsx` with:

```tsx
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { Brand } from "@/content/profile";
import { ExpandableItem } from "./ExpandableItem";
import { type SheetEntry, SheetHost } from "./SheetHost";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

const BRAND: Brand = {
  logo: { src: "/netdata-logo.svg", width: 879, height: 151 },
  background: "#020503",
  accent: "#00ab44",
  link: "#00ab44",
  tone: "dark",
};

const BRAND_WITH_VISUAL: Brand = {
  ...BRAND,
  visual: { src: "/netdata-dashboard.png", width: 1919, height: 1079 },
};

const PATH = "/experience/netdata";
const HOME_TITLE = "Home — Site";
const SHEET_TITLE = "Netdata — Site";

function renderHost(brand?: Brand) {
  const sheet: SheetEntry = {
    path: PATH,
    period: "Feb 2023 – Present",
    title: "Netdata",
    subtitle: "Senior software engineer",
    brand,
    facts: <a href="https://example.com/site">Website link</a>,
    content: <a href="https://example.com/">Details link</a>,
    documentTitle: SHEET_TITLE,
  };
  return render(
    <SheetHost sheets={[sheet]} homeTitle={HOME_TITLE}>
      <main>
        <ol>
          <ExpandableItem
            path={sheet.path}
            period={sheet.period}
            title={sheet.title}
            subtitle={sheet.subtitle}
            brand={brand}
          />
        </ol>
      </main>
    </SheetHost>,
  );
}

/** As if the browser had loaded the page on `path`. */
function loadAt(path: string) {
  pathname.current = path;
  window.history.replaceState(null, "", path);
}

function openSheet() {
  const row = screen.getByRole("button", { name: /Netdata/ });
  fireEvent.click(row);
  return { row, sheet: screen.getByRole("dialog", { name: "Netdata" }) };
}

async function expectClosed(row: HTMLElement) {
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(row).toHaveFocus();
  expect(row.closest("[inert]")).toBeNull();
  expect(document.documentElement).not.toHaveAttribute("data-sheet-open");
  expect(window.location.pathname).toBe("/");
  expect(document.title).toBe(HOME_TITLE);
}

beforeAll(() => {
  // jsdom has no layout, so it lacks scrollIntoView.
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  loadAt("/");
  document.title = HOME_TITLE;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(Element.prototype.scrollIntoView).mockClear();
});

describe("SheetHost and its rows", () => {
  it("renders a row as a button inside a heading that announces a dialog", () => {
    renderHost();
    const row = screen.getByRole("button", { name: /Netdata/ });
    expect(row.closest("h4")).not.toBeNull();
    expect(row).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a modal sheet outside the row, at the sheet's own path (decision 161)", () => {
    renderHost();
    const before = window.history.length;
    const { row, sheet } = openSheet();
    expect(window.location.pathname).toBe(PATH);
    expect(window.history.length).toBe(before + 1);
    expect(sheet).toHaveAttribute("aria-modal", "true");
    expect(row.closest("li")!.contains(sheet)).toBe(false);
    expect(row.closest("li")).toHaveAttribute("data-open");
    expect(sheet).not.toHaveAttribute("data-entry");
    expect(sheet).toHaveTextContent("Senior software engineer");
    expect(sheet).toHaveTextContent("Feb 2023 – Present");
    expect(
      screen.getByRole("link", { name: "Details link" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    expect(row.closest("[inert]")).not.toBeNull();
    expect(document.documentElement).toHaveAttribute("data-sheet-open");
  });

  it("closes from the close button, back to the page it opened from", async () => {
    renderHost();
    const { row } = openSheet();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await expectClosed(row);
  });

  it("closes on Escape", async () => {
    renderHost();
    const { row, sheet } = openSheet();
    fireEvent.keyDown(sheet, { key: "Escape" });
    await expectClosed(row);
  });

  it("goes back only once when asked to close twice", async () => {
    renderHost();
    const back = vi.spyOn(window.history, "back");
    const { row, sheet } = openSheet();
    fireEvent.keyDown(sheet, { key: "Escape" });
    fireEvent.keyDown(sheet, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await expectClosed(row);
    expect(back).toHaveBeenCalledOnce();
  });

  it("closes when the browser goes back, and opens again on Forward", async () => {
    renderHost();
    const { row } = openSheet();
    window.history.back();
    await expectClosed(row);
    window.history.forward();
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: "Netdata" })).toBeVisible(),
    );
    expect(window.location.pathname).toBe(PATH);
  });

  it("titles the tab after the open sheet (decision 169)", async () => {
    renderHost();
    const { row } = openSheet();
    expect(document.title).toBe(SHEET_TITLE);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await expectClosed(row);
  });

  it("opens a sheet the page load names, already full screen, with the page scrolled to its row (decision 165)", () => {
    loadAt(PATH);
    renderHost();
    const sheet = screen.getByRole("dialog", { name: "Netdata" });
    const row = screen.getByRole("button", { name: /Netdata/ });
    expect(sheet).toHaveAttribute("data-entry", "url");
    expect(row.closest("li")).toHaveAttribute("data-open");
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      block: "center",
      behavior: "instant",
    });
    expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts).toEqual(
      [row],
    );
  });

  it("closes a sheet the page load opened by replacing its URL with / (decision 167)", async () => {
    loadAt(PATH);
    renderHost();
    const back = vi.spyOn(window.history, "back");
    const before = window.history.length;
    const row = screen.getByRole("button", { name: /Netdata/ });
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Netdata" }), {
      key: "Escape",
    });
    await expectClosed(row);
    expect(window.history.length).toBe(before);
    expect(back).not.toHaveBeenCalled();
  });

  it("titles a plain sheet with text and keeps its facts in the header", () => {
    renderHost();
    const { sheet } = openSheet();
    expect(
      within(sheet).getByRole("heading", { level: 2, name: "Netdata" }),
    ).toHaveTextContent("Netdata");
    expect(within(sheet).queryByRole("img")).toBeNull();
    expect(sheet.querySelector("[data-brand]")).toBeNull();
    expect(
      within(sheet)
        .getByRole("link", { name: "Website link" })
        .closest("header"),
    ).not.toBeNull();
  });

  it("titles a branded sheet with its logo and facts on a band in its colours", () => {
    renderHost(BRAND);
    const { row, sheet } = openSheet();
    const title = within(sheet).getByRole("heading", { level: 2 });
    expect(within(title).getByRole("img", { name: "Netdata" })).toBeVisible();
    expect(title.closest("[data-brand]")).not.toBeNull();
    expect(
      within(sheet)
        .getByRole("link", { name: "Website link" })
        .closest("[data-brand]"),
    ).not.toBeNull();
    expect(sheet.style.getPropertyValue("--accent")).toBe(BRAND.accent);
    expect(sheet.style.getPropertyValue("--brand-bg")).toBe(BRAND.background);
    expect(sheet.style.getPropertyValue("--brand-link")).toBe(BRAND.link);
    expect(row.closest("li")!.style.getPropertyValue("--accent")).toBe(
      BRAND.accent,
    );
  });

  it("keeps a text title on the band when the brand has no logo", () => {
    renderHost({ ...BRAND_WITH_VISUAL, logo: undefined });
    const { sheet } = openSheet();
    const title = within(sheet).getByRole("heading", {
      level: 2,
      name: "Netdata",
    });
    expect(title).toHaveTextContent("Netdata");
    expect(within(title).queryByRole("img")).toBeNull();
    expect(title.closest("[data-brand]")).not.toBeNull();
    expect(
      sheet.querySelector('[data-brand] [aria-hidden="true"] img'),
    ).not.toBeNull();
  });

  it("sets a brand's lockup beside its logo, so the text alone names the dialog", () => {
    renderHost({ ...BRAND, lockup: ["Netdata", "Cloud"] });
    fireEvent.click(screen.getByRole("button", { name: /Netdata/ }));
    const sheet = screen.getByRole("dialog", { name: "Netdata Cloud" });
    const title = within(sheet).getByRole("heading", {
      level: 2,
      name: "Netdata Cloud",
    });
    expect(title.querySelector("img")).toHaveAttribute("alt", "");
    expect(within(title).queryByRole("img")).toBeNull();
    expect(within(title).getByText("Cloud")).toBeVisible();
  });

  it("shows a brand's visual on its band as decoration only", () => {
    renderHost(BRAND_WITH_VISUAL);
    const { sheet } = openSheet();
    const band = sheet.querySelector<HTMLElement>("[data-brand]")!;
    const visual = band.querySelector('[aria-hidden="true"] img');
    expect(visual).not.toBeNull();
    expect(visual).toHaveAttribute("alt", "");
    expect(within(band).getAllByRole("img")).toHaveLength(1);
  });

  it("leaves the band without a visual when the brand has none", () => {
    renderHost(BRAND);
    const { sheet } = openSheet();
    expect(sheet.querySelectorAll("[data-brand] img")).toHaveLength(1);
  });

  it("marks the band's tone, so a light band takes the light-page colours", () => {
    renderHost({ ...BRAND, background: "#ffffff", tone: "light" });
    const { sheet } = openSheet();
    expect(sheet.querySelector("[data-brand]")).toHaveAttribute(
      "data-tone",
      "light",
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run components/SheetHost.test.tsx`
Expected: FAIL — `./SheetHost` cannot be resolved.

- [ ] **Step 3: Create `components/SheetHost.tsx`**

```tsx
"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Brand } from "@/content/profile";
import { DetailSheet, type Origin } from "./DetailSheet";

/** A sheet as the server renders it for the host (decision 163). */
export type SheetEntry = {
  path: string;
  period: string;
  title: string;
  subtitle: string;
  brand?: Brand;
  /** Short facts in the sheet header (decision 54). */
  facts?: ReactNode;
  content: ReactNode;
  /** The tab title while the sheet is open (decision 169). */
  documentTitle: string;
};

type View = {
  path: string;
  /** The row's insets; null for a sheet the page load opened, until it closes (decision 165). */
  origin: Origin | null;
  closing: boolean;
  /** Opened by the page load, so closing replaces the URL instead of going back (decision 167). */
  byLoad: boolean;
};

type Sheets = {
  /** The sheet on screen, including while it closes. */
  shownPath: string | null;
  open: (path: string) => void;
  registerRow: (path: string, row: HTMLButtonElement | null) => void;
};

const SheetsContext = createContext<Sheets | null>(null);

export function useSheets(): Sheets {
  const sheets = use(SheetsContext);
  if (!sheets) throw new Error("useSheets must be used inside a SheetHost");
  return sheets;
}

// For a row that cannot be measured: the sheet then closes where it is.
const FULL_SCREEN: Origin = { top: 0, right: 0, bottom: 0, left: 0 };

function insetsOf(el: HTMLElement): Origin {
  const rect = el.getBoundingClientRect();
  const { clientWidth, clientHeight } = document.documentElement;
  return {
    top: rect.top,
    right: clientWidth - rect.right,
    bottom: clientHeight - rect.bottom,
    left: rect.left,
  };
}

// The URL says which sheet is open (decisions 161–169). Rendered by the home layout, so its sheet is a
// direct child of <body>, clear of the rows' scroll-driven transforms (decision 163).
export function SheetHost({
  sheets,
  homeTitle,
  children,
}: {
  sheets: SheetEntry[];
  homeTitle: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [view, setView] = useState<View | null>(() =>
    sheets.some((sheet) => sheet.path === pathname)
      ? { path: pathname, origin: null, closing: false, byLoad: true }
      : null,
  );
  const [rows] = useState(() => new Map<string, HTMLButtonElement>());
  // Read by the history listener and the close handlers, which outlive a render.
  const viewRef = useRef(view);
  const closeRequested = useRef(false);
  const returnFocusTo = useRef<string | null>(null);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const measure = useCallback(
    (path: string): Origin | null => {
      const row = rows.get(path);
      return row ? insetsOf(row) : null;
    },
    [rows],
  );

  const registerRow = useCallback(
    (path: string, row: HTMLButtonElement | null) => {
      if (row) rows.set(path, row);
      else rows.delete(path);
    },
    [rows],
  );

  const open = useCallback(
    (path: string) => {
      closeRequested.current = false;
      setView({ path, origin: measure(path), closing: false, byLoad: false });
      // Not a router navigation: Next.js syncs usePathname and the page stays mounted (section 24).
      window.history.pushState(null, "", path);
    },
    [measure],
  );

  // Back and Forward move between a page and a sheet path within this document (decision 161).
  useEffect(() => {
    function onPopState() {
      const current = viewRef.current;
      const target = sheets.find(
        (sheet) => sheet.path === window.location.pathname,
      )?.path;
      if (target && (target !== current?.path || current.closing)) {
        closeRequested.current = false;
        setView({
          path: target,
          origin: measure(target),
          closing: false,
          byLoad: false,
        });
      } else if (!target && current && !current.closing) {
        setView({
          ...current,
          origin: measure(current.path) ?? current.origin ?? FULL_SCREEN,
          closing: true,
        });
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [sheets, measure]);

  // Escape and the close button (decision 47).
  const requestClose = useCallback(() => {
    const current = viewRef.current;
    if (!current || current.closing || closeRequested.current) return;
    closeRequested.current = true;
    if (!current.byLoad) {
      window.history.back();
      return;
    }
    setView({
      ...current,
      origin: measure(current.path) ?? FULL_SCREEN,
      closing: true,
    });
    // A plain state object, so Next.js syncs usePathname to `/` (section 24).
    window.history.replaceState({}, "", "/");
  }, [measure]);

  const finishClosing = useCallback(() => {
    returnFocusTo.current = viewRef.current?.path ?? null;
    setView(null);
  }, []);

  // Runs after the sheet's cleanup has lifted `inert`, so the row can take focus again.
  useEffect(() => {
    if (view || !returnFocusTo.current) return;
    rows.get(returnFocusTo.current)?.focus();
    returnFocusTo.current = null;
  }, [view, rows]);

  // The sheet covers the page, so the page scrolls to its row unseen and closing lands there (decision 165).
  useLayoutEffect(() => {
    if (view?.byLoad) {
      rows
        .get(view.path)
        ?.scrollIntoView({ block: "center", behavior: "instant" });
    }
    // Only the first render can be a page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = view
    ? sheets.find((sheet) => sheet.path === view.path)
    : undefined;
  const openTitle = view && !view.closing ? shown?.documentTitle : undefined;

  // pushState leaves the title alone, so the tab follows the open sheet here (decision 169).
  useEffect(() => {
    if (!openTitle) return;
    document.title = openTitle;
    return () => {
      document.title = homeTitle;
    };
  }, [openTitle, homeTitle]);

  const shownPath = view?.path ?? null;
  const value = useMemo(
    () => ({ shownPath, open, registerRow }),
    [shownPath, open, registerRow],
  );

  return (
    <SheetsContext value={value}>
      {children}
      {view && shown ? (
        <DetailSheet
          key={view.path}
          period={shown.period}
          title={shown.title}
          subtitle={shown.subtitle}
          brand={shown.brand}
          facts={shown.facts}
          origin={view.origin}
          closing={view.closing}
          onClose={requestClose}
          onClosed={finishClosing}
        >
          {shown.content}
        </DetailSheet>
      ) : null}
    </SheetsContext>
  );
}
```

- [ ] **Step 4: Rewrite `components/ExpandableItem.tsx` as a row only**

Replace the whole file with:

```tsx
"use client";

import type { CSSProperties } from "react";
import type { Brand } from "@/content/profile";
import styles from "./ExpandableItem.module.css";
import { useSheets } from "./SheetHost";

type Props = {
  /** Its sheet's own path (decision 161). */
  path: string;
  period: string;
  title: string;
  subtitle: string;
  brand?: Brand;
};

// Row that opens its sheet at the sheet's path; the home layout's SheetHost renders the sheet (decisions 41, 163).
export function ExpandableItem({ path, period, title, subtitle, brand }: Props) {
  const { shownPath, open, registerRow } = useSheets();
  return (
    <li
      className={styles.item}
      data-open={shownPath === path || undefined}
      // The row wipes in the brand colour the sheet grows out of (decision 53).
      style={
        brand ? ({ "--accent": brand.accent } as CSSProperties) : undefined
      }
    >
      <h4 className={styles.heading}>
        <button
          ref={(row) => registerRow(path, row)}
          type="button"
          className={styles.trigger}
          aria-haspopup="dialog"
          onClick={() => open(path)}
        >
          <span className={styles.period}>{period}</span>
          <span className={styles.title}>{title}</span>
          <span className={styles.subtitle}>{subtitle}</span>
          <span className={styles.icon} aria-hidden="true" />
        </button>
      </h4>
    </li>
  );
}
```

- [ ] **Step 5: Render the sheet in place**

In `components/DetailSheet.tsx`:
- delete `import { createPortal } from "react-dom";`
- replace the component's top comment with:

```ts
// Full-page modal sheet (decisions 41–47), with an optional brand band (48–53). SheetHost renders it as a direct
// child of <body> (decision 163): rows carry scroll-driven transforms, which would trap a fixed-position sheet.
```

- change `return createPortal(` to `return (` and the closing `</div>,\n    document.body,\n  );` to `</div>\n  );`.

- [ ] **Step 6: Run the unit tests to verify they pass**

Run: `npx vitest run components/SheetHost.test.tsx components/DetailSheet.test.tsx`
Expected: PASS. (`npm run typecheck` still fails at this point: `Experience.tsx` passes the old props. Step 9 fixes it.)

- [ ] **Step 7: Add the sheet pages to the e2e helpers**

Append to `e2e/helpers.ts`:

```ts
export const HOME_TITLE = "John Kapantzakis — Senior frontend engineer";

/** Every sheet path and its dialog's accessible name (decision 162). */
export const SHEET_PAGES = [
  { path: "/experience/netdata", name: "Netdata" },
  { path: "/experience/adzuna", name: "Adzuna" },
  { path: "/experience/skroutz", name: "Skroutz" },
  { path: "/experience/epsilonnet", name: "EpsilonNet" },
  {
    path: "/education/msc-applied-informatics",
    name: "MSc in Applied Informatics",
  },
  {
    path: "/education/msc-informatics-and-management",
    name: "MSc in Informatics and Management",
  },
  { path: "/education/bsc-economic-science", name: "BSc in Economic Science" },
  { path: "/community/skgjs", name: "Thessaloniki JavaScript Meetup" },
];
```

- [ ] **Step 8: Write the failing e2e tests**

Create `e2e/sheet-routes.spec.ts`:

```ts
import { expect, type Locator, test } from "@playwright/test";
import {
  HOME_TITLE,
  PAPER_BG,
  SHEET_PAGES,
  expectNoHorizontalOverflow,
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
```

- [ ] **Step 9: Build the rows and the sheets from one list in `components/Experience.tsx`**

Replace the whole file with:

```tsx
import type { ReactNode } from "react";
import type { Brand, Profile, Story } from "@/content/profile";
import {
  communitySheet,
  degreeSheet,
  roleSheet,
  type SheetMeta,
} from "@/lib/sheets";
import { pageTitle } from "@/lib/titles";
import { ExpandableItem } from "./ExpandableItem";
import { ExternalLink } from "./ExternalLink";
import styles from "./Experience.module.css";
import { RoleStory } from "./RoleStory";
import type { SheetEntry } from "./SheetHost";

type Entry = {
  sheet: SheetMeta;
  brand?: Brand;
  details: ReactNode;
  story?: Story;
};

type GroupData = { title: string; entries: Entry[] };

// Enough blocks for the sheet to scroll, so long content is exercised.
const PLACEHOLDERS = ["Highlights", "Projects", "Stories"];

function hostOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

function groupsOf(profile: Profile): GroupData[] {
  return [
    {
      title: "Work",
      entries: profile.experience.map((role) => ({
        sheet: roleSheet(role),
        brand: role.brand,
        story: role.story,
        details: (
          <>
            {role.stack.length > 0 ? (
              <ul className={styles.tags} aria-label="Stack">
                {role.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            ) : null}
            {role.orgUrl ? (
              <ExternalLink href={role.orgUrl}>
                {hostOf(role.orgUrl)}
              </ExternalLink>
            ) : null}
          </>
        ),
      })),
    },
    {
      title: "Education",
      entries: profile.education.map((degree) => ({
        sheet: degreeSheet(degree),
        brand: degree.brand,
        story: degree.story,
        details: (
          <>
            {degree.program ? (
              <ExternalLink href={degree.program.url}>
                {degree.program.label}
              </ExternalLink>
            ) : null}
            {degree.thesis ? (
              <ExternalLink href={degree.thesis.url}>
                {degree.thesis.label}
              </ExternalLink>
            ) : null}
          </>
        ),
      })),
    },
    {
      title: "Community",
      entries: profile.community.map((entry) => ({
        sheet: communitySheet(entry),
        brand: entry.brand,
        details: (
          <>
            <p>{entry.summary}</p>
            <ExternalLink href={entry.orgUrl}>
              {hostOf(entry.orgUrl)}
            </ExternalLink>
          </>
        ),
      })),
    },
  ];
}

function Group({ title, entries }: GroupData) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <ol className={styles.list} aria-label={title}>
        {entries.map(({ sheet, brand }) => (
          <ExpandableItem
            key={sheet.path}
            path={sheet.path}
            period={sheet.period}
            title={sheet.title}
            subtitle={sheet.subtitle}
            brand={brand}
          />
        ))}
      </ol>
    </div>
  );
}

export function Experience({ profile }: { profile: Profile }) {
  return (
    <>
      {groupsOf(profile).map((group) => (
        <Group key={group.title} {...group} />
      ))}
    </>
  );
}

/** Every row's sheet, for the home layout's SheetHost (decision 163). */
export function experienceSheets(profile: Profile): SheetEntry[] {
  return groupsOf(profile).flatMap(({ entries }) =>
    entries.map(({ sheet, brand, details, story }) => ({
      path: sheet.path,
      period: sheet.period,
      title: sheet.title,
      subtitle: sheet.subtitle,
      brand,
      facts: <div className={styles.facts}>{details}</div>,
      content: story ? (
        <RoleStory story={story} />
      ) : (
        // Entries without a story keep the placeholders (decision 100).
        PLACEHOLDERS.map((label) => (
          <div key={label} className={styles.placeholder} data-placeholder>
            <span className={styles.placeholderLabel}>{label}</span>
            <p>Coming soon.</p>
          </div>
        ))
      ),
      documentTitle: pageTitle(sheet.title),
    })),
  );
}
```

- [ ] **Step 10: Move the home page into the `(home)` layout**

Run:

```bash
git mv app/page.module.css "app/(home)/layout.module.css"
git mv app/page.tsx "app/(home)/page.tsx"
```

Create `app/(home)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { Experience, experienceSheets } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { PageMain } from "@/components/PageMain";
import { PostList } from "@/components/PostList";
import { Section } from "@/components/Section";
import { SheetHost } from "@/components/SheetHost";
import { profile } from "@/content/profile";
import { getAllPosts } from "@/lib/post-source";
import { HOME_TITLE } from "@/lib/titles";
import styles from "./layout.module.css";

// The whole site, read by scrolling (decision 30). A layout rather than a page, so it stays mounted across `/`
// and every sheet path, and opening or closing a sheet never remounts it (decision 163).
export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SheetHost sheets={experienceSheets(profile)} homeTitle={HOME_TITLE}>
        <PageMain>
          <Hero
            eyebrow={profile.role}
            headline={profile.headline}
            intro={profile.intro}
          />
          <Section id="experience" index="01" title="Experience">
            <Experience profile={profile} />
          </Section>
          <Section
            id="writing"
            index="02"
            title="Writing"
            tone="lime"
            direction="reverse"
          >
            <PostList posts={getAllPosts()} label="All posts" />
          </Section>
          <Section id="contact" index="03" title="Say hello" tone="magenta">
            <p className={styles.lead}>
              Email is the quickest way to reach me.
            </p>
            <p className={styles.email}>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </p>
            <ul className={styles.social} aria-label="Elsewhere">
              {profile.social.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="me noopener noreferrer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        </PageMain>
      </SheetHost>
      {children}
    </>
  );
}
```

Replace the whole content of `app/(home)/page.tsx` with:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// The home layout renders the page; this route only names it (decision 163).
export default function HomePage() {
  return null;
}
```

- [ ] **Step 11: Create the three sheet routes**

Create `app/(home)/experience/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { sheetMetadata, sheetParams } from "@/lib/sheets";

export const dynamicParams = false;

export function generateStaticParams() {
  return sheetParams("experience");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return sheetMetadata("experience", slug);
}

// The home layout renders the page and opens this sheet from the URL; the route only names it (decision 163).
export default function ExperienceSheetPage() {
  return null;
}
```

Create `app/(home)/education/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { sheetMetadata, sheetParams } from "@/lib/sheets";

export const dynamicParams = false;

export function generateStaticParams() {
  return sheetParams("education");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return sheetMetadata("education", slug);
}

// The home layout renders the page and opens this sheet from the URL; the route only names it (decision 163).
export default function EducationSheetPage() {
  return null;
}
```

Create `app/(home)/community/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { sheetMetadata, sheetParams } from "@/lib/sheets";

export const dynamicParams = false;

export function generateStaticParams() {
  return sheetParams("community");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return sheetMetadata("community", slug);
}

// The home layout renders the page and opens this sheet from the URL; the route only names it (decision 163).
export default function CommunitySheetPage() {
  return null;
}
```

- [ ] **Step 12: Run the unit checks**

Run: `npm run lint && npm run typecheck && npm run test && npm run format:check`
Expected: all pass. If `react-hooks` reports an error in `SheetHost.tsx`, **stop and report it**: the patterns were lint-checked during planning, so an error means the design needs another look, not a disable comment.

- [ ] **Step 13: Run the e2e suite**

Run: `npm run e2e`
Expected: PASS for `e2e/sheet-routes.spec.ts` and every existing spec, on the `desktop` and `mobile` projects. The build output lists `/experience/[slug]`, `/education/[slug]` and `/community/[slug]` as SSG with all eight paths.

No existing spec needs changing in this task: `e2e/home.spec.ts` keeps passing as is (its Back test already accepts `/` or `/#experience`). If one fails, find the cause in the code; do not edit the test.

- [ ] **Step 14: Commit**

```bash
git add components/SheetHost.tsx components/SheetHost.test.tsx components/ExpandableItem.tsx components/DetailSheet.tsx components/Experience.tsx "app/(home)/layout.tsx" "app/(home)/layout.module.css" "app/(home)/page.tsx" "app/(home)/experience/[slug]/page.tsx" "app/(home)/education/[slug]/page.tsx" "app/(home)/community/[slug]/page.tsx" e2e/helpers.ts e2e/sheet-routes.spec.ts
git status --short
```

Check that `git status --short` shows the three `git mv` moves (`app/page.tsx`, `app/page.module.css`, `components/ExpandableItem.test.tsx`) as renames and nothing else unstaged from this task, then:

```bash
git commit -m "Give every experience, education and community sheet its own route"
```

---

### Task 4: Sitemap

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `e2e/migration.spec.ts:3` (comment) and `:23-27` (sitemap test)

**Interfaces:**
- Consumes: `sheetsOf` (`lib/sheets.ts`); `SHEET_PAGES` (`e2e/helpers.ts`).
- Produces: nothing.

- [ ] **Step 1: Update the failing e2e test**

In `e2e/migration.spec.ts`, add `import { SHEET_PAGES } from "./helpers";` below the Playwright import, change the comment `// The site is one page now (decisions 30–31, 35).` to `// The site is one page, with a path per sheet (decisions 30–31, 35, 161).`, and replace the test `"sitemap lists the home page only"` with:

```ts
test("sitemap lists the home page and every sheet path (decision 168)", async ({
  request,
}) => {
  const body = await (await request.get("/sitemap.xml")).text();
  expect(body.match(/<loc>/g)).toHaveLength(1 + SHEET_PAGES.length);
  expect(body).toContain("<loc>https://kapantzakis.gr</loc>");
  for (const { path } of SHEET_PAGES) {
    expect(body).toContain(`<loc>https://kapantzakis.gr${path}</loc>`);
  }
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run e2e -- e2e/migration.spec.ts`
Expected: FAIL — `toHaveLength(9)` receives 1.

- [ ] **Step 3: List every sheet in the sitemap**

Replace `app/sitemap.ts` with:

```ts
import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";
import { sheetsOf } from "@/lib/sheets";
import { SITE_URL } from "@/lib/site";

// The home page and each sheet's own path (decision 168).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL },
    ...sheetsOf(profile).map(({ path }) => ({ url: `${SITE_URL}${path}` })),
  ];
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm run e2e -- e2e/migration.spec.ts`
Expected: PASS.

- [ ] **Step 5: Run the full checks**

Run: `npm run lint && npm run typecheck && npm run test && npm run format:check && npm run e2e`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add app/sitemap.ts e2e/migration.spec.ts
git commit -m "List every sheet path in the sitemap"
```
