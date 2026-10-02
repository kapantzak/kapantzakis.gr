# Personal Website — Design Spec

- **Date:** 2026-10-02
- **Status:** Approved by user 2026-10-02
- **Inputs:** `docs/initial-notes.md`, `docs/linkedin.md`, the current site at https://kapantzakis.gr/

## 1. Purpose and success criteria

Replace the current single-page site at kapantzakis.gr with a multi-page personal website built on Next.js (App Router) and deployed to Vercel.

The site is done when:

1. The routes `/`, `/about`, `/posts`, `/posts/[slug]` and `/contact` are statically generated and deployed on Vercel.
2. The site follows the visual direction in section 4: dark base, big bold headings, vivid heading colours, light contrast pages, full-width layout.
3. Page changes are plain route navigations with no scroll-driven section movement, no custom cursor and no page-transition animations.
4. Every page ships no client-side JavaScript beyond what Next.js needs, plus the analytics script.
5. Old URLs keep working: `/about`, `/posts` and `/contact` exist, and `/projects` redirects to `/about`.
6. The old site's service worker is retired, so returning visitors get the new site.
7. Lint, type-check, unit tests (Vitest) and smoke tests (Playwright) all pass.

## 2. Decisions

The user approved all decisions on 2026-10-02: 1–14 in the first round, 15–16 in the second, 17–19 at plan review, 20–21 after the first PR review, 22–25 for the Home hero backdrop, 26–29 for the logo.

| #  | Topic                   | Decision                                                                                                  |
|----|-------------------------|-----------------------------------------------------------------------------------------------------------|
| 1  | Posts source            | MDX files in the repo, plus "external" entries that link to articles published elsewhere                  |
| 2  | Contact                 | `mailto:` link and social links only, with no form and no backend                                         |
| 3  | Styling                 | CSS Modules plus CSS custom properties (design tokens), with no CSS framework                             |
| 4  | Fonts                   | Two variable fonts via `next/font`: a bold display font for headings and a neutral body font              |
| 5  | Colour scheme           | Dark by default; selected pages or blocks switch to a light background; vivid heading accents             |
| 6  | Layout width            | Full-width layout and headings; running text capped at a reading width of about 70ch                      |
| 7  | Navigation              | Simple top bar with 4 links and no menu animation                                                         |
| 8  | Package manager         | npm                                                                                                       |
| 9  | TypeScript              | Try TS 7 first; keep it only if `next build`, type-check and ESLint all pass, otherwise use the newest TS that works |
| 10 | Lint / format           | ESLint flat config with `eslint-config-next`, plus Prettier                                               |
| 11 | Testing                 | Vitest with React Testing Library, plus Playwright smoke tests                                            |
| 12 | Old "Projects" section  | Dropped; `/projects` permanently redirects to `/about`                                                    |
| 13 | About content           | Drafted from the current site and LinkedIn, then reviewed and completed by the user                       |
| 14 | Analytics               | Vercel Web Analytics (`@vercel/analytics`)                                                                |
| 15 | MDX pipeline            | `@next/mdx`; each post exports `metadata`; external entries live in a typed TS file                       |
| 16 | Light pages             | `/posts` and `/posts/[slug]` use the light theme; all other routes stay dark                              |
| 17 | Post-page test coverage | Optional `draft: true` post flag; a permanent draft fixture is built only when `INCLUDE_DRAFTS=1` (e2e)    |
| 18 | Cache Components        | Off; routes use classic static generation                                                                 |
| 19 | Owner's name in code    | Allowed in `content/profile.ts` only; everything else reads `profile.name`                               |
| 20 | Sticky nav              | Top bar sticks to the top on screens wider than 640px (40rem); on phones it scrolls away normally         |
| 21 | Sticky bar look         | Solid page background (follows the light/dark theme) with a thin bottom rule; no blur or translucency     |
| 22 | Hero backdrop scope     | Ambient animation behind the Home headline area only; every other page stays still                        |
| 23 | Hero backdrop effect    | Floating outlined code glyphs in the display font, slow transform-only drift; CSS only, no JavaScript     |
| 24 | Pausing (WCAG 2.2.2)    | CSS-only "Pause motion" toggle in the hero, plus the existing reduced-motion support                       |
| 25 | Hero backdrop on phones | Same effect with fewer glyphs (7 instead of 12)                                                           |
| 26 | Logo rendering          | The user's "refined" JK logo PNG used as-is (white serif JK on a black square tile)                       |
| 27 | Logo size               | 40px in the nav on desktop, 32px on phones                                                                |
| 28 | Site icon               | The same logo replaces the generated monogram: `favicon.ico`, a 512px icon and a 192px Apple touch icon    |
| 29 | Logo link               | Logo sits inside the existing name link before the name; the image is decorative (`alt=""`)              |

## 3. Scope

### In scope

- The five routes listed in section 1, plus a custom 404 page.
- A design system: tokens, fluid type scale, layout primitives, light and dark themes.
- A posts content pipeline: local MDX posts, external entries, and a merged list sorted by date.
- Page metadata (title and description), `sitemap.xml`, `robots.txt` and a canonical URL.
- The `/projects` redirect and the service-worker kill switch.
- Vercel Web Analytics.
- Tooling: TypeScript, ESLint, Prettier, Vitest, Playwright, and npm scripts for each.
- Vercel project setup and a written checklist for the domain cutover. The user changes DNS.

### Out of scope (opportunities for later)

- Contact form.
- RSS feed.
- Generated Open Graph images.
- Dark/light toggle.
- CMS.
- Search, tags and pagination. There are about 11 entries today.
- Migrating the full text of the dev.to articles into MDX.

## 4. Visual design

### 4.1 Principles (from the user's notes)

- Typography first: big, bold headings; normal-size body text.
- Fast: no page-transition animations, no scroll-linked motion, no custom cursor and no loader screen. The current site has one, and the new one drops it.
- Motion is limited to short colour or underline transitions on hover and focus, and is disabled under `prefers-reduced-motion: reduce`.
- One exception (decisions 22–25): the Home hero has an ambient backdrop of faint, outlined code glyphs that drift slowly. It animates `transform` only, uses no JavaScript, can be paused with a CSS-only toggle, and is still under `prefers-reduced-motion: reduce`.
- Full-width composition instead of a centred 1200px container.

### 4.2 Colour

- **Dark theme (default):** near-black or deep-blue background, light grey text, white primary headings.
- **Light theme:** white or off-white background, near-black text, used for the reading routes (decision 16).
- **Accents:** a small set of vivid hues for headings and links, for example electric blue, magenta and lime. Each route may set its own accent. The current site's `#3b00eb` and `#d602dd` are candidates and give continuity.
- **Contrast:** every text and accent pairing must meet WCAG 2.2 AA (4.5:1 for body text, 3:1 for large text). Vivid accents are used for large headings only, unless they also pass 4.5:1.

### 4.3 Typography

- Two variable fonts, self-hosted at build time by `next/font`, with no request to Google Fonts at runtime.
- Display font candidates: Bricolage Grotesque, Space Grotesk, Inter Tight, Archivo. The user picks one after a side-by-side comparison, which is step 1 of the build plan.
- Body font: Inter or a similar neutral sans-serif.
- Fluid type scale using `clamp()`. Display headings scale up to roughly 12–15vw on wide screens. Body text stays 16–18px.

### 4.4 Layout

- Full-bleed page grid with gutters that scale with the viewport. There is no max-width container.
- Prose (post bodies, About paragraphs) is capped at `max-width: 70ch`. Headings and lists are not.
- Numbered sections (for example `01 /`) used as a typographic device. This is the idea taken from the rafaelkurosawa.com inspiration.

### 4.5 Navigation

- A top bar with the logo and site name on the left and links on the right: Home, About, Posts, Contact. The logo and name form one link to Home (decisions 26–29).
- On screens wider than 640px the bar is sticky (`position: sticky`, CSS only), with a solid theme background and a thin bottom rule (decisions 20–21). On phones it scrolls away, keeping the full screen for reading.
- While the bar is sticky, in-page anchors and focused elements scroll into view below it (`scroll-padding-top`), and the skip link renders above it.
- The active route is marked visually and with `aria-current="page"`.
- On mobile the four links wrap or shrink. There is no hamburger menu and no JavaScript.
- Footer with social links.

## 5. Pages

| Route           | Theme | Content                                                                                                     |
|-----------------|-------|-------------------------------------------------------------------------------------------------------------|
| `/`             | dark  | Large headline ("I build things for the web."), a one-paragraph intro, the 3 latest posts, links to About and Contact |
| `/about`        | dark  | Intro, experience timeline, education with thesis links, community work (SKG JS co-organiser)                |
| `/posts`        | light | All entries sorted newest first; external entries marked with their source and open in a new tab            |
| `/posts/[slug]` | light | Title, date, MDX body at reading width; local posts only                                                     |
| `/contact`      | dark  | Large "say hello" heading, `mailto:` link, social links                                                      |
| 404             | dark  | Large "Not found" heading and a link home                                                                    |

## 6. Architecture

### 6.1 Rendering

- All routes are server components and statically generated at build time.
- `/posts/[slug]` uses `generateStaticParams` with `dynamicParams = false`, so unknown slugs return 404.
- The only client component is the active-link marker in the nav, because it needs `usePathname`. Everything else ships no component JavaScript.

### 6.2 Proposed source layout

```
app/
  layout.tsx            # fonts, theme root, nav, footer, analytics
  page.tsx              # Home
  about/page.tsx
  posts/page.tsx
  posts/[slug]/page.tsx
  contact/page.tsx
  not-found.tsx
  sitemap.ts
  robots.ts
components/             # Nav, Footer, PostList, Timeline, ... (each with a .module.css)
content/
  posts/*.mdx           # local posts; each exports `metadata`
  external-posts.ts     # typed list of articles published elsewhere
  profile.ts            # typed data: experience, education, community, social links, email
lib/
  posts.ts              # loads, validates, merges and sorts post entries
styles/
  tokens.css            # colours, type scale, spacing
  globals.css
public/
  sw.js                 # service-worker kill switch (section 7)
mdx-components.tsx      # required by @next/mdx
e2e/                    # Playwright smoke tests
```

### 6.3 Content model

- **Local post:** `content/posts/<slug>.mdx`. The slug is the file name. Each file exports `metadata = { title, date, summary, draft? }`, with `date` as an ISO `YYYY-MM-DD` string. Drafts (`draft: true`) are left out of builds unless `INCLUDE_DRAFTS=1` (decision 17).
- **External post:** an entry in `content/external-posts.ts` with `{ title, date, summary, url, source }`, for example `source: "DEV"`.
- **`lib/posts.ts`:** returns one merged list, sorted by date with newest first, using a discriminated union (`kind: "local" | "external"`). It fails the build on missing or invalid fields or duplicate slugs. That way bad content cannot reach production silently.
- **Profile data:** `content/profile.ts` holds experience, education, community, social links and the email address as typed data. The pages render from it, so updating the CV means editing one file.

### 6.4 Initial content

- **External posts:** the 10 dev.to articles (2019–2020) and the Scalable Path article "TypeScript or Flow: which is better?". Dates and URLs come from the dev.to API, plus the Scalable Path link on the current site.
- **Local posts:** none at launch. A permanent draft fixture (`content/posts/draft-fixture.mdx`) exercises the MDX pipeline in end-to-end tests and never ships to production (decision 17).
- **Experience:**
  - Netdata: current. Title and start date are needed from the user, because the public LinkedIn view hides them.
  - Adzuna: Senior Frontend Developer, Feb 2022 – end date needed from the user.
  - Skroutz: Software Engineer, Jun 2020 – Jan 2022.
  - EpsilonNet: Web Developer, Sep 2014 – May 2020.
  - Hobbyist web developer, 2008–2014.
- **Education:**
  - University of Macedonia, MSc Applied Informatics, 2015–2018, with thesis link.
  - Aristotle University, MSc Informatics and Management, 2008–2010, with thesis link.
  - Aristotle University, BSc Economic Science, 2001–2006.
- **Community:** SKG JS co-organiser, about March 2025 – present.
- **Social links:**
  - LinkedIn, GitHub, DEV, Stack Overflow and GitLab, taken from the current site.
  - Twitter/X (`gianniskap`): keep or drop is for the user to confirm.

## 7. Migration from the current site

- **Redirect:** `/projects` → `/about` with a permanent redirect, set in `next.config` under `redirects()`.
- **Service worker:** the current site registers `/sw.js`. Without a replacement, returning visitors may keep getting the cached old site.
  - The new site serves `public/sw.js` as a kill switch: on install it calls `skipWaiting()`, and on activate it unregisters itself and reloads open windows.
  - Browsers check the registered worker's script for updates on navigation, so the kill switch reaches returning visitors on their next visit.
  - The new site never registers a service worker.
- **Old analytics:** the Universal Analytics tag (`UA-149950347-1`) is not carried over.
- **Domain cutover:** a checklist in the plan. Add the domain in Vercel, update DNS at the registrar, confirm HTTPS, then smoke-test production. The user changes DNS.

## 8. Testing

- **Vitest + React Testing Library (jsdom):**
  - `lib/posts.ts`: merging, sorting, validation errors and duplicate slugs.
  - Presentational components: `PostList` marks external entries, `Timeline` renders profile data, and the nav sets `aria-current`.
  - Async server components are not unit-tested. Vitest does not support them (stated in the Next.js testing docs), so the smoke tests cover them.
- **Playwright smoke tests (Chromium only), against `next build && next start`:**
  - Every route returns 200 and renders its main heading.
  - Each nav link reaches the right page.
  - `/projects` redirects to `/about`.
  - An unknown `/posts/x` returns 404.
  - External post links point off-site.
  - `/sw.js` is served.
- **Quality gate before any merge:** `lint`, `typecheck`, `test`, `build` and `e2e` all pass.

## 9. Tooling

- Next.js 16 (App Router, Turbopack default) and React 19. Exact versions are pinned at scaffold time.
- TypeScript under the rule in decision 9. The fallback is recorded in the plan if TS 7 fails.
- ESLint flat config (`eslint.config.mjs`) with `eslint-config-next`. Prettier with `eslint-config-prettier` so the two don't conflict.
- npm scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `test`, `e2e`.

## 10. Risks

| Risk                                                                 | Mitigation                                                                  |
|----------------------------------------------------------------------|-----------------------------------------------------------------------------|
| TS 7 is incompatible with Next.js type-check or typescript-eslint    | Decision 9 gate in the first plan step; fall back to the newest working TS  |
| Vivid accents fail contrast on dark or light backgrounds             | Contrast check on all token pairs; vivid colours limited to large headings  |
| Huge display type overflows on narrow screens (long Greek or English words) | `clamp()` bounds, `overflow-wrap`, Playwright run at a mobile viewport |
| The old service worker keeps serving the old site                    | Kill-switch `sw.js` (section 7)                                             |
| About content is out of date                                         | User review before launch; missing facts listed in section 11               |

## 11. Inputs required from the user

1. Netdata job title and start date, and the Adzuna end date.
2. The public contact email address for the `mailto:` link.
3. Display font choice, made at the side-by-side comparison.
4. Keep or drop Twitter/X, and any other links to add, for example SKG JS.
5. Optional: a portrait image. The favicon is now the user's own logo (decision 28).

## 12. Repository notes

- `docs/linkedin.md` contains other people's names and profile links, from LinkedIn's "similar profiles" section and a recommendation. This repository is public, so that file should stay out of version control or be trimmed before it is committed.
