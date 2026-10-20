# Google Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Vercel Web Analytics with Google Analytics 4, loaded only after the visitor accepts a site-built consent banner, plus a `/privacy` page.

**Architecture:** `lib/consent.ts` holds the visitor's choice (localStorage, 6 months) as a small external store; `lib/gtag.ts` loads the Google tag, sends page views and clears GA cookies. `components/PageAnalytics.tsx` keeps its counting rules and sends each counted view to GA while consent is granted. `components/ConsentBanner.tsx` and a footer "Cookie settings" button write and reopen the choice; `DetailSheet` leaves the banner usable. Everything GA-related renders only when `NEXT_PUBLIC_GA_ID` is set.

**Tech Stack:** Next.js 16.3.8 (App Router), React 19.3.0, TypeScript, CSS Modules, Vitest 5 + React Testing Library (jsdom), Playwright 1.63.

**Spec:** `docs/superpowers/specs/2026-10-02-personal-website-design.md`, section 32 and decisions 216–228.

## Global Constraints

- No new dependencies; `@vercel/analytics` is removed (decision 216).
- Nothing is requested from Google until the choice is `granted` (decision 218).
- GA ID comes only from `process.env.NEXT_PUBLIC_GA_ID`; without it: no tag, no banner, no Cookie settings button (decision 222). Production value: `G-3L6VP0EV5V`.
- Page view parameters: `page_location` and `page_title` only, no route (decision 217).
- Consent defaults: `analytics_storage: "granted"`, `ad_storage`, `ad_user_data`, `ad_personalization`: `"denied"`; config `{ send_page_view: false }`.
- Choice lifetime: 6 calendar months (decision 223).
- Accept and Reject buttons: same size, same class, same emphasis (decision 219).
- Banner copy: "This site uses Google Analytics cookies to see which pages are read, only if you accept." + link "Privacy" to `/privacy` + buttons "Accept", "Reject"; footer button "Cookie settings".
- Code comments explain why, cite decision numbers, as the codebase does. No owner name outside `content/profile.ts` (decision 19).
- Commit messages: plain imperative sentence, no prefixes, no tool attribution.

## Review Focus

1. Storage throws (Safari private mode, blocked site data): the banner still works, and an Accept applies for the page's life. Pinned in Task 1 (`blocked storage`).
2. A stored `granted` on page load must send exactly one view for the landing page, not two (hydration re-render plus the consent switch). Pinned in Task 2 (`one view on a load with consent granted`).
3. A sheet opened in the page after Accept: the view's title must be the sheet's title, not the home title (SheetHost sets it in an effect, decision 169). Pinned in Task 2 e2e (`page_title` of the sheet view).
4. Visitor opens a sheet while the banner shows: the banner stays clickable. Pinned in Task 3 (`banner opened before the sheet stays usable`).
5. Reject after Accept on `kapantzakis.gr`: `_ga` set by gtag on `.kapantzakis.gr` is deleted, not only a host-only cookie. Pinned in Task 1 (`clears cookies on every parent domain`).

---

## File map

| File | Change | Responsibility |
|---|---|---|
| `lib/consent.ts` (+ test) | Create | Choice store: read/write/expiry, Cookie settings "asking" flag, React hook, withdrawal |
| `lib/gtag.ts` (+ test) | Create | Load the tag once, send a page view, clear GA cookies, read the ID |
| `components/PageAnalytics.tsx` (+ test) | Rewrite | Counting rules (unchanged) → GA page views under consent |
| `lib/sheets.ts` (+ test) | Modify | `sheetRoutes` → `sheetPaths` |
| `app/layout.tsx` | Modify | Render analytics + banner only with an ID |
| `components/ConsentBanner.tsx`, `.module.css` (+ test) | Create | The bar |
| `components/CookieSettings.tsx` (+ test) | Create | Footer button reopening the bar |
| `components/Footer.tsx` | Modify | Privacy link, Cookie settings |
| `components/DetailSheet.tsx`, `.module.css` (+ test) | Modify | Skip the banner when making the page inert; room for the bar |
| `app/privacy/page.tsx`, `page.module.css` | Create | Privacy page |
| `app/sitemap.ts` | Modify | List `/privacy` |
| `e2e/fixtures.ts` | Create | Shared `test`: block Google, preset a choice |
| `e2e/*.spec.ts`, `e2e/helpers.ts` | Modify | Import `test` from fixtures; GA page views helper |
| `e2e/consent.spec.ts`, `e2e/privacy.spec.ts` | Create | Banner and privacy specs |
| `playwright.config.ts` | Modify | Placeholder ID for the e2e build |
| `package.json`, `package-lock.json` | Modify | Remove `@vercel/analytics` |
| `README.md` | Modify | `NEXT_PUBLIC_GA_ID` note |

---

### Task 1: Consent store and Google tag helpers

**Files:**
- Create: `lib/consent.ts`, `lib/consent.test.ts`, `lib/gtag.ts`, `lib/gtag.test.ts`

**Interfaces:**
- Produces (`lib/gtag.ts`):
  - `gaId(): string | undefined` — `process.env.NEXT_PUBLIC_GA_ID || undefined`, read on each call (Next inlines it at build).
  - `loadGtag(id: string): void` — idempotent (returns if `window.gtag` exists): defines `window.dataLayer`, `window.gtag` pushing `arguments` (gtag requires the Arguments object; disable `prefer-rest-params` on that line with a why-comment if lint flags it), then `consent default` (Global Constraints), `js`, `config(id, { send_page_view: false })`, then appends one `<script async src="https://www.googletagmanager.com/gtag/js?id=<id>">` to `<head>`.
  - `sendPageView(path: string): void` — `window.gtag?.("event", "page_view", { page_location: new URL(path + location.search, location.origin).href, page_title: document.title })`.
  - `cookieDomains(hostname: string): string[]` — the hostname and each parent with at least two labels, longest first.
  - `clearGaCookies(id: string): void` — expires `_ga` and `_ga_<id without "G-">` with `path=/`, once host-only and once with `domain=` each of `cookieDomains(location.hostname)`.
  - `declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } }`.
- Produces (`lib/consent.ts`):
  - `type Consent = "granted" | "denied"`; `CONSENT_KEY = "consent"`; stored value `JSON.stringify({ choice, at })`, `at` in ms.
  - `readConsent(now = Date.now()): Consent | null` — in-memory choice first, else storage; invalid JSON, unknown choice or `now >= at + 6 calendar months` (`Date#setMonth(+6)`) → `null`; storage throwing → `null`.
  - `writeConsent(choice: Consent, now = Date.now()): void` — keeps it in memory, tries storage, clears `asking`, notifies.
  - `openConsentSettings(): void` — sets `asking`, notifies.
  - `withdrawConsent(id: string, reload = () => window.location.reload()): void` — `writeConsent("denied")`, `clearGaCookies(id)`, `reload()` (decision 225).
  - `useConsent(): { choice: Consent | null; asking: boolean } | null` — `useSyncExternalStore`; `null` on the server and during hydration; cached snapshots so identity changes only when `choice` or `asking` does.
  - `resetConsentStore(): void` — clears memory and `asking`, for tests.

- [ ] **Step 1: Write the failing tests**

`lib/consent.test.ts` (`afterEach`: `localStorage.clear()`, `resetConsentStore()`, `vi.restoreAllMocks()`):
- `no choice when nothing is stored` → `readConsent()` is `null`.
- `remembers a choice for 6 months (decision 223)` → `writeConsent("granted", Date.UTC(2026, 0, 15))`, `resetConsentStore()`; `readConsent(Date.UTC(2026, 6, 14))` is `"granted"`; `readConsent(Date.UTC(2026, 6, 15))` is `null`.
- `ignores a malformed entry` → `localStorage.setItem("consent", "{")` and `'{"choice":"maybe","at":0}'` → `null`.
- `blocked storage` → `vi.spyOn(Storage.prototype, "getItem")` and `setItem` throw; `readConsent()` is `null`; after `writeConsent("granted")`, `readConsent()` is `"granted"`.
- `Cookie settings reopens the choice` → `renderHook(useConsent)` after `writeConsent("denied")` shows `{ choice: "denied", asking: false }`; `act(openConsentSettings)` → `asking: true`; `act(() => writeConsent("granted"))` → `{ choice: "granted", asking: false }`.
- `withdrawing clears cookies and reloads (decision 225)` → `document.cookie = "_ga=x; path=/"`, `"_ga_3L6VP0EV5V=y; path=/"`; `const reload = vi.fn()`; `withdrawConsent("G-3L6VP0EV5V", reload)`; `document.cookie` contains neither name; `readConsent()` is `"denied"`; `reload` called once.

`lib/gtag.test.ts` (`afterEach`: delete `window.dataLayer`, `window.gtag`, remove head scripts, `vi.unstubAllEnvs()`):
- `reads the ID from NEXT_PUBLIC_GA_ID` → stubbed `"G-TEST"` → `"G-TEST"`; stubbed `""` → `undefined`.
- `loads the tag once with consent defaults and no automatic page view` → `loadGtag("G-TEST")` twice; `document.head.querySelectorAll('script[src="https://www.googletagmanager.com/gtag/js?id=G-TEST"]')` has length 1; `dataLayer` entries (as arrays) equal `[["consent","default",{analytics_storage:"granted",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"}], ["js", expect.any(Date)], ["config","G-TEST",{send_page_view:false}]]`.
- `sends a page view with the path and the tab title` → `document.title = "Netdata — X"`; `loadGtag`, `sendPageView("/experience/netdata")`; last entry `["event","page_view",{page_location:"http://localhost:3000/experience/netdata", page_title:"Netdata — X"}]`.
- `sends nothing before the tag is loaded` → `sendPageView("/")` leaves `window.dataLayer` undefined.
- `clears cookies on every parent domain` → `cookieDomains("www.kapantzakis.gr")` equals `["www.kapantzakis.gr", "kapantzakis.gr"]`; `cookieDomains("kapantzakis.gr")` equals `["kapantzakis.gr"]`; `cookieDomains("localhost")` equals `[]`. With `vi.spyOn(document, "cookie", "set")`, `clearGaCookies("G-TEST")` on jsdom's `localhost` writes exactly two expiries, one for `_ga` and one for `_ga_TEST`, both with `path=/` and an `expires` in 1970.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run lib/consent.test.ts lib/gtag.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `lib/gtag.ts` and `lib/consent.ts`** to the Interfaces above (`cookieDomains` exported from `lib/gtag.ts`).

- [ ] **Step 4: Run them to verify they pass**

Run: `npx vitest run lib/consent.test.ts lib/gtag.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/consent.ts lib/consent.test.ts lib/gtag.ts lib/gtag.test.ts
git commit -m "Add a consent store and Google tag helpers for analytics behind consent"
```

---

### Task 2: Page views to GA, Vercel Analytics removed

**Files:**
- Modify: `components/PageAnalytics.tsx`, `components/PageAnalytics.test.tsx`, `lib/sheets.ts:79-84`, `lib/sheets.test.ts:92-102`, `app/layout.tsx`, `package.json`, `package-lock.json`, `playwright.config.ts`, `e2e/helpers.ts:51-58`, `e2e/sheet-routes.spec.ts`, `e2e/section-routes.spec.ts`, every other `e2e/*.spec.ts` (import only)
- Create: `e2e/fixtures.ts`

**Interfaces:**
- Consumes: `gaId`, `loadGtag`, `sendPageView` (Task 1); `useConsent`, `writeConsent`, `CONSENT_KEY` (Task 1).
- Produces:
  - `sheetPaths(source: Profile): string[]` in `lib/sheets.ts` (replaces `sheetRoutes`).
  - `PageAnalytics({ gaId, sheetPaths }: { gaId: string; sheetPaths: string[] })`.
  - `e2e/fixtures.ts`: `test` extended with option `consent: "granted" | "denied" | null` (default `"denied"`) and an overridden `page` that aborts every request to `googletagmanager.com` and `google-analytics.com`, and, when `consent` is set, adds an init script that writes `{ choice: consent, at: Date.now() }` under `CONSENT_KEY` only if the key is absent; re-exports `expect`.
  - `e2e/helpers.ts`: `pageviews(page): Promise<string[]>` — paths (`new URL(page_location).pathname`) of `["event","page_view",…]` entries in `window.dataLayer`; `pageviewTitles(page): Promise<string[]>`; `analyticsEnabled(page): Promise<boolean>` — a "Cookie settings" button exists (Task 3 adds it; until then this task's specs use `test.use({ consent: "granted" })` and do not skip).

- [ ] **Step 1: Rewrite the unit tests** in `components/PageAnalytics.test.tsx`
  - Render `<PageAnalytics gaId="G-TEST" sheetPaths={["/experience/netdata", "/education/msc-applied-informatics"]} />`; `pageviews()` maps `dataLayer` page-view entries to `new URL(page_location).pathname`; `afterEach` also clears `localStorage`, `resetConsentStore()`, `window.dataLayer`, `window.gtag`.
  - Keep the six counting scenarios with `writeConsent("granted")` before render; expected values become paths, e.g. `["/", "/experience/netdata", "/experience/netdata"]`; the 404 scenario expects `["/nope", "/writing"]`; the `/blog/hello` one `["/blog/hello", "/"]`.
  - `one view on a load with consent granted` → granted, render at `/` → exactly `["/"]`, and one gtag script in `<head>`.
  - `nothing before consent` → no choice, visit `/` then NETDATA → `window.dataLayer` undefined and no script in `<head>`.
  - `Accept counts the page in view and restarts the count (decision 224)` → no choice, `/` → NETDATA; `act(() => writeConsent("granted"))` → `["/experience/netdata"]`; then `/` → `["/experience/netdata", "/"]`.
  - `nothing after Reject` → `writeConsent("denied")`, visit `/`, NETDATA → `dataLayer` undefined.
  - Delete the `NEXT_PUBLIC_VERCEL_OBSERVABILITY_*` settings test.

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run components/PageAnalytics.test.tsx`
Expected: FAIL (props and `dataLayer` assertions).

- [ ] **Step 3: Implement**
  - `PageAnalytics`: keep `track` and the render-time adjustment; `View` becomes `string | null` (the path); drop `computeRoute`, `useParams` and the `Analytics` element; render `null`. Track `granted = useConsent()?.choice === "granted"` in state; when it turns true, replace the tracked state with `track(null, path, onSheet)` (decision 224). An effect on `[tracked, granted]`: when granted, `loadGtag(gaId)` and, if `tracked.view`, `sendPageView(tracked.view)`; keep a ref of the last sent `tracked` object so React's dev double-run effects never resend. Update the component comment: why it exists now (counting rules, decisions 172, 180, 217), not the Vercel history.
  - `lib/sheets.ts`: `sheetPaths` returns `sheetsOf(source).map((s) => s.path)`; update its test to `toEqual(sheetsOf(profile).map((s) => s.path))`.
  - `app/layout.tsx`: `const id = gaId();` render `{id && <PageAnalytics gaId={id} sheetPaths={sheetPaths(profile)} />}` where `PageAnalytics` is today.
  - `npm uninstall @vercel/analytics`.
  - `playwright.config.ts`: webServer command becomes `NEXT_PUBLIC_GA_ID=G-E2ETEST000 npm run build && npm run start -- --port ${PORT}`, with a comment: a placeholder so the tag's code paths run; the fixture blocks every Google request.
  - `e2e/fixtures.ts` and the helpers as in Interfaces; every spec imports `{ expect, test }` from `./fixtures`.
  - `e2e/sheet-routes.spec.ts` and `e2e/section-routes.spec.ts` analytics tests: `test.use({ consent: "granted" })` in their describe/blocks; expected values become paths, e.g. `["/", "/experience/netdata", "/experience/adzuna", "/experience/adzuna"]` and `["/education/msc-applied-informatics", "/", "/experience/netdata"]`; the first sheet-routes test also asserts `pageviewTitles(page)` ends with the Adzuna sheet's tab title (`pageTitle("Adzuna")`).

- [ ] **Step 4: Run to verify**

Run: `npx vitest run && npm run typecheck && npm run lint`
Expected: PASS, and `grep -rn "@vercel/analytics" app components lib e2e package.json` prints nothing.

Run: `npm run e2e`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/PageAnalytics.tsx components/PageAnalytics.test.tsx lib/sheets.ts lib/sheets.test.ts app/layout.tsx package.json package-lock.json playwright.config.ts e2e/
git commit -m "Send page views to Google Analytics once a visitor consents, in place of Vercel Web Analytics"
```

---

### Task 3: Consent banner, Cookie settings and the sheet

**Files:**
- Create: `components/ConsentBanner.tsx`, `components/ConsentBanner.module.css`, `components/ConsentBanner.test.tsx`, `components/CookieSettings.tsx`, `components/CookieSettings.test.tsx`, `e2e/consent.spec.ts`
- Modify: `app/layout.tsx`, `components/Footer.tsx`, `components/DetailSheet.tsx:41-53,73-89`, `components/DetailSheet.module.css`, `components/DetailSheet.test.tsx`, `e2e/helpers.ts`

**Interfaces:**
- Consumes: `useConsent`, `writeConsent`, `openConsentSettings`, `withdrawConsent` (Task 1); `analyticsEnabled` helper and fixtures (Task 2).
- Produces:
  - `ConsentBanner({ gaId }: { gaId: string })` — rendered by the layout after `PageAnalytics`, only with an ID. Shows when `useConsent()` is non-null and (`choice === null` or `asking`). Markup: `<section aria-label="Cookie consent" data-consent-banner tabIndex={-1}>` containing the copy, `<Link href="/privacy">Privacy</Link>`, and two `<button type="button">` "Accept" / "Reject" sharing one class. Accept → `writeConsent("granted")`. Reject → `withdrawConsent(gaId)` if the choice was `granted`, else `writeConsent("denied")`. When shown because of `asking`, focus the section.
  - While shown: `document.documentElement` gets `data-consent-open` and `--consent-height` (the bar's height, kept current with `ResizeObserver` when available); both removed when hidden.
  - CSS: `position: fixed; inset: auto 0 0 0; z-index: 40` (above the sheet's 30, with a comment), site tokens (`--color-surface`, `--color-rule`, `--gutter`), wraps on phones.
  - `CookieSettings()` — client button "Cookie settings", styled with the footer's `backToTop` class, calls `openConsentSettings`.
  - `Footer`: in `.end`, before the copyright: a `Privacy` link (`/privacy`) and, when `gaId()` is set, `<CookieSettings />`.
  - `DetailSheet`: `outsideOf(...)` results skip elements with `data-consent-banner`; `.sheet` gets `padding-bottom: var(--consent-height, 0px)` under `:global(html[data-consent-open])`.

- [ ] **Step 1: Write the failing tests**

`components/ConsentBanner.test.tsx` (reset as in Task 2):
- `asks on a first visit` → region "Cookie consent", link "Privacy" with `href="/privacy"`, buttons "Accept" and "Reject" with the same `className`.
- `Accept stores granted and hides` → click; `readConsent()` is `"granted"`; region gone; `data-consent-open` absent on `<html>`.
- `Reject stores denied and hides` → `readConsent()` is `"denied"`.
- `stays hidden once chosen` → `writeConsent("denied")` before render → no region.
- `Reject after Accept withdraws (decision 225)` → `vi.mock("@/lib/consent", …)` keeping the real module but spying `withdrawConsent`; `writeConsent("granted")`, `act(openConsentSettings)`, click Reject → `withdrawConsent` called with `"G-TEST"`.
- `reopened by Cookie settings, with focus` → choice set, `act(openConsentSettings)` → region shown and focused.

`components/CookieSettings.test.tsx`:
- `reopens the banner` → render `CookieSettings` and `ConsentBanner` after `writeConsent("denied")`; click "Cookie settings" → region shown.

`components/DetailSheet.test.tsx`:
- `banner opened before the sheet stays usable (decision 228)` → append `<section data-consent-banner>` to `<body>` before rendering the sheet; it has no `inert` attribute while a sibling `<div>` does.

`e2e/consent.spec.ts` (`test.use({ consent: null })`; each test first `test.skip(!(await analyticsEnabled(page)), "no GA ID on this deployment")` after its `goto`):
- `a first visit asks, and Reject loads nothing from Google` → record `page.on("request")` URLs; banner visible; click Reject; banner gone; reload; banner still gone; no recorded URL contains `googletagmanager.com` or `google-analytics.com`.
- `Accept requests the tag and counts the page in view` → `page.waitForRequest(/googletagmanager\.com\/gtag\/js\?id=/)` on Accept; `pageviews(page)` equals `["/"]`.
- `Cookie settings reopens the banner, and Reject after Accept clears GA cookies` → Accept; `context.addCookies` `_ga` and `_ga_E2ETEST000` for the base URL; footer "Cookie settings"; Reject; wait for the reload's `load`; neither cookie in `context.cookies()`; `pageviews(page)` is `[]`.
- `the banner is usable over a sheet loaded by URL, and the sheet's end clears it (decision 228)` → `goto("/experience/netdata")`; before clicking, scroll the sheet (`role="dialog"`) to its bottom and assert the bottom of its last content element (`boundingBox`) is at or above the banner's top; then clicking Accept succeeds and the banner disappears.
- `the banner is usable over a sheet opened in the page` → `goto("/")`, open Netdata, click Reject; banner gone.
- `Tab from the sheet reaches the banner` → sheet open by URL, press Tab until the focused element is inside `[data-consent-banner]` (at most 30 presses).

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run components/ConsentBanner.test.tsx components/CookieSettings.test.tsx components/DetailSheet.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement** to the Interfaces; layout renders `<ConsentBanner gaId={id} />` beside `PageAnalytics`.

- [ ] **Step 4: Run to verify**

Run: `npx vitest run && npm run typecheck && npm run lint && npm run e2e`
Expected: PASS. Then look at the bar on desktop and Pixel 7 in `npm run build && NEXT_PUBLIC_GA_ID=G-E2ETEST000 npm run start` — screenshots of `/` and `/experience/netdata` for the user's review.

- [ ] **Step 5: Commit**

```bash
git add components/ConsentBanner.tsx components/ConsentBanner.module.css components/ConsentBanner.test.tsx components/CookieSettings.tsx components/CookieSettings.test.tsx components/Footer.tsx components/DetailSheet.tsx components/DetailSheet.module.css components/DetailSheet.test.tsx app/layout.tsx e2e/consent.spec.ts e2e/helpers.ts
git commit -m "Ask for analytics consent with a cookie banner that stays usable over a detail sheet"
```

---

### Task 4: Privacy page

**Files:**
- Create: `app/privacy/page.tsx`, `app/privacy/page.module.css`, `e2e/privacy.spec.ts`
- Modify: `app/sitemap.ts`, `e2e/migration.spec.ts:23-32`

**Interfaces:**
- Consumes: `PageMain`, `profile` (`name`, `email`), `SITE_URL`.
- Produces: route `/privacy`, `metadata = { title: "Privacy", description: "How this site uses Google Analytics and cookies, and your choices.", alternates: { canonical: "/privacy" } }`.

- [ ] **Step 1: Write the failing tests**
- `e2e/privacy.spec.ts`: `/privacy` returns 200; `h1` "Privacy"; title `pageTitle("Privacy")`; canonical `https://kapantzakis.gr/privacy`; it contains a `mailto:` link to `profile.email`; no horizontal overflow on both projects; the footer's "Privacy" link from `/` reaches it.
- `e2e/migration.spec.ts`: sitemap `<loc>` count `2 + SHEET_PAGES.length` and contains `<loc>https://kapantzakis.gr/privacy</loc>`; rename the test to include the privacy page.

- [ ] **Step 2: Run to verify they fail**

Run: `npx playwright test e2e/privacy.spec.ts e2e/migration.spec.ts --project=desktop`
Expected: FAIL (404, sitemap count).

- [ ] **Step 3: Implement**
  - Page in `PageMain`, header styled like the 404's (eyebrow, title), prose capped at `--measure`. Sections, in order: Who runs this site (name, `mailto:`); What is collected (Google Analytics 4 only after Accept; cookies `_ga` and `_ga_<ID>`, up to 2 years, set by gtag; pages viewed, outbound clicks, approximate location, device and browser; GA does not log IP addresses); Why (consent; refusing changes nothing on the site); Changing your mind (Cookie settings in the footer; withdrawal deletes the cookies); How long (GA keeps the data 14 months); Who else sees it (Google as processor; data may be transferred to the US under the EU–US Data Privacy Framework); Your rights (access, rectification, erasure, restriction, objection, portability; complaint to the Hellenic Data Protection Authority, `https://www.dpa.gr`); "Last updated" with the merge date.
  - Before drafting the cookie-lifetime and IP sentences, confirm them against Google's current documentation and cite the URLs in the PR description.
  - `app/sitemap.ts`: add `{ url: \`${SITE_URL}/privacy\` }` after the home entry; update the comment (decisions 168, 221).

- [ ] **Step 4: Run to verify**

Run: `npx playwright test e2e/privacy.spec.ts e2e/migration.spec.ts`
Expected: PASS.

- [ ] **Step 5: User review gate** — show the user the rendered page text and the banner screenshots from Task 3; apply their changes; record "privacy and banner copy approved by the user on <date>" in section 32 of the spec.

- [ ] **Step 6: Commit**

```bash
git add app/privacy app/sitemap.ts e2e/privacy.spec.ts e2e/migration.spec.ts docs/superpowers/specs/2026-10-02-personal-website-design.md
git commit -m "Add a privacy page covering Google Analytics and cookies"
```

---

### Task 5: Docs and the full gate

**Files:**
- Modify: `README.md`, `docs/superpowers/specs/2026-10-02-personal-website-design.md` (only if implementation facts differ)

- [ ] **Step 1:** `README.md`: under Development, one line that analytics and the banner run only when `NEXT_PUBLIC_GA_ID` is set (Production only on Vercel), and that `npm run e2e` builds with a placeholder ID and blocks Google.
- [ ] **Step 2: Full gate**

Run: `npm run format:check && npm run lint && npm run typecheck && npm run test && npm run e2e && npm run build`
Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add README.md docs/superpowers/specs/2026-10-02-personal-website-design.md
git commit -m "Document the Google Analytics environment variable"
```

- [ ] **Step 4: Hand the user the actions in section 32** (GA Admin settings; `NEXT_PUBLIC_GA_ID` for Production before merge; turn off Vercel Web Analytics after) and, after the deploy, run the checks: `curl -s "https://www.googletagmanager.com/gtag/js?id=G-3L6VP0EV5V" | grep -o '"vtp_historyEvents":[a-z]*'` prints `false`; `BASE_URL=https://kapantzakis.gr npm run e2e` passes; a first visit shows the banner and Accept appears in GA Realtime.
