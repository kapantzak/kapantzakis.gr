# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-page site at kapantzakis.gr with a fast, typography-led, multi-page Next.js site (Home, About, Posts, Contact) deployed on Vercel.

**Architecture:** Next.js 16 App Router. Every route is a statically generated server component. The only client component is the nav's active-link marker. Styling uses CSS Modules on top of a single `styles/tokens.css`. Dark is the default theme, and a page opts into the light theme or an accent colour through `data-*` attributes on `<main>`, which CSS `:has()` lifts to the whole document. Posts merge local MDX files (`@next/mdx`, each exporting `metadata`) with a typed list of externally published articles. Profile data (experience, education, links) lives in one typed module.

**Tech Stack:** Next.js 16.3.8, React 19.3.0, TypeScript (gated in Task 2), CSS Modules, `next/font/google`, `@next/mdx`, Vitest 5 + React Testing Library + jsdom, Playwright (Chromium), ESLint (`eslint-config-next`) + Prettier, `@vercel/analytics`, npm, Node 24.

**Spec:** `docs/superpowers/specs/2026-10-02-personal-website-design.md`

## Global Constraints

- Package manager is **npm** only. `.npmrc` sets `save-exact=true`. Never use `--force` or `--legacy-peer-deps`.
- Node **24.x** (`engines.node` in `package.json`).
- No Tailwind, no CSS-in-JS, no UI library. Use CSS Modules and the tokens in `styles/tokens.css` only.
- Cache Components and the React Compiler are **off**: routes use classic static generation.
- `NavLinks` is the **only** `"use client"` component.
- Motion: only colour or underline transitions of at most 120ms. No page transitions, scroll-linked effects, custom cursor or loader. Everything is disabled under `prefers-reduced-motion: reduce`.
- Every text colour token must have a contrast ratio of **≥ 4.5:1** against `--color-bg` in both themes (enforced by `styles/tokens.test.ts`).
- Running text is capped at `--measure: 70ch`. Layout and headings are full-bleed with `--gutter` padding and no max-width container.
- Light theme only on `/posts` and `/posts/[slug]`. Accents: Home `blue`, About `lime`, Posts `magenta`, Contact `orange`, 404 `blue`.
- Canonical origin is `https://kapantzakis.gr` (`lib/site.ts`).
- External links use `target="_blank" rel="noopener noreferrer"`. Social links add `me`.
- Git: stage files by explicit path, never `git add -A` or `git add .`. Commit messages describe the change and carry no tool or AI attribution.
- The files `docs/initial-notes.md` and `docs/linkedin.md` are never staged.
- Before every commit, `npm run lint`, `npm run typecheck` and `npm run test` pass (from Task 3 on), and `npm run e2e` passes (from Task 5 on).

## User Inputs (must be filled before Task 4)

Content values the spec lists as user-supplied. Each one appears in code as a literal token, and `content/profile.test.ts` fails while any `{{…}}` token remains. Record the answers in the Execution Log at the bottom.

| Token                 | What                                                                         |
|-----------------------|------------------------------------------------------------------------------|
| `{{SITE_OWNER_NAME}}` | Full display name, as in the current site's `<title>`                         |
| `{{CONTACT_EMAIL}}`   | Public contact email for the `mailto:` link                                   |
| `{{NETDATA_TITLE}}`   | Current job title at Netdata                                                  |
| `{{NETDATA_START}}`   | Start month at Netdata, formatted like `Mar 2025`                             |
| `{{ADZUNA_END}}`      | End month at Adzuna, formatted like `Jan 2025`                                |
| `{{SKGJS_START}}`     | SKG JS co-organiser start month, formatted like `Mar 2025`                    |
| Twitter/X             | Keep or drop `https://x.com/gianniskap`                                       |
| AUTh thesis link      | Keep or drop. `https://ikee.lib.auth.gr/record/115789/files/kapantzakes.pdf` returned HTTP 401 on 2026-10-02 |
| Display font          | Chosen in Task 3, Step 1                                                      |

## Review Focus

Failure modes the spec implies that no feature test naturally covers. Each has a pinned test in the task that owns it.

1. **Huge display type on a narrow phone** must not cause horizontal scrolling. A long email address on Contact is the likeliest offender. Pinned by `expectNoHorizontalOverflow` on every route, run under the `mobile` Playwright project (Tasks 5, 7, 8, 10, 11).
2. **The light theme must flip the whole document**, nav and footer included, not just `<main>`. Pinned by `expectBodyBackground` on `/posts`, `/posts/[slug]` (light) and the other routes (dark) (Tasks 5, 7, 8, 10, 11).
3. **The draft fixture must never reach production.** It must not appear in `/posts`, static params or the sitemap. Pinned by the `selectVisible` unit test (Task 6) and the production-build check (Task 7, Step 9).
4. **Old URL shapes must keep working:** `/projects` (308 to `/about`) and trailing slashes such as `/about/`. Pinned in `e2e/migration.spec.ts` and `e2e/navigation.spec.ts` (Tasks 11, 12).
5. **Keyboard-only visitors** need a working skip link and visible focus. Pinned by the skip-link test (Task 5).

---

## File Map

| Path                                   | Responsibility                                                       | Task |
|----------------------------------------|----------------------------------------------------------------------|------|
| `package.json`, `.npmrc`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `.gitignore` | Tooling | 1 |
| `next.config.ts`                       | MDX wrapper, redirects                                               | 1, 7, 12 |
| `vitest.config.mts`, `vitest.setup.ts` | Unit test harness                                                    | 3 |
| `lib/contrast.ts` (+ test)             | WCAG contrast maths                                                  | 3 |
| `styles/tokens.css` (+ test), `styles/globals.css`, `styles/fonts.ts` | Design system                        | 3 |
| `app/layout.tsx`                       | Root document, fonts, nav, footer, analytics                         | 3, 5, 13 |
| `lib/period.ts` (+ test)               | `Period` type and formatting                                         | 4 |
| `content/profile.ts` (+ test)          | Typed profile data                                                   | 4 |
| `lib/site.ts`                          | Canonical origin                                                     | 5 |
| `lib/nav.ts` (+ test)                  | Nav items and active-route rule                                      | 5 |
| `components/Nav.tsx`, `components/NavLinks.tsx` (+ test), `components/Nav.module.css` | Top bar             | 5 |
| `components/Footer.tsx`, `components/Footer.module.css` | Footer                                              | 5 |
| `components/PageMain.tsx`, `components/PageHeader.tsx`, `components/Section.tsx`, `components/Prose.tsx` (+ `.module.css` each) | Page primitives | 5 |
| `playwright.config.ts`, `e2e/helpers.ts`, `e2e/*.spec.ts` | Smoke tests                                       | 5+ |
| `lib/posts.ts` (+ test)                | Post types, validation, merging, sorting, date format                | 6 |
| `content/external-posts.ts` (+ test)   | Articles published elsewhere                                         | 6 |
| `mdx-components.tsx`, `lib/post-source.ts`, `content/posts/draft-fixture.mdx` | MDX loading                   | 7 |
| `app/posts/[slug]/page.tsx` (+ css)    | Post page                                                            | 7 |
| `components/PostList.tsx` (+ test, css), `app/posts/page.tsx` | Posts index                                   | 8 |
| `app/page.tsx` (+ css)                 | Home                                                                 | 5, 9 |
| `components/Timeline.tsx` (+ test, css), `app/about/page.tsx` | About                                         | 10 |
| `app/contact/page.tsx` (+ css), `app/not-found.tsx` | Contact, 404                                            | 11 |
| `app/sitemap.ts`, `app/robots.ts`, `app/icon.tsx`, `public/sw.js` | SEO and migration                         | 12 |
| `README.md`                            | Developer and content workflow                                       | 13 |

---

### Task 1: Scaffold the project and tooling

**Files:**
- Create: `package.json`, `package-lock.json`, `.npmrc`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `app/layout.tsx`, `app/page.tsx` (from scaffold)
- Modify: `.gitignore`

**Interfaces:**
- Consumes: nothing.
- Produces: npm scripts `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`. Later tasks add `test` and `e2e`. Import alias `@/*` maps to the repo root.

- [ ] **Step 1: Add the project temp dir to `.gitignore`**

Append to `.gitignore`:

```gitignore

# local scratch
/.tmp/
```

- [ ] **Step 2: Generate a scaffold in `.tmp/scaffold`**

create-next-app refuses a non-empty directory that contains `README.md`, so scaffold aside and copy in.

```bash
mkdir -p .tmp
npx --yes create-next-app@16.3.8 .tmp/scaffold \
  --ts --app --eslint --no-tailwind --no-src-dir --import-alias "@/*" \
  --use-npm --empty --no-react-compiler --no-cache-components \
  --no-agents-md --no-agent-feedback --skip-install --disable-git --yes
```

Expected: "Success! Created scaffold at …/.tmp/scaffold".

- [ ] **Step 3: Verify the scaffold honoured the flags**

The CLI silently ignores unknown flags, so check:

```bash
ls .tmp/scaffold
grep -ci tailwind .tmp/scaffold/package.json || true
grep -n "cacheComponents\|reactCompiler" .tmp/scaffold/next.config.ts || true
```

Expected:
- No `src/` directory.
- Tailwind count is `0`.
- No `cacheComponents` or `reactCompiler` lines.
- No `AGENTS.md` or `CLAUDE.md`.

If any check fails, stop and report. Do not hand-edit around it.

- [ ] **Step 4: Copy the scaffold into the repo**

```bash
rsync -a --exclude README.md --exclude .gitignore --exclude node_modules .tmp/scaffold/ ./
diff .tmp/scaffold/.gitignore .gitignore || true
rm -rf .tmp/scaffold
```

The repo's existing `.gitignore` already covers Next.js output. Append any line the diff shows only on the scaffold side.

- [ ] **Step 5: Name the package, set the Node engine, enforce exact versions**

```bash
npm pkg set name=kapantzakis-gr
npm pkg set private=true --json
npm pkg set engines.node=24.x
printf 'save-exact=true\n' > .npmrc
npm install
node -e '
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const field of ["dependencies", "devDependencies"]) {
  for (const name of Object.keys(pkg[field] ?? {})) {
    pkg[field][name] = require(`./node_modules/${name}/package.json`).version;
  }
}
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
'
npm install
```

Expected: every dependency in `package.json` is an exact version, with no `^` or `~`. Check with `grep -n '"[\^~]' package.json`, which should print nothing.

Record the installed `typescript` version in the Execution Log as **TS fallback version**.

- [ ] **Step 6: Add Prettier and wire ESLint to it**

```bash
npm install -D prettier eslint-config-prettier
```

Create `.prettierrc.json`:

```json
{}
```

Create `.prettierignore`:

```gitignore
.next/
.tmp/
coverage/
playwright-report/
test-results/
package-lock.json
docs/
```

Replace `eslint.config.mjs` with the following. If the scaffold's file imports `eslint-config-next` through different paths, keep the scaffold's import paths and only add the `prettier` import, its array entry, and the extra ignores.

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".tmp/**",
    "playwright-report/**",
    "test-results/**",
    // Plain service-worker script served as a static asset (Task 12).
    "public/sw.js",
  ]),
]);
```

- [ ] **Step 7: Set the npm scripts**

`next typegen` generates `next-env.d.ts` and route types, so `tsc` works on a fresh clone before any build.

```bash
npm pkg set scripts.lint="eslint ."
npm pkg set scripts.typecheck="next typegen && tsc --noEmit"
npm pkg set scripts.format="prettier --write ."
npm pkg set scripts.format:check="prettier --check ."
```

- [ ] **Step 8: Verify the toolchain end to end**

```bash
npm run format && npm run format:check && npm run lint && npm run typecheck && npm run build
```

Expected: all succeed, and `next build` lists `○ /` as static.

- [ ] **Step 9: Commit**

```bash
git add .gitignore .npmrc package.json package-lock.json tsconfig.json next.config.ts eslint.config.mjs .prettierrc.json .prettierignore app/layout.tsx app/page.tsx
git status --short   # confirm nothing else from the scaffold is left unstaged that should ship (e.g. app/globals.css, public/)
git commit -m "Scaffold Next.js 16 app with ESLint, Prettier and exact dependency versions"
```

If `git status` shows other scaffold files, such as `app/globals.css`, `public/*` or `app/favicon.ico`, stage them by explicit path too. Tasks 3 and 12 replace them.

---

### Task 2: TypeScript 7 compatibility gate (decision 9)

**Files:**
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: scripts from Task 1.
- Produces: a final, exact `typescript` version recorded in the Execution Log.

- [ ] **Step 1: Try TypeScript 7**

```bash
npm install -D typescript@7.0.2
```

If npm fails with `ERESOLVE` (a peer-dependency conflict, for example with `typescript-eslint`), TS 7 fails the gate. Go to Step 4.

- [ ] **Step 2: Run the full gate**

```bash
npx tsc --version
npm run typecheck && npm run lint && npm run build
```

Expected for PASS:
- `tsc --version` prints `Version 7.0.2`.
- All three commands exit 0.
- No `typescript-eslint` warning that the TypeScript version is unsupported.

- [ ] **Step 3: If PASS, commit**

```bash
git add package.json package-lock.json
git commit -m "Adopt TypeScript 7"
```

Record "TS 7.0.2 — PASS" in the Execution Log and skip Step 4.

- [ ] **Step 4: If FAIL, restore the fallback**

```bash
npm install -D typescript@<TS fallback version from Execution Log>
npm run typecheck && npm run lint && npm run build
git diff --quiet package.json package-lock.json || { git add package.json package-lock.json && git commit -m "Pin TypeScript to the version supported by the Next.js toolchain"; }
```

Record "TS 7.0.2 — FAIL: <first error line>; using <fallback>" in the Execution Log.

---

### Task 3: Design system — tokens, contrast check, fonts, Vitest harness

**Files:**
- Create: `vitest.config.mts`, `vitest.setup.ts`, `lib/contrast.ts`, `lib/contrast.test.ts`, `styles/tokens.css`, `styles/tokens.test.ts`, `styles/globals.css`, `styles/fonts.ts`
- Modify: `app/layout.tsx`, `package.json`
- Delete: `app/globals.css` (scaffold file, if present)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `contrastRatio(a: string, b: string): number` and `relativeLuminance(hex: string): number` from `@/lib/contrast`.
  - CSS custom properties: `--color-bg`, `--color-fg`, `--color-fg-strong`, `--color-muted`, `--color-surface`, `--color-rule`, `--color-accent-{blue,magenta,lime,orange}`, `--accent`, `--font-display-stack`, `--font-body-stack`, `--text-body`, `--text-lead`, `--text-h3`, `--text-h2`, `--text-display`, `--gutter`, `--measure`, `--transition-fast`.
  - Font objects `displayFont` and `bodyFont` from `@/styles/fonts`.
  - Theme hooks: `main[data-theme="light"]` and `main[data-accent="blue|magenta|lime|orange"]`.

- [ ] **Step 1: Display-font checkpoint (user decision)**

Write `.tmp/font-specimen.html` (git-ignored) and ask the user to open it and pick one of the four fonts:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Display font specimen</title>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=Bricolage+Grotesque:wght@800&family=Inter+Tight:wght@800&family=Space+Grotesk:wght@700&family=Inter:wght@400&display=swap"
    />
    <style>
      body { margin: 0; background: #0b0d12; color: #d9dce3; font: 18px/1.6 Inter, sans-serif; }
      section { padding: 4vw; border-bottom: 1px solid #262a33; }
      section:nth-child(even) { background: #f4f2ee; color: #1a1c22; }
      h2 { margin: 0; font-size: clamp(3rem, 12vw, 14rem); line-height: 0.95; letter-spacing: -0.03em; }
      section:nth-child(odd) h2 { color: #7d8bff; }
      section:nth-child(even) h2 { color: #b8009f; }
      small { font: 600 14px/1 Inter, sans-serif; letter-spacing: 0.1em; text-transform: uppercase; }
    </style>
  </head>
  <body>
    <section style="font-family: 'Bricolage Grotesque'"><small>1 · Bricolage Grotesque</small><h2>I build things for the web.</h2><p>Body text stays a normal size in Inter so long reading is comfortable.</p></section>
    <section style="font-family: 'Space Grotesk'"><small>2 · Space Grotesk</small><h2>I build things for the web.</h2><p>Body text stays a normal size in Inter so long reading is comfortable.</p></section>
    <section style="font-family: 'Inter Tight'"><small>3 · Inter Tight</small><h2>I build things for the web.</h2><p>Body text stays a normal size in Inter so long reading is comfortable.</p></section>
    <section style="font-family: Archivo"><small>4 · Archivo</small><h2>I build things for the web.</h2><p>Body text stays a normal size in Inter so long reading is comfortable.</p></section>
  </body>
</html>
```

Run `open .tmp/font-specimen.html`, then **stop and wait for the user's choice**. Record it in the Execution Log. In Step 9, replace `Bricolage_Grotesque` with the matching `next/font/google` export:

| Choice               | Export                |
|----------------------|-----------------------|
| Bricolage Grotesque  | `Bricolage_Grotesque` |
| Space Grotesk        | `Space_Grotesk`       |
| Inter Tight          | `Inter_Tight`         |
| Archivo              | `Archivo`             |

- [ ] **Step 2: Install the Vitest harness**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths
npm pkg set scripts.test="vitest run"
npm pkg set scripts.test:watch="vitest"
```

Create `vitest.config.mts`:

```ts
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", ".tmp/**", "e2e/**"],
  },
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 3: Write the failing contrast test**

Create `lib/contrast.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { contrastRatio, relativeLuminance } from "./contrast";

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBe(1);
  });

  it("rejects colours that are not #rrggbb", () => {
    expect(() => relativeLuminance("#fff")).toThrow(/#rrggbb/);
    expect(() => relativeLuminance("red")).toThrow(/#rrggbb/);
  });
});

describe("contrastRatio", () => {
  it("is 21 for black on white, in either order", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
  });

  it("is 1 for identical colours", () => {
    expect(contrastRatio("#7d8bff", "#7d8bff")).toBe(1);
  });

  it("matches a known WCAG value", () => {
    // #767676 on white is the classic 4.54:1 AA threshold example.
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run `npx vitest run lib/contrast.test.ts`.
Expected: FAIL, "Failed to resolve import "./contrast"".

- [ ] **Step 5: Implement `lib/contrast.ts`**

```ts
const HEX_COLOUR = /^#([0-9a-f]{6})$/i;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x relative luminance of a #rrggbb colour. */
export function relativeLuminance(hex: string): number {
  const match = HEX_COLOUR.exec(hex);
  if (!match) {
    throw new Error(`Expected a #rrggbb colour, got "${hex}"`);
  }
  const digits = match[1];
  const r = channel(parseInt(digits.slice(0, 2), 16));
  const g = channel(parseInt(digits.slice(2, 4), 16));
  const b = channel(parseInt(digits.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two #rrggbb colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  const [high, low] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}
```

- [ ] **Step 6: Run it to verify it passes**

Run `npx vitest run lib/contrast.test.ts`.
Expected: PASS (5 tests).

- [ ] **Step 7: Write the failing token contrast test**

Create `styles/tokens.test.ts`:

```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";

const css = readFileSync(path.join(process.cwd(), "styles/tokens.css"), "utf8");

const LIGHT_SELECTOR = ':root:has(main[data-theme="light"])';

const TEXT_TOKENS = [
  "--color-fg",
  "--color-fg-strong",
  "--color-muted",
  "--color-accent-blue",
  "--color-accent-magenta",
  "--color-accent-lime",
  "--color-accent-orange",
];

function readColours(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Block "${selector} {" not found in tokens.css`);
  const block = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...block.matchAll(/(--color-[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2].toLowerCase()]),
  );
}

const darkOwn = readColours(":root");
const lightOwn = readColours(LIGHT_SELECTOR);
const themes = { dark: darkOwn, light: { ...darkOwn, ...lightOwn } };

describe.each(Object.entries(themes))("%s theme", (_, colours) => {
  it.each(TEXT_TOKENS)("%s has at least 4.5:1 contrast on --color-bg", (token) => {
    const fg = colours[token];
    const bg = colours["--color-bg"];
    expect(fg, `${token} is not defined`).toBeDefined();
    expect(bg, "--color-bg is not defined").toBeDefined();
    expect(contrastRatio(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
  });
});

it("light theme overrides the background and every text colour", () => {
  for (const token of ["--color-bg", ...TEXT_TOKENS]) {
    expect(lightOwn[token], `${token} missing from light block`).toBeDefined();
  }
});
```

- [ ] **Step 8: Run it to verify it fails**

Run `npx vitest run styles/tokens.test.ts`.
Expected: FAIL, `ENOENT … styles/tokens.css`.

- [ ] **Step 9: Create the tokens, globals and fonts**

Create `styles/tokens.css`. The two theme blocks must keep these exact selectors, because the test above parses them.

```css
/* Dark is the default; a page opts into the light theme or an accent via data-* on <main>. */
:root {
  --color-bg: #0b0d12;
  --color-fg: #d9dce3;
  --color-fg-strong: #ffffff;
  --color-muted: #9aa1ae;
  --color-surface: #151821;
  --color-rule: #262a33;
  --color-accent-blue: #7d8bff;
  --color-accent-magenta: #ff5cd6;
  --color-accent-lime: #c6ff3d;
  --color-accent-orange: #ff8a3d;

  --accent: var(--color-accent-blue);

  --font-display-stack: var(--font-display), system-ui, sans-serif;
  --font-body-stack: var(--font-body), system-ui, sans-serif;

  --text-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lead: clamp(1.125rem, 1rem + 0.6vw, 1.5rem);
  --text-h3: clamp(1.25rem, 1.05rem + 1vw, 2rem);
  --text-h2: clamp(2rem, 1.2rem + 4vw, 5rem);
  --text-display: clamp(3rem, 0.5rem + 12vw, 14rem);

  --gutter: clamp(1rem, 4vw, 4rem);
  --measure: 70ch;
  --transition-fast: 120ms ease-out;
}

:root:has(main[data-theme="light"]) {
  --color-bg: #f4f2ee;
  --color-fg: #1a1c22;
  --color-fg-strong: #0b0d12;
  --color-muted: #5a606c;
  --color-surface: #e9e6df;
  --color-rule: #d3cfc6;
  --color-accent-blue: #3b00eb;
  --color-accent-magenta: #b8009f;
  --color-accent-lime: #3d7300;
  --color-accent-orange: #b34700;
}

:root:has(main[data-accent="magenta"]) {
  --accent: var(--color-accent-magenta);
}

:root:has(main[data-accent="lime"]) {
  --accent: var(--color-accent-lime);
}

:root:has(main[data-accent="orange"]) {
  --accent: var(--color-accent-orange);
}
```

Create `styles/globals.css`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  color-scheme: dark;
  background: var(--color-bg);
}

:root:has(main[data-theme="light"]) {
  color-scheme: light;
}

body {
  margin: 0;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-body-stack);
  font-size: var(--text-body);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3 {
  margin: 0;
  font-family: var(--font-display-stack);
  color: var(--color-fg-strong);
  line-height: 0.95;
  letter-spacing: -0.03em;
  overflow-wrap: break-word;
}

p {
  margin: 0;
}

a {
  color: inherit;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.2em;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--accent);
}

:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

img {
  max-width: 100%;
  height: auto;
}

.skip-link {
  position: absolute;
  left: var(--gutter);
  top: -100px;
  padding: 0.5rem 1rem;
  background: var(--color-fg-strong);
  color: var(--color-bg);
  font-weight: 700;
  z-index: 1;
}

.skip-link:focus {
  top: 1rem;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition: none !important;
    animation: none !important;
  }
}
```

Create `styles/fonts.ts`, using the export chosen in Step 1:

```ts
import { Bricolage_Grotesque, Inter } from "next/font/google";

export const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const bodyFont = Inter({
  subsets: ["latin", "greek"],
  variable: "--font-body",
  display: "swap",
});
```

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { bodyFont, displayFont } from "@/styles/fonts";
import "@/styles/tokens.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Personal website",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Delete the scaffold stylesheet if it exists: `rm -f app/globals.css`. Then remove any `import "./globals.css"` left in `app/page.tsx`.

- [ ] **Step 10: Run the tests and the build**

```bash
npm run test && npm run lint && npm run typecheck && npm run build
```

Expected: tokens test PASS with 15 tests (7 per theme plus the override check), and the contrast tests PASS. The build succeeds and downloads the fonts at build time.

- [ ] **Step 11: Commit**

```bash
npm run format
git add package.json package-lock.json vitest.config.mts vitest.setup.ts lib/contrast.ts lib/contrast.test.ts styles/tokens.css styles/tokens.test.ts styles/globals.css styles/fonts.ts app/layout.tsx app/page.tsx
git rm --cached --ignore-unmatch app/globals.css
git commit -m "Add design tokens with WCAG contrast check, fonts and Vitest harness"
```

---

### Task 4: Profile data

**Prerequisite:** every User Input except the display font is recorded in the Execution Log.

**Files:**
- Create: `lib/period.ts`, `lib/period.test.ts`, `content/profile.ts`, `content/profile.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Period = { start: string; end?: string }` and `formatPeriod(p: Period): string` from `@/lib/period`.
  - `profile: Profile` from `@/content/profile`, with these fields: `name`, `role`, `headline`, `intro: string[]`, `email`, `experience: Role[]`, `education: Degree[]`, `community: CommunityRole[]`, `social: SocialLink[]`.
  - Types `Role { org; orgUrl?; title; period; stack: string[] }`, `Degree { institution; degree; period; thesis?: { label; url } }`, `CommunityRole { org; orgUrl; title; period; summary }` and `SocialLink { label; url }`.

- [ ] **Step 1: Write the failing period test**

Create `lib/period.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatPeriod } from "./period";

describe("formatPeriod", () => {
  it("joins start and end with an en dash", () => {
    expect(formatPeriod({ start: "Jun 2020", end: "Jan 2022" })).toBe("Jun 2020 – Jan 2022");
  });

  it("shows Present for an open period", () => {
    expect(formatPeriod({ start: "Feb 2022" })).toBe("Feb 2022 – Present");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run `npx vitest run lib/period.test.ts`.
Expected: FAIL, the import cannot be resolved.

- [ ] **Step 3: Implement `lib/period.ts`**

```ts
/** Display-ready month/year strings, e.g. "Feb 2022". An absent `end` means ongoing. */
export type Period = { start: string; end?: string };

export function formatPeriod({ start, end }: Period): string {
  return `${start} – ${end ?? "Present"}`;
}
```

- [ ] **Step 4: Write the failing profile test**

Create `content/profile.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { profile } from "./profile";

function allUrls(): string[] {
  return [
    ...profile.experience.flatMap((r) => (r.orgUrl ? [r.orgUrl] : [])),
    ...profile.education.flatMap((d) => (d.thesis ? [d.thesis.url] : [])),
    ...profile.community.map((c) => c.orgUrl),
    ...profile.social.map((s) => s.url),
  ];
}

describe("profile", () => {
  it("has every user-input token filled in", () => {
    expect(JSON.stringify(profile)).not.toMatch(/\{\{[A-Z0-9_]+\}\}/);
  });

  it("uses https for every link", () => {
    for (const url of allUrls()) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("lists exactly one current role, first", () => {
    expect(profile.experience.filter((r) => r.period.end === undefined)).toHaveLength(1);
    expect(profile.experience[0]?.period.end).toBeUndefined();
  });

  it("has a plausible contact email", () => {
    expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("has intro copy for Home and About", () => {
    expect(profile.intro.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 5: Run it to verify it fails**

Run `npx vitest run content/profile.test.ts`.
Expected: FAIL, the import cannot be resolved.

- [ ] **Step 6: Implement `content/profile.ts`**

Substitute each `{{…}}` token with its recorded input.
- If the user dropped Twitter/X, delete that entry.
- If the user dropped the AUTh thesis link, delete that `thesis` property.

The intro copy is a draft drawn from the current site and LinkedIn. The user reviews it in Task 13.

```ts
import type { Period } from "@/lib/period";

export type Role = { org: string; orgUrl?: string; title: string; period: Period; stack: string[] };
export type Degree = { institution: string; degree: string; period: Period; thesis?: { label: string; url: string } };
export type CommunityRole = { org: string; orgUrl: string; title: string; period: Period; summary: string };
export type SocialLink = { label: string; url: string };

export type Profile = {
  name: string;
  role: string;
  headline: string;
  intro: string[];
  email: string;
  experience: Role[];
  education: Degree[];
  community: CommunityRole[];
  social: SocialLink[];
};

export const profile: Profile = {
  name: "{{SITE_OWNER_NAME}}",
  role: "Senior frontend engineer",
  headline: "I build things for the web.",
  intro: [
    "I'm a frontend engineer based in Thessaloniki, Greece. I've been building for the web since 2008, and these days I work mostly with TypeScript, React and Next.js.",
    "I co-organise SKG JS, a JavaScript community in Thessaloniki, and I write about frontend engineering here and on DEV.",
  ],
  email: "{{CONTACT_EMAIL}}",
  experience: [
    {
      org: "Netdata",
      orgUrl: "https://www.netdata.cloud/",
      title: "{{NETDATA_TITLE}}",
      period: { start: "{{NETDATA_START}}" },
      stack: [],
    },
    {
      org: "Adzuna",
      orgUrl: "https://www.adzuna.co.uk/",
      title: "Senior frontend developer",
      period: { start: "Feb 2022", end: "{{ADZUNA_END}}" },
      stack: ["JavaScript", "React", "Next.js"],
    },
    {
      org: "Skroutz",
      orgUrl: "https://www.skroutz.gr/",
      title: "Software engineer",
      period: { start: "Jun 2020", end: "Jan 2022" },
      stack: ["JavaScript", "React", "Ruby on Rails"],
    },
    {
      org: "EpsilonNet",
      orgUrl: "https://www.epsilonnet.gr/",
      title: "Web developer",
      period: { start: "Sep 2014", end: "May 2020" },
      stack: ["JavaScript", "TypeScript", "ASP.NET", "C#"],
    },
    {
      org: "Independent",
      title: "Web developer (hobbyist)",
      period: { start: "2008", end: "2014" },
      stack: ["HTML", "CSS", "jQuery", "PHP", "MySQL", "Joomla"],
    },
  ],
  education: [
    {
      institution: "University of Macedonia",
      degree: "MSc in Applied Informatics",
      period: { start: "2015", end: "2018" },
      thesis: {
        label: "Thesis (English)",
        url: "https://dspace.lib.uom.gr/bitstream/2159/22942/4/KapantzakisIoannisMsc2018.pdf",
      },
    },
    {
      institution: "Aristotle University of Thessaloniki",
      degree: "MSc in Informatics and Management",
      period: { start: "2008", end: "2010" },
      thesis: {
        label: "Thesis (Greek)",
        url: "https://ikee.lib.auth.gr/record/115789/files/kapantzakes.pdf",
      },
    },
    {
      institution: "Aristotle University of Thessaloniki",
      degree: "BSc in Economic Science",
      period: { start: "2001", end: "2006" },
    },
  ],
  community: [
    {
      org: "SKG JS",
      orgUrl: "https://www.linkedin.com/company/skg-js/",
      title: "Co-organiser",
      period: { start: "{{SKGJS_START}}" },
      summary: "Organising meetups and talks for the JavaScript community in Thessaloniki.",
    },
  ],
  social: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/johnkapantzakis" },
    { label: "GitHub", url: "https://github.com/kapantzak" },
    { label: "DEV", url: "https://dev.to/kapantzak" },
    { label: "Stack Overflow", url: "https://stackoverflow.com/users/1221792/kapantzak" },
    { label: "GitLab", url: "https://gitlab.com/kapantzak" },
    { label: "X", url: "https://x.com/gianniskap" },
  ],
};
```

- [ ] **Step 7: Run the tests to verify they pass**

Run `npm run test`.
Expected: PASS. If "has every user-input token filled in" fails, a token is still unsubstituted.

- [ ] **Step 8: Commit**

```bash
npm run format
git add lib/period.ts lib/period.test.ts content/profile.ts content/profile.test.ts
git commit -m "Add typed profile data for experience, education, community and links"
```

---

### Task 5: App shell — layout, nav, footer, page primitives, Playwright harness

**Files:**
- Create: `lib/site.ts`, `lib/nav.ts`, `lib/nav.test.ts`, `components/Nav.tsx`, `components/NavLinks.tsx`, `components/NavLinks.test.tsx`, `components/Nav.module.css`, `components/Footer.tsx`, `components/Footer.module.css`, `components/PageMain.tsx`, `components/PageMain.module.css`, `components/PageHeader.tsx`, `components/PageHeader.module.css`, `components/Section.tsx`, `components/Section.module.css`, `components/Prose.tsx`, `components/Prose.module.css`, `playwright.config.ts`, `e2e/helpers.ts`, `e2e/home.spec.ts`
- Modify: `app/layout.tsx`, `app/page.tsx`, `package.json`, `.gitignore`

**Interfaces:**
- Consumes: `profile` (Task 4), tokens and fonts (Task 3).
- Produces:
  - `SITE_URL: string` from `@/lib/site`.
  - `NAV_ITEMS` and `isActive(href: string, pathname: string): boolean` from `@/lib/nav`.
  - `<PageMain accent theme?>`, where `Accent = "blue" | "magenta" | "lime" | "orange"` and `theme` is `"dark" | "light"`, defaulting to dark.
  - `<PageHeader eyebrow title lead? size?>`, where `size` is `"display" | "title"`.
  - `<Section index title>` and `<Prose>`.
  - e2e helpers `DARK_BG`, `LIGHT_BG`, `expectNoHorizontalOverflow(page)` and `expectBodyBackground(page, colour)`.
  - npm script `e2e`.

- [ ] **Step 1: Write the failing nav tests**

Create `lib/nav.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isActive, NAV_ITEMS } from "./nav";

describe("NAV_ITEMS", () => {
  it("lists the four routes in order", () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual(["/", "/about", "/posts", "/contact"]);
  });
});

describe("isActive", () => {
  it("matches Home only on the root path", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/", "/about")).toBe(false);
  });

  it("matches a section and its children", () => {
    expect(isActive("/posts", "/posts")).toBe(true);
    expect(isActive("/posts", "/posts/hello")).toBe(true);
  });

  it("does not match a different route that shares a prefix", () => {
    expect(isActive("/posts", "/postscript")).toBe(false);
  });
});
```

Create `components/NavLinks.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavLinks } from "./NavLinks";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("NavLinks", () => {
  it("marks only the current section with aria-current", () => {
    pathname.current = "/posts/hello";
    render(<NavLinks />);
    expect(screen.getByRole("link", { name: "Posts" })).toHaveAttribute("aria-current", "page");
    for (const name of ["Home", "About", "Contact"]) {
      expect(screen.getByRole("link", { name })).not.toHaveAttribute("aria-current");
    }
  });

  it("links to every route", () => {
    pathname.current = "/";
    render(<NavLinks />);
    expect(screen.getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "/",
      "/about",
      "/posts",
      "/contact",
    ]);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run `npx vitest run lib/nav.test.ts components/NavLinks.test.tsx`.
Expected: FAIL, the imports cannot be resolved.

- [ ] **Step 3: Implement `lib/site.ts`, `lib/nav.ts` and the nav components**

`lib/site.ts`:

```ts
export const SITE_URL = "https://kapantzakis.gr";
```

`lib/nav.ts`:

```ts
export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/posts", label: "Posts" },
  { href: "/contact", label: "Contact" },
] as const;

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
```

`components/NavLinks.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, NAV_ITEMS } from "@/lib/nav";
import styles from "./Nav.module.css";

// The only client component: the active route is known only after navigation.
export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className={styles.links}>
      {NAV_ITEMS.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={styles.link}
            aria-current={isActive(item.href, pathname) ? "page" : undefined}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

`components/Nav.tsx`:

```tsx
import Link from "next/link";
import { profile } from "@/content/profile";
import { NavLinks } from "./NavLinks";
import styles from "./Nav.module.css";

export function Nav() {
  return (
    <header className={styles.header}>
      <nav aria-label="Main" className={styles.nav}>
        <Link href="/" className={styles.brand}>
          {profile.name}
        </Link>
        <NavLinks />
      </nav>
    </header>
  );
}
```

`components/Nav.module.css`:

```css
.header {
  padding: 1.25rem var(--gutter);
}

.nav {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem 2rem;
}

.brand {
  font-family: var(--font-display-stack);
  font-size: var(--text-h3);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-fg-strong);
  text-decoration: none;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.link {
  font-weight: 600;
  text-decoration: none;
}

.link[aria-current="page"] {
  color: var(--accent);
  text-decoration: underline;
}
```

- [ ] **Step 4: Run the nav tests to verify they pass**

Run `npx vitest run lib/nav.test.ts components/NavLinks.test.tsx`.
Expected: PASS (6 tests).

- [ ] **Step 5: Create the footer and page primitives**

`components/Footer.tsx`:

```tsx
import { profile } from "@/content/profile";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <ul className={styles.links} aria-label="Social links">
        {profile.social.map((link) => (
          <li key={link.url}>
            <a href={link.url} target="_blank" rel="me noopener noreferrer">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <p className={styles.copy}>
        © {new Date().getFullYear()} {profile.name}
      </p>
    </footer>
  );
}
```

`components/Footer.module.css`:

```css
.footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem 2rem;
  padding: 2rem var(--gutter);
  border-top: 1px solid var(--color-rule);
  color: var(--color-muted);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
```

`components/PageMain.tsx`:

```tsx
import type { ReactNode } from "react";
import styles from "./PageMain.module.css";

export type Accent = "blue" | "magenta" | "lime" | "orange";

type Props = { accent: Accent; theme?: "dark" | "light"; children: ReactNode };

// data-theme / data-accent are read by :root:has(...) rules in styles/tokens.css.
export function PageMain({ accent, theme = "dark", children }: Props) {
  return (
    <main id="main" tabIndex={-1} className={styles.main} data-theme={theme} data-accent={accent}>
      {children}
    </main>
  );
}
```

`components/PageMain.module.css`:

```css
.main {
  flex: 1;
  display: grid;
  align-content: start;
  gap: clamp(3rem, 8vw, 8rem);
  padding: clamp(2rem, 6vw, 6rem) var(--gutter);
}

.main:focus {
  outline: none;
}
```

`components/PageHeader.tsx`:

```tsx
import styles from "./PageHeader.module.css";

type Props = { eyebrow: string; title: string; lead?: string; size?: "display" | "title" };

export function PageHeader({ eyebrow, title, lead, size = "display" }: Props) {
  return (
    <header className={styles.header}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={size === "display" ? styles.display : styles.title}>{title}</h1>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </header>
  );
}
```

`components/PageHeader.module.css`:

```css
.header {
  display: grid;
  gap: 1.5rem;
}

.eyebrow {
  font-family: var(--font-display-stack);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.display {
  font-size: var(--text-display);
  font-weight: 800;
  color: var(--accent);
}

.title {
  font-size: var(--text-h2);
  font-weight: 800;
  color: var(--color-fg-strong);
}

.lead {
  max-width: var(--measure);
  font-size: var(--text-lead);
  line-height: 1.5;
  color: var(--color-fg-strong);
}
```

`components/Section.tsx`:

```tsx
import type { ReactNode } from "react";
import styles from "./Section.module.css";

type Props = { index: string; title: string; children: ReactNode };

export function Section({ index, title, children }: Props) {
  const headingId = `section-${index}`;
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        <span className={styles.index} aria-hidden="true">
          {index} /{" "}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
```

`components/Section.module.css`:

```css
.section {
  display: grid;
  gap: clamp(1.5rem, 3vw, 3rem);
}

.heading {
  font-size: var(--text-h2);
  font-weight: 800;
}

.index {
  color: var(--accent);
}
```

`components/Prose.tsx`:

```tsx
import type { ReactNode } from "react";
import styles from "./Prose.module.css";

export function Prose({ children }: { children: ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}
```

`components/Prose.module.css`:

```css
.prose {
  max-width: var(--measure);
}

.prose > * + * {
  margin-top: 1.25em;
}

.prose h2 {
  margin-top: 2em;
  font-size: var(--text-h3);
}

.prose h3 {
  margin-top: 1.5em;
  font-size: var(--text-lead);
}

.prose ul,
.prose ol {
  padding-left: 1.25em;
}

.prose a {
  color: var(--accent);
}

.prose pre {
  overflow-x: auto;
  padding: 1rem;
  background: var(--color-surface);
}

.prose code {
  font-size: 0.9em;
}
```

- [ ] **Step 6: Wire the layout and a first Home page**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { profile } from "@/content/profile";
import { SITE_URL } from "@/lib/site";
import { bodyFont, displayFont } from "@/styles/fonts";
import "@/styles/tokens.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${profile.name} — ${profile.role}`, template: `%s — ${profile.name}` },
  description: profile.headline,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

Replace `app/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <PageMain accent="blue">
      <PageHeader eyebrow={`01 / ${profile.role}`} title={profile.headline} lead={profile.intro[0]} />
    </PageMain>
  );
}
```

- [ ] **Step 7: Install Playwright and write the failing smoke test**

```bash
npm install -D @playwright/test
npx playwright install chromium
npm pkg set scripts.e2e="playwright test"
```

Append to `.gitignore`:

```gitignore

# playwright
/playwright-report/
/test-results/
```

Create `playwright.config.ts`. `BASE_URL` lets the same suite smoke-test a deployed site in Task 13. The local server builds with drafts included, so the MDX pipeline is exercised.

```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const externalBaseURL = process.env.BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: externalBaseURL ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: `INCLUDE_DRAFTS=1 npm run build && npm run start -- --port ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: false,
        timeout: 240_000,
      },
});
```

Create `e2e/helpers.ts`:

```ts
import { expect, type Page } from "@playwright/test";

export const DARK_BG = "rgb(11, 13, 18)";
export const LIGHT_BG = "rgb(244, 242, 238)";
export const DRAFTS_AVAILABLE = !process.env.BASE_URL;

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "page scrolls horizontally").toBeLessThanOrEqual(0);
}

export async function expectBodyBackground(page: Page, colour: string): Promise<void> {
  await expect(page.locator("body")).toHaveCSS("background-color", colour);
}
```

Create `e2e/home.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { DARK_BG, expectBodyBackground, expectNoHorizontalOverflow } from "./helpers";

test("home renders the headline on the dark theme without horizontal scroll", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("I build things for the web.");
  await expectBodyBackground(page, DARK_BG);
  await expectNoHorizontalOverflow(page);
});

test("home is marked as the current page in the main nav", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
});

test("the skip link is the first tab stop and targets main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});
```

- [ ] **Step 8: Run the smoke tests**

Run `npm run e2e`.
Expected: PASS, 6 tests (3 per project). If the build fails, fix the cause rather than the test.

To prove the tests can fail, temporarily change `DARK_BG` to `"rgb(0, 0, 0)"`, rerun and see the background test FAIL, then revert.

- [ ] **Step 9: Run the full gate and commit**

```bash
npm run format && npm run lint && npm run typecheck && npm run test
git add .gitignore package.json package-lock.json playwright.config.ts e2e/helpers.ts e2e/home.spec.ts lib/site.ts lib/nav.ts lib/nav.test.ts components/Nav.tsx components/NavLinks.tsx components/NavLinks.test.tsx components/Nav.module.css components/Footer.tsx components/Footer.module.css components/PageMain.tsx components/PageMain.module.css components/PageHeader.tsx components/PageHeader.module.css components/Section.tsx components/Section.module.css components/Prose.tsx components/Prose.module.css app/layout.tsx app/page.tsx
git commit -m "Add app shell with nav, footer, page primitives and Playwright smoke tests"
```

---

### Task 6: Posts library and external posts

**Files:**
- Create: `lib/posts.ts`, `lib/posts.test.ts`, `content/external-posts.ts`, `content/external-posts.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces, all from `@/lib/posts`:
  - `type PostFields = { title: string; date: string; summary: string }`
  - `type LocalPost = PostFields & { kind: "local"; slug: string; draft: boolean }`
  - `type ExternalPost = PostFields & { kind: "external"; url: string; source: string }`
  - `type Post = LocalPost | ExternalPost`
  - `type ExternalPostInput = Omit<ExternalPost, "kind">`
  - `class PostValidationError extends Error`
  - `parseLocalPost(slug: string, metadata: unknown): LocalPost`
  - `parseExternalPost(input: unknown, index: number): ExternalPost`
  - `mergePosts(local: LocalPost[], external: ExternalPost[]): Post[]`, newest first, ties broken by title
  - `selectVisible(posts: LocalPost[], includeDrafts: boolean): LocalPost[]`
  - `formatPostDate(date: string): string`, e.g. `"15 Aug 2019"`

  And `externalPosts: ExternalPostInput[]` from `@/content/external-posts`.

- [ ] **Step 1: Write the failing posts tests**

Create `lib/posts.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  type ExternalPost,
  formatPostDate,
  type LocalPost,
  mergePosts,
  parseExternalPost,
  parseLocalPost,
  PostValidationError,
  selectVisible,
} from "./posts";

const VALID_META = { title: "Hello", date: "2026-01-02", summary: "A summary." };

const local = (overrides: Partial<LocalPost> = {}): LocalPost => ({
  kind: "local",
  slug: "hello",
  title: "Hello",
  date: "2026-01-02",
  summary: "A summary.",
  draft: false,
  ...overrides,
});

const external = (overrides: Partial<ExternalPost> = {}): ExternalPost => ({
  kind: "external",
  url: "https://dev.to/example/post",
  source: "DEV",
  title: "Elsewhere",
  date: "2019-08-15",
  summary: "An external summary.",
  ...overrides,
});

describe("parseLocalPost", () => {
  it("builds a local post from valid metadata", () => {
    expect(parseLocalPost("hello", VALID_META)).toEqual(local());
  });

  it("reads an explicit draft flag", () => {
    expect(parseLocalPost("hello", { ...VALID_META, draft: true }).draft).toBe(true);
  });

  it.each([
    ["missing metadata", undefined, /metadata export is missing/],
    ["blank title", { ...VALID_META, title: "  " }, /"title"/],
    ["missing summary", { title: "Hello", date: "2026-01-02" }, /"summary"/],
    ["non-ISO date", { ...VALID_META, date: "02/01/2026" }, /"date"/],
    ["impossible date", { ...VALID_META, date: "2026-02-30" }, /"date"/],
    ["out-of-range month", { ...VALID_META, date: "2026-13-01" }, /"date"/],
    ["non-boolean draft", { ...VALID_META, draft: "yes" }, /"draft"/],
  ])("rejects %s", (_, metadata, message) => {
    expect(() => parseLocalPost("hello", metadata)).toThrow(message);
  });

  it("names the offending file in errors", () => {
    expect(() => parseLocalPost("hello", { ...VALID_META, title: "" })).toThrow(/content\/posts\/hello\.mdx/);
  });

  it("rejects slugs that are not lowercase kebab-case", () => {
    expect(() => parseLocalPost("Hello_World", VALID_META)).toThrow(/slug/);
  });

  it("throws PostValidationError", () => {
    expect(() => parseLocalPost("hello", undefined)).toThrow(PostValidationError);
  });
});

describe("parseExternalPost", () => {
  const input = {
    title: "Elsewhere",
    date: "2019-08-15",
    summary: "An external summary.",
    url: "https://dev.to/example/post",
    source: "DEV",
  };

  it("builds an external post", () => {
    expect(parseExternalPost(input, 0)).toEqual(external());
  });

  it("rejects non-https URLs", () => {
    expect(() => parseExternalPost({ ...input, url: "http://dev.to/x" }, 3)).toThrow(/\[3\].*https/);
  });

  it("rejects a missing source", () => {
    expect(() => parseExternalPost({ ...input, source: "" }, 0)).toThrow(/"source"/);
  });
});

describe("mergePosts", () => {
  it("sorts newest first across local and external posts", () => {
    const merged = mergePosts(
      [local({ slug: "older", date: "2020-01-01" }), local({ slug: "newer", date: "2026-01-01" })],
      [external({ date: "2023-05-05" })],
    );
    expect(merged.map((p) => p.date)).toEqual(["2026-01-01", "2023-05-05", "2020-01-01"]);
  });

  it("breaks date ties by title", () => {
    const merged = mergePosts([local({ slug: "b", title: "B" }), local({ slug: "a", title: "A" })], []);
    expect(merged.map((p) => p.title)).toEqual(["A", "B"]);
  });

  it("rejects duplicate slugs", () => {
    expect(() => mergePosts([local(), local()], [])).toThrow(/Duplicate slug: hello/);
  });

  it("rejects duplicate external URLs", () => {
    expect(() => mergePosts([], [external(), external()])).toThrow(/Duplicate external URL/);
  });
});

describe("selectVisible", () => {
  const posts = [local({ slug: "live" }), local({ slug: "wip", draft: true })];

  it("hides drafts by default", () => {
    expect(selectVisible(posts, false).map((p) => p.slug)).toEqual(["live"]);
  });

  it("keeps drafts when requested", () => {
    expect(selectVisible(posts, true).map((p) => p.slug)).toEqual(["live", "wip"]);
  });
});

describe("formatPostDate", () => {
  it("formats as day, short month, year", () => {
    expect(formatPostDate("2019-08-15")).toBe("15 Aug 2019");
  });

  it("does not shift the day across time zones", () => {
    expect(formatPostDate("2020-01-01")).toBe("1 Jan 2020");
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run `npx vitest run lib/posts.test.ts`.
Expected: FAIL, the import cannot be resolved.

- [ ] **Step 3: Implement `lib/posts.ts`**

```ts
export type PostFields = { title: string; date: string; summary: string };
export type LocalPost = PostFields & { kind: "local"; slug: string; draft: boolean };
export type ExternalPost = PostFields & { kind: "external"; url: string; source: string };
export type Post = LocalPost | ExternalPost;
export type ExternalPostInput = Omit<ExternalPost, "kind">;

export class PostValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PostValidationError";
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string, where: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new PostValidationError(`${where}: "${key}" must be a non-empty string`);
  }
  return value;
}

function readDate(record: Record<string, unknown>, where: string): string {
  const value = readString(record, "date", where);
  const parsed = new Date(`${value}T00:00:00Z`);
  // The round-trip rejects impossible days such as 2026-02-30 that Date would roll over.
  if (
    !DATE_PATTERN.test(value) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new PostValidationError(`${where}: "date" must be a real date in YYYY-MM-DD format`);
  }
  return value;
}

export function parseLocalPost(slug: string, metadata: unknown): LocalPost {
  const where = `content/posts/${slug}.mdx`;
  if (!SLUG_PATTERN.test(slug)) {
    throw new PostValidationError(`${where}: file name must be a lowercase kebab-case slug`);
  }
  if (!isRecord(metadata)) {
    throw new PostValidationError(`${where}: metadata export is missing or not an object`);
  }
  const draft = metadata.draft ?? false;
  if (typeof draft !== "boolean") {
    throw new PostValidationError(`${where}: "draft" must be a boolean when present`);
  }
  return {
    kind: "local",
    slug,
    title: readString(metadata, "title", where),
    date: readDate(metadata, where),
    summary: readString(metadata, "summary", where),
    draft,
  };
}

export function parseExternalPost(input: unknown, index: number): ExternalPost {
  const where = `content/external-posts.ts[${index}]`;
  if (!isRecord(input)) {
    throw new PostValidationError(`${where}: entry must be an object`);
  }
  const url = readString(input, "url", where);
  if (!url.startsWith("https://")) {
    throw new PostValidationError(`${where}: "url" must start with https://`);
  }
  return {
    kind: "external",
    url,
    source: readString(input, "source", where),
    title: readString(input, "title", where),
    date: readDate(input, where),
    summary: readString(input, "summary", where),
  };
}

function assertUnique(values: string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new PostValidationError(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

export function mergePosts(local: LocalPost[], external: ExternalPost[]): Post[] {
  assertUnique(
    local.map((p) => p.slug),
    "slug",
  );
  assertUnique(
    external.map((p) => p.url),
    "external URL",
  );
  return [...local, ...external].sort(
    (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
  );
}

export function selectVisible(posts: LocalPost[], includeDrafts: boolean): LocalPost[] {
  return includeDrafts ? posts : posts.filter((p) => !p.draft);
}

export function formatPostDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run `npx vitest run lib/posts.test.ts`.
Expected: PASS.

- [ ] **Step 5: Write the failing external-posts test**

Create `content/external-posts.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mergePosts, parseExternalPost } from "@/lib/posts";
import { externalPosts } from "./external-posts";

describe("externalPosts", () => {
  it("contains the 10 DEV articles and the Scalable Path article", () => {
    expect(externalPosts.filter((p) => p.source === "DEV")).toHaveLength(10);
    expect(externalPosts.filter((p) => p.source === "Scalable Path")).toHaveLength(1);
  });

  it("every entry is valid and URLs are unique", () => {
    const parsed = externalPosts.map((entry, i) => parseExternalPost(entry, i));
    expect(() => mergePosts([], parsed)).not.toThrow();
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run `npx vitest run content/external-posts.test.ts`.
Expected: FAIL, the import cannot be resolved.

- [ ] **Step 7: Create `content/external-posts.ts`**

Titles, dates and URLs come from the dev.to API and Scalable Path's `datePublished`, checked on 2026-10-02. The summaries are short drafts for the user to review in Task 13.

```ts
import type { ExternalPostInput } from "@/lib/posts";

export const externalPosts: ExternalPostInput[] = [
  {
    title: "TypeScript or Flow: Which Is Better?",
    date: "2020-07-16",
    summary: "The pros and cons of Flow and TypeScript, to help choose a type checker for a JavaScript project.",
    url: "https://www.scalablepath.com/blog/typescript-or-flow-which-is-better/",
    source: "Scalable Path",
  },
  {
    title: "Including files created by Node.js into .Net project 🛠",
    date: "2020-02-21",
    summary: "Adding files generated by a Node.js script to a .NET project file automatically.",
    url: "https://dev.to/kapantzak/including-files-created-by-node-js-into-net-project-l1m",
    source: "DEV",
  },
  {
    title: "Automating boilerplate code generation with Node.js and Handlebars",
    date: "2020-02-18",
    summary: "Generating the repetitive files every new form needs with a Node.js script and Handlebars templates.",
    url: "https://dev.to/kapantzak/automating-boilerplate-code-generation-with-node-js-and-handlebars-2c09",
    source: "DEV",
  },
  {
    title: "CSS cascade: Importance",
    date: "2019-12-04",
    summary: "How the CSS cascade decides which declaration wins when origins and !important collide.",
    url: "https://dev.to/kapantzak/css-cascade-importance-2g3k",
    source: "DEV",
  },
  {
    title: "JS illustrated: Promises",
    date: "2019-10-08",
    summary: "An illustrated walkthrough of how JavaScript promises work.",
    url: "https://dev.to/kapantzak/js-illustrated-promises-3ign",
    source: "DEV",
  },
  {
    title: "The RGB split effect with css and a bit of javascript",
    date: "2019-09-16",
    summary: "Recreating an RGB split text effect with CSS and a little JavaScript.",
    url: "https://dev.to/kapantzak/the-rgb-split-effect-with-css-and-a-bit-of-javascript-4j4i",
    source: "DEV",
  },
  {
    title: "Creating the typewriter effect with the use of async generators",
    date: "2019-09-02",
    summary: "Building a typewriter text effect with async generators.",
    url: "https://dev.to/kapantzak/creating-the-typewriter-effect-with-the-use-of-async-generators-5f1e",
    source: "DEV",
  },
  {
    title: "Using Redux in a legacy ASP.NET Web Forms project",
    date: "2019-08-22",
    summary: "Bringing Redux state management into a legacy ASP.NET Web Forms application.",
    url: "https://dev.to/kapantzak/using-redux-in-a-legacy-asp-net-web-forms-project-1805",
    source: "DEV",
  },
  {
    title: "Waiting for visible element",
    date: "2019-08-19",
    summary: "Running code only once a specific element becomes visible on the page.",
    url: "https://dev.to/kapantzak/waiting-for-visible-element-4ck9",
    source: "DEV",
  },
  {
    title: "JS illustrated: The event loop 🔁",
    date: "2019-08-15",
    summary: "An illustrated explanation of how the event loop lets single-threaded JavaScript run asynchronous code.",
    url: "https://dev.to/kapantzak/js-illustrated-the-event-loop-4mco",
    source: "DEV",
  },
  {
    title: "Some of my favorite Javascript resources",
    date: "2019-08-06",
    summary: "A list of the JavaScript resources I keep coming back to.",
    url: "https://dev.to/kapantzak/some-of-my-favorite-javascript-resources-13cg",
    source: "DEV",
  },
];
```

- [ ] **Step 8: Run all unit tests and commit**

```bash
npm run test && npm run lint && npm run typecheck
npm run format
git add lib/posts.ts lib/posts.test.ts content/external-posts.ts content/external-posts.test.ts
git commit -m "Add validated posts model and list of externally published articles"
```

---

### Task 7: MDX pipeline and the post page

**Files:**
- Create: `mdx-components.tsx`, `lib/post-source.ts`, `content/posts/draft-fixture.mdx`, `app/posts/[slug]/page.tsx`, `app/posts/[slug]/page.module.css`, `e2e/post.spec.ts`
- Modify: `next.config.ts`, `package.json`

**Interfaces:**
- Consumes: `parseLocalPost`, `parseExternalPost`, `mergePosts`, `selectVisible`, `formatPostDate` and the types (Task 6), `externalPosts` (Task 6), and `PageMain`, `PageHeader`, `Prose` (Task 5).
- Produces, from `@/lib/post-source` (server-only, build-time):
  - `getAllPosts(): Promise<Post[]>`
  - `getLocalPostSlugs(): Promise<string[]>`
  - `getLocalPost(slug: string): Promise<{ post: LocalPost; Content: ComponentType }>`
  - Drafts are included only when `process.env.INCLUDE_DRAFTS === "1"`.

- [ ] **Step 1: Install MDX support**

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
```

- [ ] **Step 2: Configure Next.js and the MDX components file**

Replace `next.config.ts`:

```ts
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

// MDX files are imported by lib/post-source.ts, not routed, so pageExtensions stays default.
const withMDX = createMDX({});

export default withMDX(nextConfig);
```

Create `mdx-components.tsx` (required by `@next/mdx` in the App Router):

```tsx
import type { MDXComponents } from "mdx/types";

// Post typography comes from <Prose>; no element overrides are needed.
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
```

- [ ] **Step 3: Add the draft fixture**

Create `content/posts/draft-fixture.mdx`:

```mdx
export const metadata = {
  title: "Draft fixture",
  date: "2026-01-01",
  summary: "Exercises the MDX pipeline in end-to-end tests. Never published.",
  draft: true,
};

This paragraph proves MDX body rendering works.

## A subheading

- A list item with a [link](https://example.com).

`inline code` and a block:

    const answer = 42;
```

- [ ] **Step 4: Write the failing post-page smoke test**

Create `e2e/post.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { DRAFTS_AVAILABLE, LIGHT_BG, expectBodyBackground, expectNoHorizontalOverflow } from "./helpers";

test("a local post renders through the MDX pipeline on the light theme", async ({ page }) => {
  test.skip(!DRAFTS_AVAILABLE, "The draft fixture is only built locally");
  const response = await page.goto("/posts/draft-fixture");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Draft fixture" })).toBeVisible();
  await expect(page.getByText("This paragraph proves MDX body rendering works.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "A subheading" })).toBeVisible();
  await expect(page.getByText("1 Jan 2026")).toBeVisible();
  await expectBodyBackground(page, LIGHT_BG);
  await expectNoHorizontalOverflow(page);
});

test("an unknown post slug returns 404", async ({ page }) => {
  const response = await page.goto("/posts/does-not-exist");
  expect(response?.status()).toBe(404);
});
```

Run `npx playwright test e2e/post.spec.ts`.
Expected: FAIL. The first test gets a 404 because the route does not exist yet.

- [ ] **Step 5: Implement `lib/post-source.ts`**

```ts
import { readdir } from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";
import { externalPosts } from "@/content/external-posts";
import {
  type LocalPost,
  mergePosts,
  parseExternalPost,
  parseLocalPost,
  type Post,
  selectVisible,
} from "@/lib/posts";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

type MdxModule = { default: ComponentType; metadata?: unknown };

// Drafts are built only on request, e.g. by the end-to-end test build.
function includeDrafts(): boolean {
  return process.env.INCLUDE_DRAFTS === "1";
}

async function importPost(slug: string): Promise<MdxModule> {
  return (await import(`@/content/posts/${slug}.mdx`)) as MdxModule;
}

async function loadLocalPosts(): Promise<LocalPost[]> {
  const files = await readdir(POSTS_DIR);
  const slugs = files.filter((f) => f.endsWith(".mdx")).map((f) => f.slice(0, -".mdx".length));
  const posts = await Promise.all(
    slugs.map(async (slug) => parseLocalPost(slug, (await importPost(slug)).metadata)),
  );
  return selectVisible(posts, includeDrafts());
}

export async function getAllPosts(): Promise<Post[]> {
  const external = externalPosts.map((entry, index) => parseExternalPost(entry, index));
  return mergePosts(await loadLocalPosts(), external);
}

export async function getLocalPostSlugs(): Promise<string[]> {
  return (await loadLocalPosts()).map((post) => post.slug);
}

export async function getLocalPost(slug: string): Promise<{ post: LocalPost; Content: ComponentType }> {
  const post = (await loadLocalPosts()).find((p) => p.slug === slug);
  if (!post) {
    throw new Error(`No published post with slug "${slug}"`);
  }
  const { default: Content } = await importPost(slug);
  return { post, Content };
}
```

- [ ] **Step 6: Implement the post page**

`app/posts/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";
import { Prose } from "@/components/Prose";
import { getLocalPost, getLocalPostSlugs } from "@/lib/post-source";
import { formatPostDate } from "@/lib/posts";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return (await getLocalPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getLocalPost(slug);
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/posts/${slug}` },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const { post, Content } = await getLocalPost(slug);
  return (
    <PageMain accent="magenta" theme="light">
      <article className={styles.article}>
        <PageHeader eyebrow={formatPostDate(post.date)} title={post.title} lead={post.summary} size="title" />
        <Prose>
          <Content />
        </Prose>
      </article>
    </PageMain>
  );
}
```

`app/posts/[slug]/page.module.css`:

```css
.article {
  display: grid;
  gap: clamp(2rem, 5vw, 4rem);
}
```

- [ ] **Step 7: Run the smoke tests to verify they pass**

Run `npx playwright test e2e/post.spec.ts`.
Expected: PASS, 4 tests (2 per project).

- [ ] **Step 8: Run the full gate**

```bash
npm run lint && npm run typecheck && npm run test && npm run e2e
```

Expected: all PASS.

- [ ] **Step 9: Verify drafts are absent from a production build (Review Focus #3)**

```bash
npm run build
npm run start -- --port 3200 > .tmp/start.log 2>&1 &
START_PID=$!
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3200/posts/draft-fixture
kill "$START_PID"
```

Expected: `404`. Also confirm that the build output does not list `/posts/draft-fixture` under `/posts/[slug]`.

- [ ] **Step 10: Commit**

```bash
npm run format
git add package.json package-lock.json next.config.ts mdx-components.tsx lib/post-source.ts content/posts/draft-fixture.mdx "app/posts/[slug]/page.tsx" "app/posts/[slug]/page.module.css" e2e/post.spec.ts
git commit -m "Add MDX post pipeline with draft fixture and statically generated post pages"
```

---

### Task 8: Posts index page

**Files:**
- Create: `components/PostList.tsx`, `components/PostList.module.css`, `components/PostList.test.tsx`, `app/posts/page.tsx`, `e2e/posts.spec.ts`

**Interfaces:**
- Consumes: `Post`, `formatPostDate` (Task 6), `getAllPosts` (Task 7), `PageMain`, `PageHeader` (Task 5).
- Produces: `<PostList posts={Post[]} label={string} headingLevel={2 | 3} />`.

- [ ] **Step 1: Write the failing component test**

Create `components/PostList.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Post } from "@/lib/posts";
import { PostList } from "./PostList";

const posts: Post[] = [
  {
    kind: "local",
    slug: "new-site",
    title: "New site",
    date: "2026-01-02",
    summary: "Local summary",
    draft: false,
  },
  {
    kind: "external",
    url: "https://dev.to/kapantzak/event-loop",
    source: "DEV",
    title: "Event loop",
    date: "2019-08-15",
    summary: "External summary",
  },
];

describe("PostList", () => {
  it("is a labelled ordered list with one item per post", () => {
    render(<PostList posts={posts} label="All posts" headingLevel={2} />);
    const list = screen.getByRole("list", { name: "All posts" });
    expect(list.tagName).toBe("OL");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("links local posts to their page in the same tab", () => {
    render(<PostList posts={posts} label="All posts" headingLevel={2} />);
    const link = screen.getByRole("link", { name: "New site" });
    expect(link).toHaveAttribute("href", "/posts/new-site");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens external posts in a new tab and names the source", () => {
    render(<PostList posts={posts} label="All posts" headingLevel={2} />);
    const link = screen.getByRole("link", { name: "Event loop on DEV" });
    expect(link).toHaveAttribute("href", "https://dev.to/kapantzak/event-loop");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows readable dates with machine-readable datetime", () => {
    render(<PostList posts={posts} label="All posts" headingLevel={2} />);
    expect(screen.getByText("15 Aug 2019")).toHaveAttribute("dateTime", "2019-08-15");
  });

  it("uses the requested heading level", () => {
    render(<PostList posts={posts} label="Latest posts" headingLevel={3} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run `npx vitest run components/PostList.test.tsx`.
Expected: FAIL, the import cannot be resolved.

- [ ] **Step 3: Implement `PostList`**

`components/PostList.tsx`:

```tsx
import Link from "next/link";
import { formatPostDate, type Post } from "@/lib/posts";
import styles from "./PostList.module.css";

type Props = { posts: Post[]; label: string; headingLevel: 2 | 3 };

export function PostList({ posts, label, headingLevel }: Props) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <ol className={styles.list} aria-label={label}>
      {posts.map((post) => (
        <li key={post.kind === "local" ? post.slug : post.url} className={styles.item}>
          <time className={styles.date} dateTime={post.date}>
            {formatPostDate(post.date)}
          </time>
          <Heading className={styles.title}>
            {post.kind === "local" ? (
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            ) : (
              <a href={post.url} target="_blank" rel="noopener noreferrer">
                {post.title}
                <span className={styles.source}> on {post.source}</span>
                <span aria-hidden="true"> ↗</span>
              </a>
            )}
          </Heading>
          <p className={styles.summary}>{post.summary}</p>
        </li>
      ))}
    </ol>
  );
}
```

`components/PostList.module.css`:

```css
.list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-rule);
}

.item {
  display: grid;
  grid-template-columns: minmax(7rem, 12rem) 1fr;
  gap: 0.5rem 2rem;
  padding: clamp(1.25rem, 3vw, 2.5rem) 0;
  border-bottom: 1px solid var(--color-rule);
}

.date {
  grid-row: span 2;
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
}

.title {
  font-size: var(--text-h3);
  font-weight: 800;
}

.title a {
  text-decoration: none;
}

.source {
  font-family: var(--font-body-stack);
  font-size: 0.6em;
  font-weight: 600;
  letter-spacing: 0;
  color: var(--color-muted);
}

.summary {
  max-width: var(--measure);
}

@media (max-width: 40rem) {
  .item {
    grid-template-columns: 1fr;
  }

  .date {
    grid-row: auto;
  }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run `npx vitest run components/PostList.test.tsx`.
Expected: PASS (5 tests).

- [ ] **Step 5: Write the failing smoke test**

Create `e2e/posts.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { LIGHT_BG, expectBodyBackground, expectNoHorizontalOverflow } from "./helpers";

test("posts index lists every entry newest first on the light theme", async ({ page }) => {
  const response = await page.goto("/posts");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Posts" })).toBeVisible();

  const list = page.getByRole("list", { name: "All posts" });
  await expect(list.getByRole("listitem")).not.toHaveCount(0);
  expect(await list.getByRole("listitem").count()).toBeGreaterThanOrEqual(11);

  const dates = await list.locator("time").evaluateAll((els) => els.map((el) => el.getAttribute("datetime") ?? ""));
  expect(dates).toEqual([...dates].sort().reverse());

  await expectBodyBackground(page, LIGHT_BG);
  await expectNoHorizontalOverflow(page);
});

test("external posts open off-site in a new tab", async ({ page }) => {
  await page.goto("/posts");
  const link = page.getByRole("link", { name: /JS illustrated: The event loop/ });
  await expect(link).toHaveAttribute("href", "https://dev.to/kapantzak/js-illustrated-the-event-loop-4mco");
  await expect(link).toHaveAttribute("target", "_blank");
});

test("posts is marked as the current page in the main nav", async ({ page }) => {
  await page.goto("/posts");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Posts" })).toHaveAttribute("aria-current", "page");
});
```

Run `npx playwright test e2e/posts.spec.ts`.
Expected: FAIL with a 404, because there is no `/posts` page yet.

- [ ] **Step 6: Implement the posts index page**

`app/posts/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";
import { PostList } from "@/components/PostList";
import { getAllPosts } from "@/lib/post-source";

export const metadata: Metadata = {
  title: "Posts",
  description: "Writing about frontend engineering.",
  alternates: { canonical: "/posts" },
};

export default async function PostsPage() {
  const posts = await getAllPosts();
  return (
    <PageMain accent="magenta" theme="light">
      <PageHeader eyebrow="03 / Writing" title="Posts" />
      <PostList posts={posts} label="All posts" headingLevel={2} />
    </PageMain>
  );
}
```

- [ ] **Step 7: Run the full gate and commit**

```bash
npm run lint && npm run typecheck && npm run test && npm run e2e
npm run format
git add components/PostList.tsx components/PostList.module.css components/PostList.test.tsx app/posts/page.tsx e2e/posts.spec.ts
git commit -m "Add posts index listing local and external articles"
```

---

### Task 9: Home page — latest writing and calls to action

**Files:**
- Modify: `app/page.tsx`, `e2e/home.spec.ts`
- Create: `app/page.module.css`

**Interfaces:**
- Consumes: `getAllPosts` (Task 7), `PostList` (Task 8), `Section`, `PageMain`, `PageHeader` (Task 5), `profile` (Task 4).
- Produces: nothing new.

- [ ] **Step 1: Add the failing smoke test**

Append to `e2e/home.spec.ts`:

```ts
test("home shows the three latest posts and links onward", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 2, name: "Latest writing" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Latest posts" }).getByRole("listitem")).toHaveCount(3);
  await page.getByRole("link", { name: "All posts" }).click();
  await expect(page).toHaveURL(/\/posts$/);
});
```

Run `npx playwright test e2e/home.spec.ts`.
Expected: the new test FAILS because the heading is not found.

- [ ] **Step 2: Implement the full Home page**

Replace `app/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";
import { PostList } from "@/components/PostList";
import { Section } from "@/components/Section";
import { profile } from "@/content/profile";
import { getAllPosts } from "@/lib/post-source";
import styles from "./page.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const latest = (await getAllPosts()).slice(0, 3);
  return (
    <PageMain accent="blue">
      <PageHeader eyebrow={`01 / ${profile.role}`} title={profile.headline} lead={profile.intro[0]} />
      <Section index="01" title="Latest writing">
        <PostList posts={latest} label="Latest posts" headingLevel={3} />
        <p className={styles.more}>
          <Link href="/posts">All posts</Link>
        </p>
      </Section>
      <Section index="02" title="Say hello">
        <p className={styles.ctas}>
          <Link href="/about">More about me</Link>
          <Link href="/contact">Get in touch</Link>
        </p>
      </Section>
    </PageMain>
  );
}
```

Create `app/page.module.css`:

```css
.more {
  font-weight: 700;
}

.ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 3rem;
  font-family: var(--font-display-stack);
  font-size: var(--text-h3);
  font-weight: 800;
}
```

- [ ] **Step 3: Run the full gate and commit**

```bash
npm run lint && npm run typecheck && npm run test && npm run e2e
npm run format
git add app/page.tsx app/page.module.css e2e/home.spec.ts
git commit -m "Show latest writing and calls to action on the home page"
```

---

### Task 10: About page and timeline

**Files:**
- Create: `components/Timeline.tsx`, `components/Timeline.module.css`, `components/Timeline.test.tsx`, `app/about/page.tsx`, `e2e/about.spec.ts`

**Interfaces:**
- Consumes: `Period`, `formatPeriod` (Task 4), `profile` (Task 4), `PageMain`, `PageHeader`, `Section`, `Prose` (Task 5).
- Produces:
  - `type TimelineEntry = { id: string; period: Period; title: string; org: string; orgUrl?: string; meta?: string; description?: string; link?: { label: string; url: string } }`
  - `<Timeline entries={TimelineEntry[]} />`

- [ ] **Step 1: Write the failing component test**

Create `components/Timeline.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline, type TimelineEntry } from "./Timeline";

const entries: TimelineEntry[] = [
  {
    id: "acme",
    period: { start: "Feb 2022" },
    title: "Engineer",
    org: "Acme",
    orgUrl: "https://acme.example/",
    meta: "React · Next.js",
  },
  {
    id: "uni",
    period: { start: "2015", end: "2018" },
    title: "MSc",
    org: "University",
    description: "Applied informatics.",
    link: { label: "Thesis", url: "https://uni.example/thesis.pdf" },
  },
];

describe("Timeline", () => {
  it("renders one item per entry with formatted periods", () => {
    render(<Timeline entries={entries} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Feb 2022 – Present")).toBeInTheDocument();
    expect(screen.getByText("2015 – 2018")).toBeInTheDocument();
  });

  it("links the organisation when a URL is given", () => {
    render(<Timeline entries={entries} />);
    expect(screen.getByRole("link", { name: "Acme" })).toHaveAttribute("href", "https://acme.example/");
    expect(screen.queryByRole("link", { name: "University" })).toBeNull();
    expect(screen.getByText("University")).toBeInTheDocument();
  });

  it("renders optional meta, description and link only when present", () => {
    render(<Timeline entries={entries} />);
    expect(screen.getByText("React · Next.js")).toBeInTheDocument();
    expect(screen.getByText("Applied informatics.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Thesis" })).toHaveAttribute("target", "_blank");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run `npx vitest run components/Timeline.test.tsx`.
Expected: FAIL, the import cannot be resolved.

- [ ] **Step 3: Implement `Timeline`**

`components/Timeline.tsx`:

```tsx
import { formatPeriod, type Period } from "@/lib/period";
import styles from "./Timeline.module.css";

export type TimelineEntry = {
  id: string;
  period: Period;
  title: string;
  org: string;
  orgUrl?: string;
  meta?: string;
  description?: string;
  link?: { label: string; url: string };
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className={styles.timeline}>
      {entries.map((entry) => (
        <li key={entry.id} className={styles.entry}>
          <p className={styles.period}>{formatPeriod(entry.period)}</p>
          <div className={styles.body}>
            <h3 className={styles.title}>{entry.title}</h3>
            <p className={styles.org}>
              {entry.orgUrl ? (
                <a href={entry.orgUrl} target="_blank" rel="noopener noreferrer">
                  {entry.org}
                </a>
              ) : (
                entry.org
              )}
            </p>
            {entry.meta ? <p className={styles.meta}>{entry.meta}</p> : null}
            {entry.description ? <p>{entry.description}</p> : null}
            {entry.link ? (
              <p>
                <a href={entry.link.url} target="_blank" rel="noopener noreferrer">
                  {entry.link.label}
                </a>
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
```

`components/Timeline.module.css`:

```css
.timeline {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-rule);
}

.entry {
  display: grid;
  grid-template-columns: minmax(8rem, 14rem) 1fr;
  gap: 0.5rem 2rem;
  padding: clamp(1.25rem, 3vw, 2.5rem) 0;
  border-bottom: 1px solid var(--color-rule);
}

.period {
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
}

.body {
  display: grid;
  gap: 0.35rem;
  max-width: var(--measure);
}

.title {
  font-size: var(--text-h3);
  font-weight: 800;
}

.org {
  font-weight: 600;
  color: var(--color-fg-strong);
}

.meta {
  color: var(--color-muted);
}

@media (max-width: 40rem) {
  .entry {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run `npx vitest run components/Timeline.test.tsx`.
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing smoke test**

Create `e2e/about.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { DARK_BG, expectBodyBackground, expectNoHorizontalOverflow } from "./helpers";

test("about shows intro, experience, education and community on the dark theme", async ({ page }) => {
  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible();
  for (const name of ["Experience", "Education", "Community"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Netdata" })).toBeVisible();
  await expect(page.getByText(/– Present$/).first()).toBeVisible();
  await expectBodyBackground(page, DARK_BG);
  await expectNoHorizontalOverflow(page);
});
```

Run `npx playwright test e2e/about.spec.ts`.
Expected: FAIL with a 404.

- [ ] **Step 6: Implement the About page**

`app/about/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";
import { Prose } from "@/components/Prose";
import { Section } from "@/components/Section";
import { Timeline, type TimelineEntry } from "@/components/Timeline";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "About",
  description: `${profile.role} based in Thessaloniki, Greece.`,
  alternates: { canonical: "/about" },
};

const experience: TimelineEntry[] = profile.experience.map((role) => ({
  id: `${role.org}-${role.period.start}`,
  period: role.period,
  title: role.title,
  org: role.org,
  orgUrl: role.orgUrl,
  meta: role.stack.length > 0 ? role.stack.join(" · ") : undefined,
}));

const education: TimelineEntry[] = profile.education.map((degree) => ({
  id: `${degree.institution}-${degree.period.start}`,
  period: degree.period,
  title: degree.degree,
  org: degree.institution,
  link: degree.thesis,
}));

const community: TimelineEntry[] = profile.community.map((entry) => ({
  id: `${entry.org}-${entry.period.start}`,
  period: entry.period,
  title: entry.title,
  org: entry.org,
  orgUrl: entry.orgUrl,
  description: entry.summary,
}));

export default function AboutPage() {
  return (
    <PageMain accent="lime">
      <PageHeader eyebrow="02 / About" title="About" />
      <Prose>
        {profile.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </Prose>
      <Section index="01" title="Experience">
        <Timeline entries={experience} />
      </Section>
      <Section index="02" title="Education">
        <Timeline entries={education} />
      </Section>
      <Section index="03" title="Community">
        <Timeline entries={community} />
      </Section>
    </PageMain>
  );
}
```

- [ ] **Step 7: Run the full gate and commit**

```bash
npm run lint && npm run typecheck && npm run test && npm run e2e
npm run format
git add components/Timeline.tsx components/Timeline.module.css components/Timeline.test.tsx app/about/page.tsx e2e/about.spec.ts
git commit -m "Add About page with experience, education and community timelines"
```

---

### Task 11: Contact page, 404 page, navigation smoke tests

**Files:**
- Create: `app/contact/page.tsx`, `app/contact/page.module.css`, `app/not-found.tsx`, `e2e/contact.spec.ts`, `e2e/navigation.spec.ts`

**Interfaces:**
- Consumes: `profile`, `PageMain`, `PageHeader`, `Section`, `NAV_ITEMS` (Tasks 4–5).
- Produces: nothing new.

- [ ] **Step 1: Write the failing smoke tests**

Create `e2e/contact.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { DARK_BG, expectBodyBackground, expectNoHorizontalOverflow } from "./helpers";

test("contact offers a mailto link and social links without overflow", async ({ page }) => {
  const response = await page.goto("/contact");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Say hello." })).toBeVisible();
  await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(1);
  await expect(page.getByRole("list", { name: "Elsewhere" }).getByRole("link")).not.toHaveCount(0);
  await expect(page.locator("main form")).toHaveCount(0);
  await expectBodyBackground(page, DARK_BG);
  await expectNoHorizontalOverflow(page);
});

test("an unknown route renders the 404 page", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Not found." })).toBeVisible();
  await page.getByRole("link", { name: "Back to the home page" }).click();
  await expect(page).toHaveURL(/\/$/);
});
```

Create `e2e/navigation.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

const ROUTES = [
  { label: "About", path: "/about", heading: "About" },
  { label: "Posts", path: "/posts", heading: "Posts" },
  { label: "Contact", path: "/contact", heading: "Say hello." },
  { label: "Home", path: "/", heading: "I build things for the web." },
];

test("every main-nav link reaches its page and marks it current", async ({ page }) => {
  await page.goto("/contact");
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const route of ROUTES) {
    await nav.getByRole("link", { name: route.label }).click();
    await expect(page).toHaveURL(new RegExp(`${route.path === "/" ? "/" : route.path}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.heading);
    await expect(nav.getByRole("link", { name: route.label })).toHaveAttribute("aria-current", "page");
  }
});

test("trailing-slash URLs from the old site resolve", async ({ page }) => {
  for (const path of ["/about/", "/posts/", "/contact/"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`${path.slice(0, -1)}$`));
  }
});
```

Run `npx playwright test e2e/contact.spec.ts e2e/navigation.spec.ts`.
Expected: FAIL. There is no `/contact` page, and the 404 heading is still Next's default.

- [ ] **Step 2: Implement the Contact page**

`app/contact/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";
import { Section } from "@/components/Section";
import { profile } from "@/content/profile";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to get in touch.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageMain accent="orange">
      <PageHeader eyebrow="04 / Contact" title="Say hello." lead="Email is the quickest way to reach me." />
      <p className={styles.email}>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </p>
      <Section index="01" title="Elsewhere">
        <ul className={styles.social} aria-label="Elsewhere">
          {profile.social.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="me noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </PageMain>
  );
}
```

`app/contact/page.module.css`:

```css
.email {
  font-family: var(--font-display-stack);
  font-size: var(--text-h2);
  font-weight: 800;
  line-height: 1.05;
  /* Long addresses must wrap rather than widen the page on phones. */
  overflow-wrap: anywhere;
}

.email a {
  color: var(--accent);
}

.social {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--text-h3);
  font-weight: 700;
}
```

- [ ] **Step 3: Implement the 404 page**

`app/not-found.tsx`:

```tsx
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";

export default function NotFound() {
  return (
    <PageMain accent="blue">
      <PageHeader eyebrow="404" title="Not found." lead="That page doesn't exist, or it has moved." />
      <p>
        <Link href="/">Back to the home page</Link>
      </p>
    </PageMain>
  );
}
```

- [ ] **Step 4: Run the full gate and commit**

```bash
npm run lint && npm run typecheck && npm run test && npm run e2e
npm run format
git add app/contact/page.tsx app/contact/page.module.css app/not-found.tsx e2e/contact.spec.ts e2e/navigation.spec.ts
git commit -m "Add Contact and 404 pages with full navigation smoke tests"
```

---

### Task 12: SEO and migration — sitemap, robots, icon, `/projects` redirect, service-worker kill switch

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/icon.tsx`, `public/sw.js`, `e2e/migration.spec.ts`
- Modify: `next.config.ts`
- Delete: `app/favicon.ico` (scaffold file, if present)

**Interfaces:**
- Consumes: `getAllPosts`, `LocalPost` (Tasks 6–7), `SITE_URL` (Task 5), `profile` (Task 4).
- Produces: nothing new.

- [ ] **Step 1: Write the failing smoke tests**

Create `e2e/migration.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("/projects permanently redirects to /about", async ({ request }) => {
  const response = await request.get("/projects", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers()["location"]).toMatch(/\/about$/);
});

test("the service-worker kill switch is served", async ({ request }) => {
  const response = await request.get("/sw.js");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("registration.unregister()");
});

test("sitemap lists the canonical routes", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  for (const path of ["", "/about", "/posts", "/contact"]) {
    expect(body).toContain(`<loc>https://kapantzakis.gr${path}</loc>`);
  }
});

test("robots.txt allows crawling and points to the sitemap", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).toContain("Allow: /");
  expect(body).toContain("Sitemap: https://kapantzakis.gr/sitemap.xml");
});

test("pages declare a canonical URL and an icon", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://kapantzakis.gr/about");
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute("href", /icon/);
});
```

Run `npx playwright test e2e/migration.spec.ts`.
Expected: FAIL. `/projects` returns 404, and `/sw.js`, `/sitemap.xml` and `/robots.txt` are missing.

- [ ] **Step 2: Add the redirect**

Replace `next.config.ts`:

```ts
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The old site's Projects section was folded into About.
    return [{ source: "/projects", destination: "/about", permanent: true }];
  },
};

// MDX files are imported by lib/post-source.ts, not routed, so pageExtensions stays default.
const withMDX = createMDX({});

export default withMDX(nextConfig);
```

- [ ] **Step 3: Add the service-worker kill switch**

Create `public/sw.js`:

```js
// The previous site registered a service worker at /sw.js. Browsers re-fetch this
// script on navigation, so serving this version retires it: clear its caches,
// unregister, and reload open tabs onto the network-served site.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })(),
  );
});
```

- [ ] **Step 4: Add the sitemap, robots and icon**

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/post-source";
import type { LocalPost, Post } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

const STATIC_PATHS = ["", "/about", "/posts", "/contact"];

function isLocal(post: Post): post is LocalPost {
  return post.kind === "local";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const localPosts = (await getAllPosts()).filter(isLocal);
  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...localPosts.map((post) => ({ url: `${SITE_URL}/posts/${post.slug}`, lastModified: post.date })),
  ];
}
```

`app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

`app/icon.tsx`. A text monogram is used because the spec gives no favicon artwork (spec §11.5).

```tsx
import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const monogram = profile.name
  .split(/\s+/)
  .map((word) => word[0] ?? "")
  .join("")
  .slice(0, 2)
  .toUpperCase();

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d12",
          color: "#c6ff3d",
          fontSize: 34,
          fontWeight: 800,
        }}
      >
        {monogram}
      </div>
    ),
    size,
  );
}
```

Delete the scaffold favicon so the generated icon is the only one: `rm -f app/favicon.ico`.

- [ ] **Step 5: Run the full gate**

```bash
npm run lint && npm run typecheck && npm run test && npm run e2e
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
npm run format
git add next.config.ts public/sw.js app/sitemap.ts app/robots.ts app/icon.tsx e2e/migration.spec.ts
git rm --cached --ignore-unmatch app/favicon.ico
git commit -m "Add sitemap, robots, icon, /projects redirect and service-worker kill switch"
```

---

### Task 13: Analytics, content review, README, deploy and domain cutover

**Files:**
- Modify: `app/layout.tsx`, `package.json`, `package-lock.json`, `README.md`, and possibly `content/profile.ts` / `content/external-posts.ts` from the content review

**Interfaces:**
- Consumes: everything above.
- Produces: the live site.

- [ ] **Step 1: Add Vercel Web Analytics**

```bash
npm install @vercel/analytics
```

In `app/layout.tsx`, add the import and render `<Analytics />` as the last child of `<body>`:

```tsx
import { Analytics } from "@vercel/analytics/next";
```

```tsx
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        {children}
        <Footer />
        <Analytics />
      </body>
```

Run `npm run lint && npm run typecheck && npm run test && npm run e2e`. Expected: PASS.

- [ ] **Step 2: Content review checkpoint (user)**

Run `npm run dev` and ask the user to review the following. **Stop until they approve.** Apply any requested copy changes and re-run `npm run test`.
- The About intro paragraphs in `content/profile.ts`
- All 11 summaries in `content/external-posts.ts`
- The Home and Contact copy

- [ ] **Step 3: Document the workflow in `README.md`**

Replace `README.md`:

````markdown
# kapantzakis.gr

Personal website. Next.js (App Router), deployed on Vercel.

## Development

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script                 | What it does                                                  |
|------------------------|---------------------------------------------------------------|
| `npm run lint`         | ESLint                                                        |
| `npm run typecheck`    | Generates Next.js types, then `tsc --noEmit`                  |
| `npm run test`         | Vitest unit tests                                             |
| `npm run e2e`          | Builds with drafts included, then runs Playwright smoke tests |
| `npm run format`       | Prettier                                                      |

Run all of `lint`, `typecheck`, `test` and `e2e` before merging.
To smoke-test a deployed site: `BASE_URL=https://kapantzakis.gr npm run e2e`.

## Content

- **Profile** (experience, education, links, email): `content/profile.ts`.
- **Articles published elsewhere**: add an entry to `content/external-posts.ts`.
- **A new post**: add `content/posts/<slug>.mdx`. The slug is lowercase kebab-case. Start the file with:

  ```mdx
  export const metadata = {
    title: "Post title",
    date: "2026-10-02",
    summary: "One sentence shown in post lists.",
  };
  ```

  Add `draft: true` to keep a post out of production builds. `INCLUDE_DRAFTS=1 npm run build` includes drafts locally.
  Invalid metadata fails the build with the file name in the error.
- `content/posts/draft-fixture.mdx` is a permanent draft used by the end-to-end tests. Do not delete it.
````

Commit:

```bash
npm run format
git add app/layout.tsx package.json package-lock.json README.md content/profile.ts content/external-posts.ts
git commit -m "Add Vercel Web Analytics and document the development and content workflow"
```

(Leave the content files out of `git add` if the review changed nothing.)

- [ ] **Step 4: Final quality gate**

```bash
npm run format:check && npm run lint && npm run typecheck && npm run test && npm run e2e && npm run build
```

Expected: all PASS. The `next build` route table shows every route as static (`○`) or SSG (`●`), and none as dynamic (`ƒ`).

- [ ] **Step 5: Open the pull request (user approves)**

Push the branch and open a PR into `main`, with a summary of the routes, the decisions table link and the test status. The user reviews and merges. The PR description carries no tool attribution.

- [ ] **Step 6: Vercel project setup (user, in the Vercel dashboard)**

1. **Add New → Project →** import `kapantzak/kapantzakis.gr`. The framework is auto-detected as Next.js, and no environment variables are needed.
2. **Settings → General → Node.js Version:** 24.x.
3. **Analytics → Enable Web Analytics.**
4. Open the preview deployment for the PR branch and run `BASE_URL=<preview URL> npm run e2e`. Expected: all PASS, with the draft-fixture test skipped. If Vercel Deployment Protection is enabled for previews (the default on new projects), either disable it for this check or run the smoke test against production only (Step 7.4).

- [ ] **Step 7: Domain cutover (user, after the PR is merged and production is deployed)**

1. Vercel **→ Settings → Domains:** add `kapantzakis.gr` and `www.kapantzakis.gr`, and set `www` to redirect to the apex.
2. At the domain registrar, create exactly the DNS records Vercel displays for each domain.
3. Wait until Vercel shows both domains as **Valid Configuration**, with the certificate issued automatically.
4. Run `BASE_URL=https://kapantzakis.gr npm run e2e`. Expected: all PASS, with the draft-fixture test skipped.
5. In a browser that visited the old site, open `https://kapantzakis.gr` twice, then check **DevTools → Application → Service workers**. Expected: no worker registered for the origin, and the new site is shown.
6. Keep the old hosting untouched for at least one week as a rollback path, then decommission it.

---

## Execution Log

Filled in after execution.

| Item                         | Value                                                                                                               |
|------------------------------|---------------------------------------------------------------------------------------------------------------------|
| TS fallback version (Task 1) | 5.9.3                                                                                                               |
| TS 7 gate result (Task 2)    | FAIL — typescript-eslint 8.71.0 supports TypeScript <6.1.0; 6.0.3 tried and adopted (newest that works, decision 9) |
| Display font (Task 3)        | Bricolage Grotesque                                                                                                 |
| `{{SITE_OWNER_NAME}}`        | provided by user; stored only in `content/profile.ts` (decision 19)                                                 |
| `{{CONTACT_EMAIL}}`          | kapantzak@gmail.com                                                                                                 |
| `{{NETDATA_TITLE}}`          | Senior software engineer                                                                                            |
| `{{NETDATA_START}}`          | Feb 2023                                                                                                            |
| `{{ADZUNA_END}}`             | Jan 2023                                                                                                            |
| `{{SKGJS_START}}`            | Apr 2025                                                                                                            |
| Twitter/X                    | dropped                                                                                                             |
| AUTh thesis link             | dropped                                                                                                             |
