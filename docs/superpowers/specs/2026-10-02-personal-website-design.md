# Personal Website — Design Spec

- **Date:** 2026-10-02
- **Status:** Approved by user 2026-10-02; one-page refactor approved 2026-10-06 (section 13); detail sheet approved 2026-10-06 (section 14)

> The site is now a single page. Where sections 1–8 describe the original multi-page site and conflict with section 13, section 13 wins.
- **Inputs:** `docs/initial-notes.md`, `docs/linkedin.md`, the current site at https://kapantzakis.gr/

## 1. Purpose and success criteria

Replace the current single-page site at kapantzakis.gr with a multi-page personal website built on Next.js (App Router) and deployed to Vercel.

The site is done when:

1. The routes `/`, `/about`, `/posts`, `/posts/[slug]` and `/contact` are statically generated and deployed on Vercel.
2. The site follows the visual direction in section 4: dark base, big bold headings, vivid heading colours, light contrast pages, full-width layout.
3. Page changes are plain route navigations with no scroll-driven section movement, no custom cursor and no page-transition animations.
4. Every page ships no client-side JavaScript beyond what Next.js needs, plus the analytics script. *Amended by 218:* the analytics script is the Google tag, loaded only after a visitor accepts the consent banner.
5. Old URLs keep working: `/about`, `/posts` and `/contact` exist, and `/projects` redirects to `/about`.
6. The old site's service worker is retired, so returning visitors get the new site.
7. Lint, type-check, unit tests (Vitest) and smoke tests (Playwright) all pass.

## 2. Decisions

The user approved all decisions on 2026-10-02: 1–14 in the first round, 15–16 in the second, 17–19 at plan review, 20–21 after the first PR review, 22–25 for the Home hero backdrop, 26–29 for the logo, 30–40 for the one-page refactor on 2026-10-06, 41–47 for the detail sheet on 2026-10-06, 48–54 for the brand header on 2026-10-06, 55–59 for the brand visual on 2026-10-06, 60–62 for its perspective on 2026-10-06, 63–65 for the Adzuna brand on 2026-10-06, 66 for the Skroutz brand on 2026-10-06, 67–69 for its revision and brand link colours on 2026-10-07, 70 for the visual's full height on 2026-10-07, 71–72 for the EpsilonNet brand on 2026-10-07, 73–74 for the display font on 2026-10-08, 75–76 for the uppercase hero headline on 2026-10-08, 77 for removing the hero backdrop on 2026-10-08, 78–81 for the hero aurora on 2026-10-08, 82–85 for its revision on 2026-10-08, 86 for the Firefox heading fallback on 2026-10-08, and 94–98 for scrolling back to the top on 2026-10-09. Rows marked *superseded* are kept for history.

| #  | Topic                   | Decision                                                                                                  |
|----|-------------------------|-----------------------------------------------------------------------------------------------------------|
| 1  | Posts source            | *Superseded by 35.* MDX files in the repo, plus "external" entries that link to articles published elsewhere |
| 2  | Contact                 | `mailto:` link and social links only, with no form and no backend                                         |
| 3  | Styling                 | CSS Modules plus CSS custom properties (design tokens), with no CSS framework                             |
| 4  | Fonts                   | *Superseded by 37.* Two variable fonts via `next/font`: a bold display font for headings and a neutral body font |
| 5  | Colour scheme           | Dark by default; selected pages or blocks switch to a light background; vivid heading accents             |
| 6  | Layout width            | Full-width layout and headings; running text capped at a reading width of about 70ch                      |
| 7  | Navigation              | *Superseded by 40.* Simple top bar with 4 links and no menu animation |
| 8  | Package manager         | npm                                                                                                       |
| 9  | TypeScript              | Try TS 7 first; keep it only if `next build`, type-check and ESLint all pass, otherwise use the newest TS that works |
| 10 | Lint / format           | ESLint flat config with `eslint-config-next`, plus Prettier                                               |
| 11 | Testing                 | Vitest with React Testing Library, plus Playwright smoke tests                                            |
| 12 | Old "Projects" section  | *Superseded by 31.* Dropped; `/projects` permanently redirects to `/about` |
| 13 | About content           | Drafted from the current site and LinkedIn, then reviewed and completed by the user                       |
| 14 | Analytics               | *Superseded by 216.* Vercel Web Analytics (`@vercel/analytics`)                                           |
| 15 | MDX pipeline            | *Superseded by 35.* `@next/mdx`; each post exports `metadata`; external entries live in a typed TS file |
| 16 | Light pages             | *Superseded by 38.* `/posts` and `/posts/[slug]` use the light theme; all other routes stay dark |
| 17 | Post-page test coverage | *Superseded by 35.* Optional `draft: true` post flag; a permanent draft fixture is built only when `INCLUDE_DRAFTS=1` (e2e) |
| 18 | Cache Components        | Off; routes use classic static generation                                                                 |
| 19 | Owner's name in code    | Allowed in `content/profile.ts` only; everything else reads `profile.name`. *Amended by 231:* also in `cv/content.json`, read as `cv.name` |
| 20 | Sticky nav              | Top bar sticks to the top on screens wider than 640px (40rem); on phones it scrolls away normally         |
| 21 | Sticky bar look         | Solid page background (follows the light/dark theme) with a thin bottom rule; no blur or translucency     |
| 22 | Hero backdrop scope     | *Superseded by 39.* Ambient animation behind the Home headline area only; every other page stays still |
| 23 | Hero backdrop effect    | *Superseded by 77.* Floating outlined code glyphs in the display font, slow transform-only drift; CSS only, no JavaScript     |
| 24 | Pausing (WCAG 2.2.2)    | *Superseded by 77.* CSS-only "Pause motion" toggle in the hero, plus the existing reduced-motion support                       |
| 25 | Hero backdrop on phones | *Superseded by 77.* Same effect with fewer glyphs (7 instead of 12)                                                           |
| 26 | Logo rendering          | The user's "refined" JK logo PNG used as-is (white serif JK on a black square tile)                       |
| 27 | Logo size               | 40px in the nav on desktop, 32px on phones                                                                |
| 28 | Site icon               | The same logo replaces the generated monogram: `favicon.ico`, a 512px icon and a 192px Apple touch icon    |
| 29 | Logo link               | Logo sits inside the existing name link before the name; the image is decorative (`alt=""`)              |
| 30 | One-page site           | `/` holds everything, read by scrolling: hero, experience, writing, contact                               |
| 31 | Old routes              | *Sitemap superseded by 168; `/contact` by 173.* `/about`, `/posts`, `/contact` removed (404); the `/projects` redirect removed; the sitemap lists `/` only |
| 32 | Education and community | Expandable rows inside the Experience section, under their own subheadings                               |
| 33 | Experience details      | *Superseded by 41.* Big rows that expand with an animation; the panel shows existing facts plus a placeholder for rich content to be designed later |
| 34 | Posts                   | Every post as a tile with a hover animation; every tile opens the article in a new tab                    |
| 35 | Local posts             | None will be published here: MDX pipeline, `/posts/[slug]`, drafts and the draft fixture removed          |
| 36 | Obsolete files          | Deleted (routes, `Timeline`, `PageHeader`, `Prose`, their tests and the route-specific e2e specs)          |
| 37 | Display font            | *Superseded by 73.* BBH Hegarty (single weight, 400) for headings; Inter stays for body text                                   |
| 38 | Colour                  | Dark only (except the detail sheet, decision 44); two vivid accents (lime, magenta); the Writing section uses a full-bleed lime background; blue, orange and the light theme removed |
| 39 | Motion                  | *Amended by 86 (section headings).* Scroll-driven CSS animations (`animation-timeline`) as progressive enhancement; browsers without support show static content; all motion off under `prefers-reduced-motion` |
| 40 | Navigation              | In-page links (Experience, Writing, Contact); the section in view is marked with `aria-current="true"`; a scroll-progress bar sits on the top edge |
| 41 | Detail sheet scope      | Every Experience row (work, education, community) opens a full-page detail sheet instead of expanding in place |
| 42 | Detail sheet technique  | *Portal superseded by 163.* Custom modal overlay (`role="dialog"`, `aria-modal`), portalled to `<body>`; the rest of the page is `inert` and does not scroll while it is open |
| 43 | Detail sheet motion     | The sheet grows out of the clicked row to fill the screen, then its content rises in; closing shrinks it back into the row; a short fade under `prefers-reduced-motion` |
| 44 | Detail sheet colour     | Warm off-white `#f7f6f2` with near-black text and a darker muted grey; lime and magenta are used only as fills behind dark text, never as text on the sheet; a branded entry adds a dark band at the top (decision 49) |
| 45 | Detail sheet content    | Real period, title and subtitle, the existing facts (stack, links, summary), then placeholder blocks long enough to scroll |
| 46 | Back button             | *Superseded by 161.* Opening the sheet adds a history entry, so Back closes it; there is no shareable deep link |
| 47 | Closing                 | A close button that stays in view while scrolling, plus Escape and Back; focus returns to the row that opened the sheet |
| 48 | Brand header scope      | Optional per-entry `brand` (logo, background, accent) in `content/profile.ts`; only Netdata has one for now |
| 49 | Brand band              | A full-width band in the brand background at the top of the sheet, reaching behind the close bar; Netdata uses `#020503` and its official logo, copied unchanged from netdata.cloud; the content below stays on paper; a light band uses the paper tokens instead (decision 64) |
| 50 | Brand title             | The logo replaces the visible title text, inside the `h2` with the org name as `alt`, so the dialog keeps its accessible name; a brand with a lockup shows its name as text beside the logo instead (decision 92) |
| 51 | Brand accent (sheet)    | The brand accent replaces `--accent` on the sheet, so it grows out of the brand colour and the close button fills with it on hover; Netdata uses `#00ab44` |
| 52 | Close button ring       | A 2px white ring on the close button of every sheet, so it stays visible on dark bands and on paper |
| 53 | Brand accent (row)      | A branded row wipes in its brand accent on hover, focus and while its sheet is open, so the sheet grows out of the same colour |
| 54 | Facts in the header     | The facts line (stack pills, website link, thesis, summary) is part of the sheet header on every sheet, so on a branded sheet it sits on the band; every entry is expected to get a brand eventually |
| 55 | Brand visual            | Optional `brand.visual` image per company; Netdata uses the dashboard screenshot from the netdata.cloud hero, copied unchanged |
| 56 | Visual placement (wide) | *Superseded by 60.* From 48rem up, the visual covers the right half of the band from top to bottom, cropped as needed and anchored top-left, fading in from the middle; the header stays in the left half |
| 57 | Visual on phones        | Below 48rem, the visual is a full-width strip at the bottom of the band, fading in from its top |
| 58 | Visual glow             | None: the image only, without netdata.cloud's green glow |
| 59 | Visual semantics        | Decorative: empty `alt` and hidden from assistive technology; the logo already names the company |
| 60 | Visual perspective      | From 48rem up, the visual is a large screen tilted in perspective, its right side nearer the viewer; it starts in the middle of the band with its top edge visible, runs off the band's bottom and right edge, and fades in from the middle; the header keeps the left half; the same for every brand, so a brand visual should be a landscape, screen-like image (about 16:9) |
| 61 | Visual tilt angle       | `rotateY(-20deg)` around the screen's left edge, with a soft shadow |
| 62 | Visual on phones (tilt) | No tilt on phones: the strip under the text stays flat (decision 57) |
| 63 | Adzuna brand            | White band, the official green logo from the adzuna.co.uk header (copied unchanged), `#279b37` as the accent (both checked on the live site), and a screenshot of the adzuna.co.uk first screen as the visual, with the same fade and perspective |
| 64 | Band tone               | Each brand declares `tone: "light" \| "dark"`; a dark band keeps the dark page's text tokens, a light band uses the sheet's paper tokens |
| 65 | Light band edge         | A light band ends in a 1px rule in the paper rule colour, so it stays distinct from the off-white sheet |
| 66 | Skroutz brand           | *Superseded by 67.* White band, the orange logo from the skroutz.gr header (copied unchanged), `#f68b24` as the accent (both checked on the live site), and the user-chosen promo image from Skroutz's blog CDN as the visual, with the same fade and perspective; a homepage screenshot was ruled out because the signed-in page is personalised |
| 67 | Skroutz brand (revised) | Orange `#f68b24` band with dark text (`tone: "light"`), the official wordmark recoloured white without the hat, and the user's signed-out skroutz.gr screenshot as the visual, with the same fade and perspective; `#f68b24` stays the accent for the row, the grow and the close button |
| 68 | Brand link colour       | Each brand stores a `link` colour that fills its website link on the band, separate from the accent; Netdata `#00ab44`, Adzuna `#279b37`, Skroutz `#ffb800` (from skroutz.gr's primary scale) |
| 69 | Light band muted text   | On light bands the muted text (the date) uses the sheet's body grey `#2a2e37`, so it keeps 4.5:1 on coloured backgrounds such as orange |
| 70 | Visual full height      | The tilted visual starts at the band's top edge instead of 12% down, so it fills the band's full height; its nearer right side rises above the band and is clipped, and the slanted top edge of decision 60 is no longer visible |
| 71 | EpsilonNet brand        | White band (`tone: "light"`) with the EpsilonNet logo, `#f04e23` (the logo's orange-red and the site header's rule) as both accent and link colour, and a screenshot of the epsilonnet.gr first screen (first hero slide) as the visual, with the same fade and perspective |
| 72 | EpsilonNet logo vector  | epsilonnet.gr publishes the logo only as a 500×95 PNG, so the SVG is traced from it with potrace (two colour layers, `#231f20` and `#f04e23`); rendered at 500×95 it differs from the PNG by a mean of 0.71/255 per channel; an official vector replaces it when available |
| 73 | Display font            | Momo Trust Display (single weight, 400) replaces BBH Hegarty everywhere the display font is used (headings, nav brand, eyebrows, hero cue, backdrop glyphs, row titles, contact email); Inter stays for body text |
| 74 | Contact email size      | The email's fluid font size is retuned to Momo Trust Display's letter widths, so the address still fits one line at any width |
| 75 | Hero headline case      | Uppercase through CSS `text-transform`; the source text, the meta description and the accessible name stay in sentence case |
| 76 | Hero headline size      | Sized to the available width (`(100vw - 2 * var(--gutter)) / 8.2`, between 2.25rem and 13rem), so the longest uppercase line (about 7.9em in Momo Trust Display) never overflows, down to 320px |
| 77 | Hero backdrop removed   | The drifting glyph backdrop and its "Pause motion" toggle are removed; the aurora of decisions 78–85 replaces it |
| 78 | Hero aurora             | Soft aurora glows behind the Home hero only; the layer bleeds to the viewport edges, scrolls away with the hero and fades out at its top and bottom edges; the desktop nav stays solid (decision 21) |
| 79 | Aurora colours          | *Superseded by 82.* Classic aurora hues mixed into the page background: green `#2bf5a0` at 12% (`#0f2923`), teal `#22d3ee` at 12% (`#0e252c`) and violet `#8b5cf6` at 20% (`#251d40`); the glows blend with `lighten` over the page background, so no point is brighter than their per-channel maximum (`#252940`), and every page text colour keeps 4.5:1 against that worst case (unit-tested) |
| 80 | Aurora motion           | *Superseded by 84.* Endless, transform-only drift with no pause control; only `prefers-reduced-motion: reduce` stops it. The user accepted the WCAG 2.2.2 (Pause, Stop, Hide) risk |
| 81 | Aurora cursor reaction  | *Superseded by 85.* On mouse devices (`hover: hover` and `pointer: fine`) the aurora leans toward the pointer while it is over the hero and eases back when it leaves; a small client component writes two CSS variables at most once per frame; off under reduced motion; touch devices get the drift only |
| 82 | Aurora brightness       | Glows about 3.5× brighter: green `#2bf5a0` at 30% (`#15533d`), teal `#22d3ee` at 30% (`#124854`) and violet `#8b5cf6` at 40% (`#3e2d6d`), blended with `lighten` over the page background, so no point is brighter than `#3e536d`; the hero's grey text (second intro paragraph, scroll cue) uses `--color-fg`, and every hero text colour (`--color-fg-strong`, `--color-fg`, lime) keeps 4.5:1 against that worst case (unit-tested; e2e checks the hero uses no other text colour) |
| 83 | Aurora shape            | Four long, thin, tilted curtains (two green, one teal, one violet), bright along their lower edge and fading upward and at both ends, instead of round glows |
| 84 | Aurora motion           | Endless, transform-only sway: each curtain slides along its length, skews and stretches in 8–14s loops, so motion is visible within 1–2s; no pause control, and only `prefers-reduced-motion: reduce` stops it. The user accepted the WCAG 2.2.2 (Pause, Stop, Hide) risk |
| 85 | Aurora cursor reaction  | On mouse devices (`hover: hover` and `pointer: fine`) the curtains lean toward the pointer while it is anywhere over the aurora (gutters included), each by a different depth up to 10vw, and ease back when it leaves; a small client component writes two CSS variables at most once per frame; off under reduced motion; touch devices get the sway only |
| 86 | Heading slide fallback  | Where CSS scroll-driven animations are unsupported (Firefox stable), a small client script reports each section heading's progress through the viewport (the `cover` range) as `--slide-progress`, at most once per frame, and CSS maps it to the same slide as the native animation; it never runs where the native animation works, and is off under `prefers-reduced-motion: reduce`; the other scroll-driven effects stay static there (decision 39) |
| 87 | Community brands        | Community entries take the same optional `brand` as work roles, rendered by the same row wipe and sheet band (decisions 48–54) |
| 88 | SKG JS brand            | Dark band in skgjs.gr's `js-black` `#1a1a1a` (`tone: "dark"`), with skgjs.gr's `js-yellow` `#f7dd3e` as both accent and link colour, mirroring the skgjs.gr hero; the logo's own yellow `#f7dd3d` differs by one unit |
| 89 | SKG JS logo and visual  | The official square logo tile from skgjs.gr, copied unchanged and sized by the shared logo height rule; a screenshot of the skgjs.gr first screen as the visual, with the same fade and perspective |
| 90 | SKG JS website          | The SKG JS entry links to the official site `https://skgjs.gr/` instead of its LinkedIn page |
| 91 | Community name          | The community entry is named "Thessaloniki JavaScript Meetup" (row title and sheet name) instead of "SKG JS"; the hero intro reads "I co-organise the Thessaloniki JavaScript Meetup (SKG JS), …" |
| 92 | Brand lockup            | Optional `brand.lockup`: the name as two lines of text set beside a symbol-only logo, inside the sheet's `h2`; the two lines together roughly match the logo's height, and the logo's `alt` is empty, so the text alone names the dialog; brands without a lockup are unchanged; Thessaloniki JavaScript Meetup uses "Thessaloniki" / "JavaScript Meetup" |
| 93 | Lockup colours          | The first line takes the band's strong text colour and the second the brand accent, as in the skgjs.gr hero (white, then yellow); a brand with a lockup must keep 4.5:1 between its accent and its band background (unit-tested) |
| 94 | Logo link scroll        | *URL amended by 174.* On the home page the logo-and-name link scrolls to the top on every click and drops any `#section` from the URL; on other pages it navigates to `/`; its `href` stays `/` |
| 95 | Back-to-top link        | A quiet "Back to top ↑" text control in the footer beside the © line, styled like the footer links |
| 96 | Back-to-top technique   | *URL amended by 174.* A button that shares the logo link's scroll-to-top behaviour: smooth through the existing CSS `scroll-behavior`, instant under `prefers-reduced-motion`, and the URL stays clean |
| 97 | Back-to-top focus       | After scrolling up, focus moves to the logo link without scrolling again, so the next Tab continues from the top |
| 98 | Back-to-top scope       | Shown on the home page only; the 404 page does not scroll |
| 99 | Role story              | Optional `Role.story` in `content/profile.ts`: intro paragraphs, each with a label, and a list of contributions (title, body, screenshot, tint); one shared component renders it in the sheet body; Netdata is the first role with a story |
| 100 | Sheets without a story  | Entries without a story keep the "Coming soon" placeholder blocks (decision 45) |
| 101 | Story intro             | Two columns from 48rem up, each a small heading ("Netdata", "My role") over its paragraph; stacked on phones |
| 102 | Contribution visual     | From 48rem up, each contribution is a full-bleed panel with a screenshot in one half, tilted in perspective with its outer side nearer the viewer, running off the panel's outer edge and fading out towards the text; the text keeps the other half; the left-side screenshot mirrors the brand band's visual (`rotateY(20deg)` around its right edge) |
| 103 | Contribution sides      | Screenshots alternate sides: odd contributions on the left (mirrored, decision 102), even contributions on the right with the brand band's orientation (decisions 60, 61) |
| 104 | Contribution tints      | Each contribution has its own light tint, in greens, teals and nearby hues, chosen so neighbouring panels differ; the panels keep the sheet's paper text tokens, and every tint must keep 4.5:1 for them (unit-tested); Netdata: `#dff3e4`, `#d7eeee`, `#e9f3d6`, `#d6eaf2`, `#e2f1dd`, `#d9efe7`, `#eef0d8`, `#dae7f0`, `#e0f2ea` |
| 105 | Contribution screenshots | *Superseded by 108.* Until real screenshots exist, every Netdata contribution shows the brand band's dashboard screenshot; the screenshots are decorative (empty `alt`, hidden from assistive technology), since the text carries the content |
| 106 | Contributions on phones | Below 48rem, the screenshot is a flat, full-width strip under the text, fading in from its top, as in the brand band (decisions 57, 62) |
| 107 | Contribution motion     | Where CSS scroll-driven animations are supported, each panel's text rises in and its screenshot turns from a steeper angle into its final tilt as the panel enters the sheet's view; static in Firefox and under `prefers-reduced-motion: reduce` |
| 108 | Real screenshots         | Each Netdata contribution shows the user's own screenshot of the matching Netdata Cloud feature (about 16:9, captured at about 1714×964), stored as quality-90 WebP under `assets/stories/netdata/`; still decorative (empty `alt`, hidden from assistive technology); the Dynamic configuration screenshot has its workspace name and node picker blurred, because they name a colleague and their machine; the CI screenshot is cropped below GitHub's header, which shows the private repository's name and its issue, pull request and security counts |
| 109 | CI runtime claim         | The developer productivity text says the reported CI runtime dropped "by about 60%" instead of quoting minutes, so it agrees with the 15m 20s total run in its screenshot |
| 110 | Skroutz story            | Skroutz is the second role with a story: a "Skroutz" / "My role" intro and four contributions, the merchant platform first, then the two Hotwire Turbo pull requests (#327, #367) and their recognition in the Turbo 7 release |
| 111 | Contribution links       | Optional `Contribution.links`: a list of labelled links under the panel's text, as plain underlined links with a trailing ↗ that open in a new tab (`noopener noreferrer`); panels without links are unchanged |
| 112 | Skroutz tints            | Light warm tints near the brand orange, in panel order: `#fde8d2`, `#fdf0cc`, `#fbe2d6`, `#f5ead6`; the paper text tokens keep 4.5:1 on each (decision 104) |
| 113 | Public screenshots       | The Turbo panels show screenshots of public pages: the "Conversation" tab of each pull request on GitHub, in its light theme, and the Turbo 7 announcement at its frame events paragraph; they show the pages as they are today, cropped for framing only |
| 114 | Illustrated dashboard    | No screenshots of the real merchant panel exist, so its contribution shows a generated, generic merchant dashboard: orders, payouts and KPI tiles with made-up figures in euros, in warm colours, with no Skroutz logo or name, so it does not pass for the real product |
| 115 | Skroutz images           | Captured at 1714×964 and stored as quality-90 WebP under `assets/stories/skroutz/`; decorative, as in decision 108; the dashboard keeps its KPI tiles at the top left, so they survive the phones' 5:2 strip, which is anchored there (decision 106) |
| 116 | Skroutz copy             | The draft's engineering practices section is folded into "My role" as one sentence; its role and dates heading is dropped, since the sheet header already shows both; the Turbo 7 thanks is described as shared with another contributor, who is not named (changed from naming Sean Doyle on 2026-10-22) |
| 117 | Adzuna story             | Adzuna is the third role with a story: an "Adzuna" / "My role" intro and three contributions: the product built from zero, its charts and maps, and exploring the data; the team's collaboration is told in "My role" rather than in a panel of its own |
| 118 | Product name             | The copy calls the product "Labour Market Intelligence", as the user knew it; Adzuna markets it today as "Adzuna Intelligence", so its link is labelled "The product on adzuna.co.uk" instead of by either name |
| 119 | Shipping claim           | The first panel says the team shipped the product in less than a year; the user confirmed it reached release within their time at Adzuna (Feb 2022 – Jan 2023), although Adzuna's public marketing pages for it date from March 2023 |
| 120 | Adzuna copy              | Written only from the user's own account and Adzuna's public pages, with no claims about libraries or individual ownership; the intro quotes Adzuna's current public figures (more than 15 million jobseekers a month, 20 countries) |
| 121 | Adzuna tints             | Light greens near the brand green, in panel order: `#e4f2e0`, `#edf4dc`, `#ddeee6`; the paper text tokens keep 4.5:1 on each (decision 104) |
| 122 | Adzuna images            | The first panel shows Adzuna's public product screenshot (the platform page's laptop image), cut from its laptop frame to 16:9 above the chart legend; the other two show generated, generic illustrations (a hex-tile regional map with line and bar charts, and a filtered search with grouping, KPI tiles, a location table and a salary histogram) with made-up figures marked "Illustrative figures", no Adzuna logo or name, and a slate sidebar instead of Adzuna's green, so they do not pass for the real product |
| 123 | Adzuna image format      | 1714×964, quality-90 WebP under `assets/stories/adzuna/`; decorative, as in decision 108; each keeps its search bar and filters at the top left, so they survive the phones' 5:2 strip (decision 106) |
| 124 | Hash follows scroll      | *Superseded by 174.* On the home page the URL hash names the section marked current in the nav (decision 40), so scrolling updates it like a nav click; the current history entry is replaced, never a new one pushed |
| 125 | Hash with no section     | *Superseded by 174.* When no section is current (the hero, the footer, a gap between sections) the hash is dropped, so Back to top still leaves a clean URL (decision 96) |
| 126 | Hash during nav glide    | Updates are not paused while a nav click glides to its section, so the hash briefly names the sections passed and settles on the target |
| 127 | EpsilonNet story         | *Superseded by 138.* EpsilonNet is the fourth role with a story: an "EpsilonNet" / "My role" intro, one contribution panel about Epsilon ESS, then a timeline of the user's path from junior web designer to full stack developer |
| 128 | Role timeline            | Optional `Story.timeline`: a heading and an ordered list of stages, each with a title, a body and tags; `Story.contributions` becomes optional, so a story can have panels, a timeline or both; the existing stories are unchanged |
| 129 | Timeline order           | The contributions come first and the timeline last; the panels meet the sheet's bottom edge only when they close the sheet, and the timeline otherwise keeps the sheet's bottom padding |
| 130 | Timeline layout          | One column at every width: a rail down the left with a dot per stage, in the brand accent (fills only, decision 44); each stage shows its title, body and tags; stages are ordered, with no dates; the heading reads "From web designer to full stack developer" |
| 131 | Stage tags               | Each stage lists its technologies as small outlined pills, styled like the role's stack tags |
| 132 | Timeline motion          | Where CSS scroll-driven animations are supported, each stage rises in as the panels' text does (decision 107), and the rail fills from top to bottom as the timeline scrolls through the sheet's view; in Firefox and under `prefers-reduced-motion: reduce` the rail is drawn in full and nothing moves |
| 133 | Rail contrast            | A story with a timeline needs a brand accent with at least 3:1 against the paper, as a graphic (WCAG 1.4.11; unit-tested); EpsilonNet's `#f04e23` has about 3.3:1 |
| 134 | EpsilonNet copy          | Written from the user's account and epsilonnet.gr's public description; no company figures, since today's describe a much later company; no claim about how ESS was deployed; no features taken from today's product page; the TypeScript stage says it was introduced alongside jQuery and replaced parts of the code over time, not that jQuery was removed |
| 135 | ESS illustration         | *Superseded by 141.* The only public ESS image is a 542×377 monitor-and-laptop mock-up, about 4× too small for a panel, so the ESS panel shows a generated, generic employee self-service screen (leave balance, payslips, requests) with made-up data marked "Illustrative", no EpsilonNet logo or name and a slate sidebar, so it does not pass for the real product |
| 136 | EpsilonNet image format  | *Superseded by 142.* 1714×964, quality-90 WebP under `assets/stories/epsilonnet/`; decorative, as in decision 108; it keeps its page title and leave balance at the top left, so they survive the phones' 5:2 strip (decision 106) |
| 137 | EpsilonNet tint          | *Superseded by 143.* A light warm tint near the brand orange, `#fde6dc`; the paper text tokens keep 4.5:1 on it (decision 104) |
| 138 | EpsilonNet panels        | The Epsilon ESS panel is replaced by three contributions, in order: async UI with Redux, TypeScript and webpack, and unit tests; the "My role" intro still names Epsilon ESS, and the link to its product page is dropped |
| 139 | EpsilonNet panel copy    | "Async UI with Redux", "TypeScript and webpack" and "Unit tests, front and back", written from the user's account; the copy names no view layer; the Redux panel links to the user's dev.to article, labelled with its title, "Using Redux in a legacy ASP.NET Web Forms project" |
| 140 | Timeline overlap         | The timeline is unchanged; its "From forms to APIs" and "Introducing TypeScript" stages overlap the first two panels, which tell what was built while the timeline tells the path |
| 141 | EpsilonNet illustrations | No screenshots of ESS exist, so each panel shows a generated, generic illustration marked "Illustrative", with made-up data and no EpsilonNet logo or name: a filtered request list, partly loading, beside a Redux-style action log and state; a light editor with a typed leave request, a TypeScript error and webpack build output; a Mocha and Chai spec with its report beside an xUnit theory and a Test Explorer-style list. The test scene names no .NET test command, since the .NET runtime is not recorded, and the Mocha side names no language |
| 142 | EpsilonNet image format  | 1714×964, quality-90 WebP under `assets/stories/epsilonnet/` (`redux.webp`, `typescript-webpack.webp`, `unit-tests.webp`); decorative, as in decision 108; each keeps its title and main content at the top left, so they survive the phones' 5:2 strip (decision 106); the ESS illustration is removed |
| 143 | EpsilonNet tints         | Light warm tints near the brand orange, in panel order: `#fde6dc`, `#fdeed6`, `#f8e2e0`; the paper text tokens keep 4.5:1 on each (decision 104) |
| 144 | CLI panel                | A fourth EpsilonNet contribution, last, after the unit tests: "Developer productivity CLI tool", the user's Node.js tool that generates a new form's boilerplate from Handlebars templates; it names the generated parts shown in the user's own screenshot (user control, async handler, TypeScript page script, Redux state, C# data models) and links to the user's dev.to article, labelled with its title, "Automating boilerplate code generation with Node.js and Handlebars" |
| 145 | CLI image                | The article's two terminal screenshots (560×250 and 858×584) are too small for a panel, so the panel shows an HTML re-draw of both at 1714×964: the generated file tree in a left column, the "ESS DEV" banner and prompts beside it and the "File created" lines below; the banner sits in the image's middle, a little below the top, because the right-hand panel fades the image's left side and its tilt runs the right side off the panel; it shows whole from about 1280px wide, is clipped at tablet widths and, like every panel's top, fades in on phones (decision 106); the user accepted both, rather than a smaller banner or a per-panel image anchor, with the screenshots' exact text, including the "Async hanlder" typo and the Windows paths with the user's username, which the article already publishes; no "Illustrative" mark, since it shows the tool's real output |
| 146 | CLI image format         | `cli.webp`, quality-90 WebP under `assets/stories/epsilonnet/`; decorative, as in decision 108; dark, in the terminal's own `#1e1e1e`, unlike the other EpsilonNet images |
| 147 | CLI tint                 | `#f7e8dc`, a warm sand next to `#f8e2e0`; the paper text tokens keep 4.5:1 on it (decision 104) |
| 148 | CLI and the timeline     | The timeline is unchanged, although its last stage mentions CLI tools, as in decision 140 |
| 149 | Degree program link      | A degree can carry an optional `program: { label; url }`, the same shape as `thesis`; its sheet shows the program link before the thesis link |
| 150 | MSc program link         | The University of Macedonia MSc links to `https://www.uom.gr/en/mai`, labelled "MSc in Applied Informatics" rather than a hostname |
| 151 | Brand without a logo     | `brand.logo` is optional; a brand without one keeps the text title on its band, with the band, accent, link colour and visual unchanged; a lockup needs a logo; degrees take the same optional `brand` as work roles |
| 152 | MSc brand                | White band, `tone: "light"`, accent and link `#f6a800`, the orange-gold of the University of Macedonia logo; its blue `#004f92` was ruled out because `--color-on-accent` on it is 2.34:1; no logo, so "MSc in Applied Informatics" stays the title |
| 153 | MSc visual               | *Superseded by 197.* A photo of the University of Macedonia main building, its sign and its campus map, from `entreped2026.uom.gr` (`uom1.jpg`, 1600×1067), unchanged apart from conversion to quality-90 WebP; it takes the shared tilt, fade and phone strip (decisions 57, 60–62); it replaces an earlier logo-on-a-card visual |
| 154 | Text title beside a visual | At every width, a brand without a logo but with a visual sizes its text title to its column (the left half from 48rem up), so "MSc in Applied Informatics" takes at most two lines and no word breaks; tuned to that title, so a longer one could take more lines |
| 155 | Degree stories           | Degrees take the same optional `story` as work roles, rendered by the same intro, panels and timeline; a degree with a story drops the "Coming soon" placeholders |
| 156 | Contributions heading    | Optional `story.contributionsHeading`, defaulting to "Selected contributions"; the MSc in Applied Informatics uses "The application" |
| 157 | MSc story                | A "The program" / "My thesis" intro, from the program page and the thesis abstract, then three panels, one per repository of the thesis application, in the user's order: the Ionic mobile app, the React web app and the ASP.NET Core Web API, each linked to its GitHub repository and labelled with its name |
| 158 | MSc screenshots          | The user's own screenshots of the mobile app (1077×736) and the web app (1439×759), padded with white to 16:9 (1308×736 and 1439×809), neither cropped nor upscaled, as quality-90 WebP under `assets/stories/msc/`; smaller than the other panels' 1714×964, so slightly soft on large high-density screens |
| 159 | MSc API illustration     | The Web API panel shows a generated, generic illustration marked "Illustrative", with made-up data: a `POST /api/AttendanceLog` request and the API's real "too far from the classroom" reply, beside its three registration rules; its title, mark and reply sit in a middle column, a little below the top, because the left-hand panel runs the image's left side off the panel, fades its right side and, on wide screens, crops its top |
| 160 | MSc tints                | From the University of Macedonia palette, in panel order: `#fdf0cc`, `#dce8f3`, `#fbe6cf`; the paper text tokens keep 4.5:1 on each (decision 104) |
| 161 | Sheet URLs               | Every sheet has its own path: `/experience/<slug>` for work, `/education/<slug>` for degrees and `/community/<slug>` for community roles; opening a sheet from its row pushes that path with `history.pushState`, without a router navigation, so Back, Forward, Escape and the close button behave as in decision 47 and the page behind keeps its scroll position |
| 162 | Slugs                    | An explicit `slug` on every role, degree and community entry in `content/profile.ts`, never derived from a name; unique within its group: `netdata`, `adzuna`, `skroutz`, `epsilonnet`; `msc-applied-informatics`, `msc-informatics-and-management`, `bsc-economic-science`; `skgjs` |
| 163 | Shared home layout       | The home page lives in `app/(home)/layout.tsx`, so it stays mounted across `/` and every sheet path; `app/(home)/page.tsx` and the three `[slug]/page.tsx` files render nothing and only carry metadata, static params and the 404; the URL alone says which sheet is open; the sheet renders as a direct child of `<body>`, after `<main>`, with no portal |
| 164 | Opening motion           | Unchanged from decision 43 whenever the sheet opens in a loaded page (a row click, or Forward): it grows out of its row, measured at that moment |
| 165 | Opening by URL           | When a page loads on a sheet path, the sheet is already full screen and only its content rises in (no grow); the page behind is scrolled instantly to the sheet's row, unseen, so closing shrinks into the row and focus returns to it as after a click |
| 166 | Server rendering         | A sheet path's HTML contains its open sheet with its full content, readable without JavaScript |
| 167 | Closing a sheet opened by URL | A sheet opened by the page load closes by replacing its URL with `/` (Back then leaves the site); one opened in the loaded page closes through `history.back()`, as before |
| 168 | Sheet metadata           | Each sheet path has a title (the sheet's title, through the site's title template), a description built from its data (work and community: "{subtitle} at {title}, {period}."; education: "{title}, {subtitle}, {period}.") and a canonical URL of its own path; the sitemap lists `/` and every sheet path; unknown slugs return 404 |
| 169 | Tab title                | Opening a sheet in a loaded page sets the tab title to that sheet's title, and closing restores the home title, since a sheet only opens over `/`, so the tab and history entries match the URL |
| 170 | Home-only behaviour      | *Amended by 183.* The section tracking and hash (decisions 124–125), Back to top and the brand link's scroll (decisions 94–98) stay keyed to `usePathname() === "/"`; on a sheet path they are off, so the hash is never written onto a sheet path |
| 171 | Analytics routes         | *Superseded by 217.* Vercel Web Analytics reports a sheet's page view under its route, `/experience/[slug]`, `/education/[slug]` or `/community/[slug]`, whether a row, Back, Forward or the page load opened it; a site component wraps `@vercel/analytics/react`'s `Analytics` and replaces `@vercel/analytics/next`'s, passing the same settings (`framework: "next"`, and the base path and client config from the `NEXT_PUBLIC_VERCEL_OBSERVABILITY_*` build variables); other paths keep the route the Next.js component reported |
| 172 | Home page views          | Every sheet opening counts as a page view of that sheet; `/` counts when the page loads on it, and the first time a page load that opened a sheet shows it; a return to `/` from a sheet after `/` has counted in that page load is not a new view |
| 173 | Section paths            | Five paths name places on the home page: `/experience`, `/writing` and `/contact` for the sections, and `/education` and `/community` for the Education and Community groups inside Experience; each is a real route that renders the home page; `/contact` is live again (decision 31) |
| 174 | Path follows scroll      | On the home page the URL path names the region in the reading band (decision 40's band): a group inside Experience wins over Experience itself, and no region (the hero, the footer, a gap) gives `/`; the current history entry is replaced with a plain state object, never a new one pushed, and any hash is dropped; Back to top and the brand link's scroll return the URL to `/`; decision 126 still applies |
| 175 | Section links            | *Query string amended by 185.* The nav links and the hero's "Scroll" cue link to the section paths; on the home page a plain click pushes the path (or replaces it when it is already the URL) and scrolls to the region, smoothly or, under reduced motion, instantly (decision 96's CSS rule); from another page (the 404) the link navigates and the home page lands on the region |
| 176 | Opening a section path   | *Amended by 186.* A fresh load of a section path is already at its region before the first paint, through a small inline script in the route's HTML; on a reload or a Back or Forward that reloads the document, the script leaves the browser to restore the exact position; without JavaScript the page opens at the top |
| 177 | Hash links               | No code handles hashes; an old link such as `/#contact` still works because the browser scrolls to the section's id, after which the path follows the scroll (decision 174) |
| 178 | Section path SEO         | Each section path's canonical URL is `/`; the sitemap does not list them (decision 168) |
| 179 | Section path title       | The tab keeps the home title on every section path, on load and while scrolling |
| 180 | Section path analytics   | *Amended by 217:* a view carries a path and no route. `/` and the section paths count as one page: moving between them is never a page view; arriving on one by a page load or from another page (the 404) counts once, under its own path and route; arriving from a sheet follows decision 172, with any of them standing for `/` |
| 181 | Nav highlight            | On `/education` and `/community` the nav marks Experience as current |
| 182 | Dev-only console error   | In `next dev`, reaching a section path from another page logs React's "Encountered a script tag" error, because the inline script is rendered on the client and never runs; it is accepted, since the home page scrolls there itself and production builds log nothing |
| 183 | Home paths               | `/` and the five section paths are all the home page: the section tracking, Back to top and the brand link's scroll (decisions 94–98, 170) run on any of them, and a sheet path stays off |
| 184 | Arriving on a section path | When the home page is reached on a section path (a page load, or a link from the 404 page), the path stays as it is and the nav marks the item it belongs to until the visitor first scrolls; from then the band decides (decision 174); on phones the single-row Community group ends above the band, so without this a `/community` link would read `/writing` at once |
| 185 | Section link query string | A section link click keeps the URL's query string, as the path tracking and Back to top do (amends decision 175) |
| 186 | Hidden until placed       | On a fresh load (`navigate`) of a section path with JavaScript, the page stays hidden, showing only the page background, until the jump has placed it, so no browser shows the top of the page first: a script in the root layout's `<head>` marks the document as pending, CSS hides `<body>` while it is marked, the region's script clears the mark right after its jump, and `DOMContentLoaded` clears it in any case; `/`, reloads, Back and Forward and pages without JavaScript are never hidden (amends decision 176) |
| 187 | AUTh MSc program link     | The MSc in Informatics and Management links to its successor's site, `https://deps.csd.auth.gr/en/`, labelled "Successor program (AUTh)", because the program the user attended no longer exists under its name and its original site (`http://dpms.csd.auth.gr`) has no https; the University of Macedonia page the user first gave belongs to the other MSc |
| 188 | AUTh MSc thesis link      | The thesis PDF on `ikee.lib.auth.gr` returns 200 again, so the sheet links to it, labelled "Thesis (Greek)" after the thesis's language, as the other MSc's "Thesis (English)" |
| 189 | AUTh MSc story            | A "The program" / "My thesis" intro only, as in decision 157 but with no panels, so the sheet drops its "Coming soon" placeholders (decision 155); the thesis title is the user-approved English translation of the Greek title; the supervisor is not named |
| 190 | AUTh MSc brand            | *Superseded by 192.* None for now; the sheet stays a plain sheet |
| 191 | Placeholder test          | *Superseded by 205.* The end-to-end check that an entry without a story shows the three placeholders moves to the BSc in Economic Science |
| 192 | AUTh MSc brand (revised)  | White band, `tone: "light"`, accent and link `#e0675c`, a lighter tint of the Aristotle University logo's red `#952927`; the logo red itself is ruled out because `--color-on-accent` on it is 2.61:1 and, as a dark band, the muted text on it is 3.08:1; no logo, so "MSc in Informatics and Management" stays the title |
| 193 | AUTh MSc visual           | A generated, generic illustration marked "Illustrative": the thesis's E-Shop ontology as a graph in a light window titled `e-shop.owl`, its boxes named after the thesis's classes and its arrows after its object properties, with AUTh-red highlights and no company names or logos; 1714×964, quality-90 WebP under `assets/brand/`; it takes the shared tilt, fade and phone strip (decisions 57, 60–62), so the ordering chain, the highlighted `EShop` box and the mark sit 33–72% across and 40–70% down, where both the wide band and the phone strip show them unfaded |
| 194 | Text title size           | A text title beside a visual is capped at `12cqi` instead of `12.5cqi`, so its column is 8.33em: "MSc in Informatics and Management" takes three lines ("Informatics and" measures 8.00em) and "MSc in Applied Informatics" keeps two (amends decision 154) |
| 195 | Plain-sheet test          | *Superseded by 205.* The end-to-end check that a sheet without a brand has no band and no image moves to the BSc in Economic Science |
| 196 | Brand in the same PR      | The brand ships in the pull request that added the story (decisions 187–191) |
| 197 | MSc visual (revised)      | The MSc in Applied Informatics band shows a generated illustration of the thesis application instead of the campus photo, so both MSc sheets show their thesis; the story panels are unchanged |
| 198 | MSc architecture visual   | A generic illustration marked "Illustrative", in the same window style as decision 193: the mobile app (Ionic, Angular) and the web app (React, TypeScript) talk to the ASP.NET Core Web API, which stores its data in SQL Server through Entity Framework Core; a made-up QR code links the lecture shown in the web app to the phone's scan; 1714×964, quality-90 WebP under `assets/brand/`; the API box and the mark sit where both the wide band and the phone strip show them unfaded |
| 199 | MSc visual colours        | University of Macedonia blue `#004f92` and gold `#f6a800` as graphics only; no text is set on the gold, so the contrast rule of decision 152 does not apply |
| 200 | MSc visual in the same PR | The new visual ships in the pull request of decisions 187–196 |
| 201 | BSc story                 | The BSc in Economic Science takes a "The school" / "My division" intro and no panels, so it drops its "Coming soon" placeholders (decision 155); "My division" names the Economic Theory and Policy division, the School of Economics' own English name for «Τομέας Οικονομικής Θεωρίας και Πολιτικής»; the Greek name is left out, at the user's request on 2026-10-18 |
| 202 | BSc program link          | `https://www.econ-auth.gr/en/`, the English pages of the School of Economics, labelled "School of Economics (AUTh)" |
| 203 | BSc brand                 | The same as the MSc in Informatics and Management (decision 192): white band, `tone: "light"`, accent and link `#e0675c`, no logo, so "BSc in Economic Science" stays the title; it takes two lines ("BSc in Economic" measures 8.26em of the 8.33em column) |
| 204 | BSc visual                | A generated, generic illustration marked "Illustrative", in the window style of decision 193: a supply and demand diagram with its equilibrium beside an aggregate demand and supply diagram, with no data or figures, in AUTh-red tints; 1714×964, quality-90 WebP under `assets/brand/`; its diagrams and mark sit where both the wide band and the phone strip show them unfaded |
| 205 | Placeholder and plain-sheet tests | With every entry branded and every entry but the community one told (corrected 2026-10-18; decision 207 tells it too), a unit test renders the "Coming soon" placeholders from a profile whose degree has no story, and the two end-to-end checks on the BSc are removed; the plain sheet stays covered by the `SheetHost` unit test |
| 206 | BSc in the same PR        | The BSc changes ship in the pull request of decisions 187–200 |
| 207 | Community stories         | Community entries take the same optional `story` as work roles and degrees, rendered by the same intro and panels; the SKG JS sheet takes one, so it drops its "Coming soon" placeholders |
| 208 | SKG JS story              | A "The community" / "My role" intro, then two panels: "What's new in React 19", the user's talk at Meetup #3 (25 April 2025, OKThess), linked to its event page as "Meetup #3", and "Between meetups", linked to the Meetup group as "SKG JS on Meetup" and the Discord server as "SKG JS on Discord"; the talk takes the user's own title, while the event page lists it as "How React 19 new features can improve our apps" |
| 209 | Talk panel image          | A generated poster of Meetup #3 marked "Illustrative", built only from the event page: its title, date, time, venue and agenda with both talks; no Meetup or React logos; SKG JS black `#1a1a1a` and yellow `#f7dd3e` |
| 210 | Join panel image          | A generated graphic marked "Illustrative" of two cards, "Meetup" for events and RSVPs and "Discord" for the conversation between meetups, in SKG JS black and yellow, with no Meetup or Discord logos |
| 211 | SKG JS images             | 1714×964, quality-90 WebP under `assets/stories/skgjs/`; decorative, as in decision 108; their content sits where both the tilted wide panel and the phone strip show it unfaded |
| 212 | SKG JS copy               | The user approved the intro and panel copy as drafted on 2026-10-18, then changed "a community for JavaScript developers" to "a community for developers"; no recording or slides are linked |
| 213 | SKG JS in the same PR     | The SKG JS changes ship in the pull request of decisions 187–206 |
| 214 | SKG JS panels heading     | The SKG JS panels sit under "Highlights" instead of the default "Selected contributions" (decision 156) |
| 215 | SKG JS tints              | `#fdf6c9`, a pale SKG JS yellow, for the talk panel and `#f1efe6`, a warm grey, for the join panel, approved by the user on 2026-10-18; the paper text tokens keep 4.5:1 on both (decision 104) |
| 216 | Analytics                 | Google Analytics 4 (property `G-3L6VP0EV5V`) replaces Vercel Web Analytics; `@vercel/analytics` is removed; a visitor who rejects or makes no choice is not counted anywhere |
| 217 | GA page views             | The site sends each page view itself, by the counting rules of decisions 172 and 180, with the page's URL and the tab title and no route; GA's own history-based page views are off in GA Admin, so section-path rewrites while scrolling (decision 174) are never page views |
| 218 | Consent before loading    | Nothing is requested from Google until the visitor accepts; a rejection or no choice loads no Google script and sets no cookie; content is never blocked |
| 219 | Consent banner            | A site-built bar fixed to the bottom of the view, full width, with one short sentence, a link to `/privacy`, and Accept and Reject buttons of equal size and emphasis; no pre-ticked options and no consent by scrolling or closing |
| 220 | Cookie settings           | A "Cookie settings" button in the footer reopens the banner on any page |
| 221 | Privacy page              | One `/privacy` page covers privacy and cookies; its text is drafted, then reviewed and approved by the user before merge; the footer links to it and the sitemap lists it |
| 222 | Measurement ID            | Read from `NEXT_PUBLIC_GA_ID`, set only for Vercel's Production environment; without it there is no Google tag, no banner and no Cookie settings button, so local runs and previews send nothing |
| 223 | Choice lifetime           | An Accept or Reject is remembered in the browser for 6 months, then the banner asks again |
| 224 | Accepting mid-visit       | Accepting sends a page view of the page in view at once; later moves follow decision 217 |
| 225 | Withdrawing consent       | Rejecting after an Accept deletes the GA cookies (`_ga`, `_ga_3L6VP0EV5V`) and reloads the page, so the Google tag is gone |
| 226 | GA collection             | Page views and outbound clicks only: GA Admin keeps enhanced measurement's outbound clicks and turns off its scrolls, site search, form, video and file-download events, history-based page views, automatic collection of user-provided data and Google signals |
| 227 | GA data retention         | 14 months, set in GA Admin and stated on the privacy page |
| 228 | Banner over a sheet       | While a detail sheet is open the banner stays above it and usable: the sheet's modality leaves the banner out of what it makes inert, and the sheet's content keeps clear of the bar while it shows |
| 229 | Footer Privacy link       | The footer's Privacy link is a plain link (a full page load), not a client navigation: a path write from the scroll tracker (decision 174) during a client navigation off the home page cancels it |
| 230 | Banner colour             | The bar is solid magenta (`--color-accent-magenta`, `#ff5cd6`) with dark text (`--color-on-accent`, 7.2:1), so it stands out from the page; its link and both buttons are dark on it, and Accept and Reject keep one style, so the colour never favours Accept (decision 219) |
| 231 | CV content                | The CV builder moves into this repo; `cv/content.json` stays the CV's own data, worded for a CV, and is not derived from `content/profile.ts`; it is the one public CV, with no per-application variants, and this repo becomes the CV's single source of truth |
| 232 | CV PDF build              | `npm run cv` prints the PDF locally with the installed Google Chrome and writes it to `public/`, where it is committed; the Vercel build does not generate it |
| 233 | CV page                   | `/cv` renders the CV from the same template and stylesheet as the PDF, scoped under a `.cv` wrapper and shown on a paper sheet, with a button that downloads the PDF |
| 234 | CV links                  | A "CV" link in the main nav after the section links, and one in the footer beside Privacy; both are plain links (full page loads, decision 229) |
| 235 | Stale PDF guard           | `npm run cv` records a hash of the CV's sources next to them, and a unit test fails when the sources change without the PDF being rebuilt |
| 236 | CV downloads              | Not tracked: no download event; the `/cv` page view counts as any other page's (decision 226) |

## 3. Scope

### In scope

- The five routes listed in section 1, plus a custom 404 page.
- A design system: tokens, fluid type scale, layout primitives, light and dark themes.
- A posts content pipeline: local MDX posts, external entries, and a merged list sorted by date.
- Page metadata (title and description), `sitemap.xml`, `robots.txt` and a canonical URL.
- The `/projects` redirect and the service-worker kill switch.
- Vercel Web Analytics; replaced by Google Analytics 4 behind a consent banner in section 32.
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
- One exception (decisions 78–85): the Home hero has an aurora of curtains that sway endlessly and lean toward a mouse pointer. It animates `transform` only, has no pause control (an accepted WCAG 2.2.2 risk) and stops under `prefers-reduced-motion: reduce`. It replaces the drifting code glyphs of decisions 22–25, removed by decision 77.
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
- **Profile data:** `content/profile.ts` holds experience, education, community, social links and the email address as typed data. The pages render from it, so updating the CV means editing one file. *Amended by 231:* the CV page and its PDF render from `cv/content.json`, kept in step with this file by hand.

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
  - University of Macedonia, MSc Applied Informatics, 2015–2018, with program and thesis links.
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

## 13. One-page refactor (2026-10-06)

The user asked for a single scrolling page with eye-catching scroll animations, big nowrap headings in BBH Hegarty that move as a whole line, expandable experience items and animated post tiles. Visual and motion design were delegated ("improvise"); the structural decisions are 30–36.

- **Page order:** hero → Experience (work, education, community) → Writing (all posts) → Say hello (email, social links).
- **Headings:** each section heading is one nowrap line that slides sideways while the section crosses the viewport. Decorative repeats of the title are `aria-hidden`.
- **Experience rows:** a button inside a heading (`aria-expanded`, `aria-controls`); the panel animates open and is `inert` while closed. Several rows can be open at once.
- **Client JavaScript:** only the expandable row (now the detail sheet, section 14), the in-view nav marker, the hero aurora's pointer tracking (decision 85) the section-heading slide fallback for browsers without scroll-driven animations (decision 86) and the scroll-to-top behaviour of the logo link and the footer's back-to-top button (decisions 94–98). Everything else, including scroll motion where supported and the aurora's drift, is CSS.
- **Superseded:** success criteria 1, 3, 4 and 5; section 3 (pages, MDX pipeline, `/projects`); section 4.1 (no scroll-linked motion); section 4.2 (light theme, four accents); section 4.3 (display font); section 4.5 (route links); section 5 (page table); the `/projects` redirect in section 7; the draft tests in section 8.
- **Open:** the rich content for each experience row (decision 33, now decision 45).

## 14. Detail sheet (2026-10-06)

The user asked for each section item to open a full-page section with a striking animation, on a white or near-white background, with placeholder content for now. The decisions are 41–47.

- **Rows:** each row stays a big button inside an `h4`. It now opens a sheet (`aria-haspopup="dialog"`) instead of a disclosure panel.
- **Portal:** the sheet renders into `<body>`. Rows carry scroll-driven transforms, and a transformed ancestor would trap a `position: fixed` sheet inside the row.
- **Modality:** while the sheet is open, the header, main content and footer are `inert`, the page does not scroll, and focus moves to the close button. Tab cannot reach the page behind.
- **Motion:** the sheet's `clip-path` animates from the clicked row's rectangle to the full viewport, using the row's measured position. Content blocks rise in with a stagger. Closing plays the reverse and then removes the sheet.
- **History:** opening pushes a history entry without changing the URL. Back, Escape and the close button all close through that entry, so the history stays balanced.
- **Colour:** light-surface tokens sit alongside the dark tokens in `tokens.css`, and `tokens.test.ts` checks their contrast.
- **Open:** the rich content for each sheet (decision 45).

## 15. Brand header (2026-10-06)

The user asked for the top of the Netdata detail sheet to be brand oriented, with Netdata's colours and official logo from netdata.cloud. The decisions are 48–54.

- **Source:** the logo is `https://www.netdata.cloud/img/netdata-logo.svg` (green mark `#00ab44`, white wordmark), stored unchanged at `assets/brand/netdata-logo.svg`. The site's page background is `#020503` and its brand green is `#00ab44`.
- **Data:** `Role.brand` holds the logo and both colours. They live with the entry rather than in `tokens.css`, because they belong to the employer, not the site.
- **Layout:** the band holds the period, logo, subtitle and facts line on the dark-page text tokens. It pulls up behind the sticky close bar by the bar's height, which is defined once as CSS variables.
- **Colour:** `tokens.test.ts` checks that the band's text tokens and `--color-on-accent` keep at least 4.5:1 contrast on every brand's background and accent.
- **Visual:** the screenshot is `https://www.netdata.cloud/img/landing/landing-hero_hu_1bcf3da23fee438b.png` (1919×1079), stored unchanged at `assets/brand/netdata-dashboard.png`; `next/image` serves resized copies. Decisions 55–62.
- **Adzuna:** adzuna.co.uk blocks automated clients, so the logo and colour were checked and the screenshot taken in the user's Chrome. The capture is the 1512×756 first screen (1568×784 PNG), with the cookie-settings badge and the browser's password-manager overlay hidden. Decisions 63–65.
- **Skroutz:** the logo is `https://www.skroutz.gr/assets/schwartz/logo-4636919242747e42156835b0b8673b0c.svg` with its fill changed from `#f68b24` to white. The visual is the user's signed-out screenshot of skroutz.gr (2956×1482), stored as a quality-90 WebP at `assets/brand/skroutz-home.webp`. Decisions 66–69.
- **EpsilonNet:** the logo source is `https://epsilonnet.gr/wp-content/uploads/2024/06/EPSILONNET_logo.png`, traced to `assets/brand/epsilonnet-logo.svg`. The visual is a 1440×900 capture at 2× of epsilonnet.gr's first screen, taken with the cookie banner hidden rather than answered, stored as `assets/brand/epsilonnet-home.webp`. Decisions 71–72.
- **SKG JS:** the logo is `https://skgjs.gr/images/logo.svg`, stored unchanged at `assets/brand/skgjs-logo.svg`; the colours are skgjs.gr's `js-black` and `js-yellow` CSS tokens. The visual is a 1440×900 capture at 2× of skgjs.gr's first screen, stored as `assets/brand/skgjs-home.webp`. Decisions 87–90.
- **Out of scope:** Netdata's fonts.

## 16. Back to top (2026-10-09)

The user asked for a scroll-to-top control at the bottom of the site, and for the logo link to scroll to the top. The decisions are 94–98.

- **Cause:** a Next.js `Link` to the URL already shown is a no-op, so on `/` the logo link did nothing; on `/#section` it was a real navigation and already scrolled up.
- **Shared behaviour:** one helper scrolls the window to the top, replaces any hash in the current history entry, and focuses the logo link with `preventScroll`. The logo link intercepts only plain left clicks on the home page, so modified clicks still open new tabs.
- **History:** the hash is replaced, not pushed, so Back after scrolling up skips the `#section` entry that was showing.

## 17. Role story (2026-10-09)

The user asked for real content on the Netdata detail sheet: a short intro on what Netdata does and the user's role there, then the user's selected contributions, each with a title, a description, a screenshot with the band's perspective and fade, and its own background. The decisions are 99–107.

- **Data:** the copy is the user's text, unchanged, in `content/profile.ts`. The panels' tints live with the story, like brand colours, because they belong to the entry, not the site.
- **Layout:** the intro sits on the paper surface under the band. "Selected contributions" heads a list of full-bleed panels; each panel clips its tilted screenshot, so the sheet never scrolls sideways.
- **Closing:** the sheet waits for its time-based animations before unmounting. Scroll-driven animations finish only when scrolled through, so the wait leaves them out.
- **Screenshots:** the user's PNG captures, converted with `sharp` (bundled with Next.js) to quality-90 WebP, about 75% smaller (2.7 MB to 684 KB in total). Decision 108.


## 18. Skroutz story (2026-10-09)

The user supplied a draft of their Skroutz role and has no screenshots of the merchant panel they worked on. The decisions are 110–116.

- **Facts checked:** PR #327 (`turbo:frame-render`, merged 2021-08-25) and PR #367 (target element on the fetch events, merged 2021-09-01) are the user's and both merge commits are in `v7.0.0` (published 2021-09-24). The Turbo 7 announcement reads "Many thanks to John Kapantzakis and Sean Doyle for these contributions" after describing the frame events.
- **Copy:** the user's draft, restructured into an intro and four contributions (decision 116). Two of the draft's sections described what the user learned rather than built, so they live in "My role" and the merchant platform panel.
- **Images:** the public pages are captured with Playwright; the dashboard is an HTML page written for this purpose and captured the same way. All are converted with `sharp` to quality-90 WebP.

## 19. Adzuna story (2026-10-09)

The user described their Adzuna role: hired to build a new product, Labour Market Intelligence, in a team of a product manager and two developers, on Next.js, shipped in less than a year. The decisions are 117–123.

- **Facts checked:** Adzuna's public pages (`/adzuna-intelligence/` and `/adzuna-intelligence/platform/`) brand the product "Adzuna Intelligence" and state 1bn+ job postings, 15m+ jobseekers a month and 20 countries. Their only product image is a laptop mock-up whose screen shows an occupation dashboard with data for 28/07/2021 – 28/01/2022; its marketing assets were uploaded in March 2023.
- **Copy:** the user chose copy based only on what they said, without library or ownership details (decision 120). The intro paraphrases Adzuna's public description.
- **Images:** the public screenshot is cropped with `sharp`; the illustrations are HTML pages written for this purpose, captured with Playwright at 1714×964. Their map ramp was checked with the dataviz palette validator (single hue, monotone lightness). All are converted with `sharp` to quality-90 WebP.

## 20. Hash follows scroll (2026-10-09)

The user asked for the URL hash to update while scrolling through the sections, as it does after a nav click. The decisions are 124–126.

- **Source:** the hash follows the same observer that sets `aria-current`, so the URL and the highlighted link never disagree.
- **History:** the hash is replaced in the current entry, keeping the router's state object, as in section 16; Back is unaffected by scrolling.
- **Load:** nothing is written until the observer first reports, so a page opened at `/#section` keeps its hash while the browser scrolls there.

## 21. EpsilonNet story (2026-10-09)

The user described their path at EpsilonNet (Sep 2014 – May 2020) on Epsilon ESS: from a junior web designer turning Photoshop mock-ups into HTML and CSS, through jQuery, C# on the backend, AJAX-loaded views over ASP.NET APIs and TypeScript, to owning the frontend and building features end to end except the SQL queries, with CLI tools that automate development. The user approved decisions 127–137 on 2026-10-09.

- **Facts checked:** epsilonnet.gr describes the company as working in IT, digital content development and education, with ERP, CRM, Retail, Mobile, WMS, HRM and Business Intelligence products, and today 1,700+ employees and 28 group companies. The ESS page describes an Employee Self Service web platform for leave, payslips, attendance, travel and expenses and evaluations; it does not say how ESS is deployed, and some of its features may postdate the user's time. Its only product image was uploaded in April 2023.
- **TypeScript:** the user introduced TypeScript next to the existing jQuery code and replaced parts of it over time; jQuery was still in the codebase when they left (decision 134).
- **Layout:** the intro, one panel, then the timeline (decision 129). The timeline is an ordered list; the rail and its fill are decorative pseudo-elements, so assistive technology reads only the stages.
- **Motion:** the timeline closes the sheet, so it can never scroll far up the view. Its ranges therefore end once their subject has fully entered: each stage rises in as it enters, and the rail's tip runs from two-thirds down the view to its bottom edge, so both finish at the bottom of the sheet (end-to-end tested).
- **Image:** the illustration is an HTML page written for this purpose, captured with Playwright at 1714×964 and converted with `sharp` to quality-90 WebP.

## 22. EpsilonNet contributions (2026-10-10)

The user replaced the Epsilon ESS panel with three contributions: views that load and update asynchronously with Redux, introducing TypeScript and webpack, and unit tests with Mocha and Chai on the frontend and xUnit on the backend. The user approved decisions 138–143 on 2026-10-10.

- **Facts checked:** the user's dev.to article "Using Redux in a legacy ASP.NET Web Forms project" (22 August 2019) describes a Redux store per user control, its initial state serialised into a hidden field by the code-behind, and the final state posted to a generic handler; its samples use jQuery and Kendo UI, not React, and it names TypeScript and webpack among the tools the team adopted.
- **Images:** each illustration is an HTML page written for this purpose, captured with Playwright at 1714×964 and converted with `sharp` to quality-90 WebP, as in section 21.
- **CLI panel:** the user added a fourth contribution, approving decisions 144–148 on 2026-10-10. Their dev.to article "Automating boilerplate code generation with Node.js and Handlebars" (18 February 2020) describes `ess-dev`, a project-specific Node.js CLI built on Handlebars, inquirer and xml-js, which writes a new form's files and adds them to the project's `.csproj`. Its two screenshots, taken from dev.to's uploads at their original sizes, are 560×250 and 858×584; the re-draw copies their text, colours and figlet Standard banner.

## 23. MSc in Applied Informatics (2026-10-10)

The user gave the MSc in Applied Informatics sheet a program link, a brand without a logo, a campus photo and a story about the thesis application, approving decisions 149–160 on 2026-10-10.

- **Facts checked:** the program page (`https://www.uom.gr/en/mai`, read 2026-10-10) says the program started in 2003–2004 as the department's first master's degree; its three specialisations date from 2022–2023, after the user's studies (2015–2018), so the copy does not name them. The thesis repository (`dspace.lib.uom.gr`) blocks automated readers, so the thesis text comes from the abstract the user supplied.
- **Repositories:** `kapantzak/AttendanceMobileApp` (Ionic and Angular, QR scanning with the phone's location), `kapantzak/AttendanceWeb` (React and TypeScript, QR codes and attendance charts) and `kapantzak/AttendanceWebAPI` (ASP.NET Core 2.0, Entity Framework Core on SQL Server, JWT, QRCoder); the API accepts a scan only within the classroom's range in metres, within a configured number of minutes from the lecture's start and for an enrolled student (`API/Helpers/LogHelper.cs`).
- **Images:** the screenshots are padded with `sharp`; the API illustration is an HTML page written for this purpose, captured with Playwright at 1714×964 and converted with `sharp` to quality-90 WebP, as in section 22.

## 24. Sheet routes (2026-10-10)

The user asked for every Work, Education and Community sheet to have its own route, keeping the opening animation. The user approved decisions 161–170 on 2026-10-10.

- **Probe:** a throwaway Next.js 16.3.8 app (production build, Playwright) checked the history behaviour before the design was settled:
  - `history.pushState` to a sheet path updates `usePathname`, fetches nothing and keeps the page mounted and scrolled; Back and Forward fire `popstate` and do the same.
  - With a separate `page.tsx` per route, closing a sheet opened by URL and then following a nav link remounted the whole page, as did reloading on a sheet and closing through Back; with the home page in a shared layout, nothing remounted in any of these flows (decision 163).
  - `replaceState` with Next.js's own state object leaves `usePathname` stale; closing a sheet opened by URL therefore replaces the entry with a plain state object, which Next.js syncs (decision 167).
  - `pushState` leaves `document.title` unchanged (decision 169); an unknown slug with `dynamicParams = false` returns the root 404 without the home layout.
- **Routes:** `app/(home)/layout.tsx` renders the home page (hero, sections, rows) and the sheet host; `app/(home)/page.tsx` keeps the home metadata; `app/(home)/experience/[slug]/page.tsx`, `education/[slug]` and `community/[slug]` each export `generateStaticParams`, `dynamicParams = false` and `generateMetadata`, and render nothing. A comment in each empty page says why.
- **Slugs and paths:** `lib/sheets.ts` maps a group and slug to its path and lists every sheet's path and metadata for the pages and the sitemap. Nothing parses a pathname: the sheet host matches the exact paths it was given, and Next.js has already normalised trailing slashes.
- **Rows:** each row stays the button of decision 41; a click only pushes the sheet's path. Rows register their buttons by path with a small client context, so the host can measure a row and return focus to it. A row keeps its brand wipe while its sheet is open (decision 53).
- **Sheet host:** a client component in the layout reads `usePathname()` and owns the open, closing and closed phases. A change to a sheet path opens that sheet, growing from its row (decision 164); a change away from it plays the closing animation, then unmounts the sheet and focuses the row. On the first render it opens with the "by URL" entry (decision 165). It also handles the tab title (decision 169).
- **Sheet:** `DetailSheet` keeps its markup, modality and animations, but renders in place instead of through `createPortal`, so the server can render it (decision 166). It takes an entry mode: "grow" uses the existing `grow` keyframes, and "by URL" starts at `inset(0)` with the content rise only. Reduced motion keeps its short fade in both modes.
- **Scrolling to the row by URL:** done once after hydration with `behavior: "instant"`, because `<html>` has `scroll-behavior: smooth`, and before the scroll lock is applied.
- **Closing:** Escape and the close button go through `history.back()` when the sheet was opened in the loaded page, and through `history.replaceState({}, "", "/")` when the page load opened it (decision 167). Back always closes it, because the pathname changes.
- **Content:** `content/profile.ts` gains a required `slug` on `Role`, `Degree` and `CommunityRole`, with a test that slugs are unique within a group and URL-safe (`^[a-z0-9-]+$`).
- **Sitemap:** `app/sitemap.ts` lists `/` and every sheet path from `lib/sheets.ts` (decision 168).
- **Tests:**
  - Unit: `lib/sheets.ts` (paths, descriptions, static params, unknown slugs), the slug test and the host's open, close and focus behaviour, replacing the `ExpandableItem` sheet tests.
  - E2E: a click changes the URL and keeps the grow animation; Back and Forward close and reopen it; a sheet path loads with the sheet open, its title and canonical URL, and its content without JavaScript; closing it lands on `/` with focus on the row; a nav link after that does not remount the page; unknown slugs return 404; the sitemap lists every path; the hash is never written onto a sheet path. Existing sheet tests keep passing; the Back test's URL check stays.
- **Known limits:**
  - On a load by URL, the page behind is neither `inert` nor scroll-locked until hydration, though the sheet covers it and scrolls on its own.
  - Reloading on a sheet opened in the page and then closing it leaves two `/` entries, so one Back does nothing visible.
  - A `<Link>` to a sheet path would scroll the page to the top, as Next.js does on navigation; the site uses none.

## 25. Sheet analytics (2026-10-10)

After decisions 161–170, a sheet opened in the loaded page was reported to Vercel Web Analytics under its literal path, because `pushState` leaves `useParams()` empty, while one opened by URL was reported as `/experience/[slug]`; and closing a sheet sent a fresh page view of `/`. The user approved decisions 171–172 on 2026-10-10, for the same pull request as the sheet routes.

- **Package (`@vercel/analytics` 2.0.1):** the Next.js `Analytics` takes its route from `useParams()` and `usePathname()` and sends a page view whenever the route or path changes; it accepts no `route` or `path`, and `beforeSend` sees only the URL. The React `Analytics` takes `route` and `path` and sends a page view when either changes and both are set.
- **Component:** `components/PageAnalytics.tsx`, rendered by the root layout in place of the Next.js `Analytics`. The root layout passes it each sheet path's route from `lib/sheets.ts`; any other path takes its route from `computeRoute(pathname, useParams())`, as before. It remembers the previous path and whether `/` has counted, and hands `route` and `path` to the React `Analytics`, or `null` for a return to `/` that does not count (decision 172), so reopening the same sheet still counts.
- **Tests:**
  - Unit: the routes `lib/sheets.ts` gives each sheet path; the component's page views for a click, a close, a reopen, a load by URL and its close, and the settings it passes to the script.
  - E2E: the page views queued in `window.vaq`, which the package fills while its script is not loaded, as it is outside Vercel.
- **Known limits:** the settings copied from the Next.js component and the `window.vaq` queue the end-to-end tests read are internals of the package, so an upgrade can change them; the unit and end-to-end tests then fail.

## 26. Section routes (2026-10-10)

The user asked for the URL to name the section in view with a real path instead of a hash. The user approved decisions 173–184 on 2026-10-10, for a pull request of their own after the sheet routes, and after the final review decisions 185–186, the Firefox runs and the `/contact` limit below.

- **Probe:** a throwaway Next.js 16.3.8 app (production build, Playwright, Chromium and Firefox) with the home page in a shared layout, sheets and smooth scrolling:
  - `history.replaceState` to a section path with a plain state object updates `usePathname`, fetches nothing and keeps the page mounted; with Next.js's own state object `usePathname` stays `/` while the URL changes, so that variant is ruled out.
  - A pushed section path and Back return to the exact earlier position; `history.scrollRestoration` stays `auto`.
  - An inline script after the home page's markup scrolls a fresh load to its region before the first frame, also with Chromium's network and CPU throttled; on a reload Chromium then restores the exact position, while Firefox kept the script's jump (decision 176).
  - Reaching a section path from the 404 page through a `<Link>` renders the inline script without running it; a scroll on the home page's mount covers it (decision 182).
  - Opening a sheet from `/experience` and going Back returns to `/experience` with the position kept; without JavaScript `/contact` opens at the top.
- **Firefox frame before the jump (decision 186):** with the section-route specs running in Firefox, a fresh load drew a frame at the top of the page before the script jumped, in 8 of 12 loads under the test runner's parallel load, while Chromium never did. A throwaway build that hid `<body>` from a `<head>` script until the jump drew no visible frame at the top in 36 of 36 loads across Firefox, Chromium and a Pixel 7; reloads still restored the exact position, nothing was hidden without JavaScript, and with the reveal removed from the region's script `DOMContentLoaded` still revealed the page. A style hoisted into `<head>` by the section route was not pursued: removing it before hydration would fight React, and it has no fallback of its own.
- **Measured on the site:** with a region's top at the top of the view, the Community group (one row) ends at 291–295px on a Pixel 7 and an iPhone 13, above the band's 299–378px, while on desktop it reaches the band; Education and the three sections reach it everywhere (decision 184).
- **Paths:** `lib/nav.ts` lists the five regions with their element ids and the nav item each belongs to (Education and Community belong to Experience), and says whether a pathname is a home path. The Education and Community groups in `components/Experience.tsx` take the ids `education` and `community`.
- **Routes:** `app/(home)/experience/page.tsx`, `education/page.tsx`, `community/page.tsx`, `writing/page.tsx` and `contact/page.tsx`, beside the existing `[slug]` folders; each renders the inline script for its region and sets the canonical `/`.
- **Pending mark:** the `<head>` script in `app/layout.tsx` and the `html[data-region-pending] body` rule in `styles/globals.css` (decision 186); both come from `lib/region-entry.ts` and `lib/nav.ts`, so the region paths are listed once.
- **Inline script:** marks the document as placed, then, only when the navigation type is `navigate`, scrolls the region into view instantly. The home page's mount scrolls to the region when the path is a section path and no script has placed it, which happens only after a client navigation.
- **Tracking:** the observer in `components/NavLinks.tsx` also watches the two groups; the deepest region in the band is current; the nav marks the region's nav item; the path is replaced with `{}` as the state object. When tracking starts on a section path, the observer's reports are held, and the nav marks that path's item, until the first `scroll` event after the next animation frame, so the jump that placed the region does not count as the visitor's scroll (decision 184).
- **Links:** a shared client link for the nav and the hero cue handles a plain click on a home path (push, or replace on the same path, then scroll) and otherwise navigates.
- **Home paths:** `NavLinks`, `BrandLink`, `BackToTop` and `PageAnalytics` use the home-path test instead of `=== "/"`; `scrollToTop` replaces the URL with `/`.
- **Analytics:** `PageAnalytics` treats all home paths as one page (decision 180): a move between them sends nothing; a home path counts when the previous path was neither a home path nor a sheet, or when it is reached from a sheet before any home path has counted.
- **Tests:**
  - Unit: the region list and home-path test, the tracker's deepest-region rule and path writes, the section link's click handling, the inline script's navigation-type check, `scrollToTop`, and `PageAnalytics` moves between home paths.
  - E2E: scrolling writes each path and `/` at the top; a nav click pushes a path and Back restores the position; each section path loads at its region with the home title and canonical `/`; a reload keeps the position; the 404's links land on their regions; Back from a sheet returns to the section path; `/#contact` lands on Contact; `/contact` returns 200 while the other retired routes stay 404; the sitemap is unchanged. The existing hash tests move to paths. The section-route and navigation specs also run in the Firefox project, the browser decision 176's navigation-type check exists for.
- **Known limits:**
  - Without JavaScript a section path opens at the top of the page.
  - The pre-paint jump was measured on a small page in Chromium and Firefox only; on a very slow connection the page stays blank, on its background, until the region's script arrives (decision 186).
  - In Firefox the first frame lands a little short of the region (about 160px on `/writing`) and settles a moment later, as the rest of the page lays out.
  - The `next dev` console error of decision 182.
  - A fresh load of `/contact` runs its script before the footer is parsed, so the page cannot yet scroll as far as a nav tap does: on a Pixel 7 the Contact heading lands 380px down the view instead of 252px, still in view; accepted by the user.

## 27. MSc in Informatics and Management (2026-10-17)

The user asked for details on the MSc in Informatics and Management sheet, giving a program link and the thesis link, and approved decisions 187–191 on 2026-10-17.

- **Facts checked:**
  - The program link the user gave, `https://www.uom.gr/en/mai`, is the University of Macedonia's MSc in Applied Informatics (decision 150), not this degree.
  - The thesis record (`https://ikee.lib.auth.gr/record/115789`, read 2026-10-17) names the interdepartmental program «Πληροφορική και Διοίκηση» of Aristotle University, the language as Greek and the year as 2010; the PDF is dated March 2010 and its abstract describes the E-Shop ontology, written in OWL with Protégé, built on an existing E-Commerce ontology and modelled on the online payment process.
  - The program's 2013–2014 announcement says it was run by the Departments of Informatics and Economic Sciences and had trained professionals in information systems and their use in managing businesses and organisations since 2003; the 2018–2019 announcement says «Διοίκηση Επιχειρήσεων και Πληροφοριακά Συστήματα» evolved from it.

## 28. AUTh MSc brand (2026-10-18)

The user asked for a brand on the MSc in Informatics and Management sheet, with a generated image since none exists, and approved decisions 192–196 on 2026-10-18.

- **Facts checked:** the logo red `#952927` is the dominant colour of the Aristotle University banner logo on `auth.gr` (read 2026-10-18). The thesis PDF has no figure 600px wide or more, so no figure of it is reused. The graph's classes and properties come from chapter 6 of the thesis: `Individual makesOrder Order`, `Individual buysProduct Product`, `Order orderToSeller EShop`, `EShop sells Product`, `EShop hasAcquiringBank Bank`, `Product hasFee Charge`, `Charge hasPaymentMethod PaymentMethod`, `Document recordsCharge Charge`; the side list shows the thesis's twelve top-level classes; the thesis's instances name real companies, so the image shows none.
- **Placement measured:** with the three-line title, the band at 1440×900 is 576px tall, so the image scales up and the band shows only about 33–72% of its width; the phone strip fades the image's top 40%. A first draft with the graph across the image's right half lost `EShop` and the mark on desktop, so the final draft keeps them in the middle; checked at 1440×900, 1920×1080 and on a Pixel 7.
- **Measured:** in the display font, "MSc in Applied" is 7.54em, "Informatics and" 8.00em, "Management" 6.76em and "MSc in Informatics" 9.43em.
- **Image:** an HTML page written for this purpose, captured with Playwright at 1714×964 and converted with `sharp` to quality-90 WebP, as in sections 21 and 23.

## 29. MSc in Applied Informatics visual (2026-10-18)

The user asked for a generated image on the MSc in Applied Informatics sheet, replacing the campus photo, and approved decisions 197–200 on 2026-10-18.

- **Facts:** the parts and their links come from the repositories listed in section 23: the Ionic and Angular mobile app, the React and TypeScript web client, and the ASP.NET Core Web API with Entity Framework Core on SQL Server and JWT authentication, which generates each lecture's QR code and logs a scan through `POST /api/AttendanceLog`.
- **Image:** an HTML page written for this purpose, captured with Playwright at 1714×964 and converted with `sharp` to quality-90 WebP, as in section 28; its QR code is a made-up pattern that encodes nothing.
- **Placement measured:** with its two-line title, the band at 1440×900 is 504px tall; the phone strip on a Pixel 7 ends about 71% down the image, so a first draft lost its QR code, mobile app box and "scanned" label there; the final draft sits higher. Checked at 1440×900, 1920×1080 and on a Pixel 7.
- **Campus photo:** `assets/brand/uom-campus.webp` is removed, with the user's approval on 2026-10-18; git history keeps it.

## 30. BSc in Economic Science (2026-10-18)

The user asked for an image on the BSc in Economic Science sheet, a link to the School of Economics and a mention of the division they chose, and approved decisions 201–206 on 2026-10-18.

- **Facts checked:** the School of Economics site (`https://www.econ-auth.gr/en/`, read 2026-10-18) says the school was established in 1928 as the School of Economics and Political Sciences and is the largest school of Aristotle University; its divisions page lists "Economic Theory and Policy" (Greek page: «Τομέας Οικονομικής Θεωρίας και Πολιτικής») as teaching mathematics and statistics, economic analysis and policies, micro- and macroeconomics, and monetary and industrial organisation. The description is today's; the site does not say whether the division taught the same subjects in 2001–2006.
- **Image:** an HTML page written for this purpose, captured with Playwright at 1714×964 and converted with `sharp` to quality-90 WebP, as in sections 28 and 29.
- **Placement measured:** with its two-line title, the band is 504px tall at 1440×900, as for the MSc in Applied Informatics; a first draft lost the right card's edge and title behind the close button there, so the final draft sits 50px further left. Checked at 1440×900, 1920×1080 and on a Pixel 7.
- **Tests:** `components/Experience.test.tsx` renders the placeholders from a profile whose only degree has no story; the end-to-end story and band tests cover the BSc alongside the MSc degrees.

## 31. SKG JS story (2026-10-18)

The user asked for content on the SKG JS sheet: the Meetup group, the Discord server and their talk on React 19, with freedom to add graphics, and approved decisions 207–215 on 2026-10-18.

- **Facts checked:** the Meetup group (`https://www.meetup.com/skg-js/`, read 2026-10-18) describes "a community in Thessaloniki, Greece, for JavaScript enthusiasts of all levels" and "a friendly and inclusive space where developers can socialize, learn, and grow". The event page (`https://www.meetup.com/skg-js/events/307229886/`) lists "Thessaloniki JS Meetup #3: Beyond Core Web Vitals & New Features in React 19" on Friday 25 April 2025, 19:00–21:00, at OKThess, with networking, a welcome, "Thinking Beyond core Web Vitals" by Katerina Patticha and "How React 19 new features can improve our apps" by the user. The Discord invite (`https://discord.gg/dQY7TPUTBb`) does not expire and leads to the "skgjs.gr" server.
- **Images:** HTML pages written for this purpose, captured with Playwright at 1714×964 and converted with `sharp` to quality-90 WebP, as in section 28.
- **Correction:** decision 205 and the placeholder unit test first said every entry had a story, while the SKG JS sheet still showed placeholders; decision 207 makes that true.
- **Placement measured:** on a Pixel 7 the panel strip shows the image's top 70% or so, so the poster lists only the two talks of the agenda, keeping the user's talk in view; on wide screens the right-hand panel runs its image off the right edge, so the join cards sit 130px further left than the poster. Checked at 1440×900, 1920×1080 and on a Pixel 7.
- **Tints:** `#fdf6c9`, a pale SKG JS yellow, and `#f1efe6`, a warm grey; the paper text tokens keep 4.5:1 on both (decision 104).

## 32. Google Analytics (2026-10-20)

Issue #23 asks for Google Analytics, a cookie banner and legal pages. The user gave the GA4 measurement ID `G-3L6VP0EV5V`, said older GA accounts for the domain do not matter, chose to replace Vercel Web Analytics rather than run both, and approved decisions 216–228 on 2026-10-20, then the privacy page and banner copy and decision 229 on 2026-10-21, and decision 230 on 2026-10-21.

- **Why it is more than a tag:**
  - The site rewrites its path with `history.replaceState` while the visitor scrolls (`components/NavLinks.tsx`, decision 174), and pushes or replaces history for sheets and section links (`SheetHost.tsx`, `SectionLink.tsx`, `lib/scroll-top.ts`). GA4's history-based page views listen for `pushState`, `popstate` and `replaceState` (Google Analytics Help, "Enhanced measurement events", read 2026-10-20), so with GA's defaults every section scrolled past would be a page view.
  - In Greece, analytics cookies need prior consent, and rejecting must be as easy as accepting, on the first layer (HDPA guidance of February 2020, as summarised by IAPP; the HDPA's own text was not read).
- **Facts checked:** on 2026-10-20 `https://www.googletagmanager.com/gtag/js?id=G-3L6VP0EV5V` served a tag configured for that property, with history events, enhanced measurement and automatic collection of user-provided data (`vtp_autoEmailEnabled`, `vtp_autoPhoneEnabled`, `vtp_autoAddressEnabled`) switched on; a made-up ID gets a generic tag with no destination. `@next/third-parties` `GoogleAnalytics` (16.3.8) sends the tag's own page view and relies on history events, and takes no config options, so it does not fit decision 217.
- **Measurement ID:** `NEXT_PUBLIC_GA_ID`, read at build time (decision 222). Its value is public in every page's source; it is set as an environment variable only so that non-production builds have none.
- **Consent store:** one `localStorage` entry holding the choice (`granted` or `denied`) and when it was made; older than 6 months counts as no choice (decision 223). If storage throws or is blocked, there is no choice: the banner shows on each page load, and an Accept still applies for that page's life.
- **Loading the tag:** only once the choice is `granted`, the site's own client code defines `window.dataLayer` and `gtag`, sets the consent defaults (`analytics_storage` granted; `ad_storage`, `ad_user_data` and `ad_personalization` denied), calls `gtag("config", id, { send_page_view: false })` and appends the `gtag/js` script. No new dependency.
- **Page views (decision 217):** `components/PageAnalytics.tsx` keeps its counting state machine (decisions 172, 180) and, for each view that counts while consent is granted, sends `gtag("event", "page_view", { page_location, page_title })`. With the route gone, the root layout passes the set of sheet paths instead of their routes, and `computeRoute` goes. On a sheet opened in the page the tab title changes in `SheetHost`'s effect (decision 169), so the page view must read the title after it.
- **Accepting mid-visit (decision 224):** the counting state restarts as if the page had just loaded on the path in view, and that view is sent at once; so after Accept on a sheet opened in the page, closing it to `/` counts `/` (decision 172). Builder's call: views counted before consent were never sent, so restarting keeps GA's record of the visit consistent.
- **Banner (decisions 219–220):** a client component rendered from the root layout, on every route including the 404 and `/privacy`. It renders nothing on the server and shows after hydration when there is no choice. Accept stores `granted`, loads the tag and hides the bar; Reject stores `denied` and hides it. The footer's "Cookie settings" button reopens it, styled like Back to top (decision 95). Without JavaScript there is no banner and no tag.
- **Banner over a sheet (decision 228):** sheet links are entry points (the sitemap lists them, decision 168), so a visitor who lands on one and never closes it must still be able to answer. The banner's z-index is above the sheet's (30); `DetailSheet`'s modality skips the banner when it makes the rest of the page inert, whichever of the two appears first; while the banner shows, the sheet reserves room at its bottom so the bar does not hide its last lines. Mouse, touch and Tab reach the banner; a screen reader may treat the sheet (`aria-modal="true"`) as the whole page until it closes, which is accepted.
- **Draft banner copy:** "This site uses Google Analytics cookies to see which pages are read, only if you accept. [Privacy]" with the buttons "Accept" and "Reject".
- **Withdrawing (decision 225):** Reject after an Accept stores `denied`, deletes `_ga` and `_ga_3L6VP0EV5V` (both on the host and on `.kapantzakis.gr`, where gtag's automatic cookie domain puts them) and reloads.
- **Privacy page (decision 221):** `app/privacy/page.tsx`, outside the `(home)` group, with `PageMain` like the 404; title "Privacy" through the title template; its own canonical URL; listed in the sitemap. It covers: who runs the site and how to reach them (`profile.email`); that the site uses Google Analytics only after consent, which cookies, what they record, and that outbound clicks are measured; the legal basis (consent) and how to withdraw it (Cookie settings); retention (14 months, decision 227); that Google processes the data and may transfer it to the US under the EU–US Data Privacy Framework; the visitor's rights and the right to complain to the Hellenic Data Protection Authority; the page's last-updated date. The text is not legal advice; the user approves it before merge.
- **Removed:** `@vercel/analytics`, its `computeRoute` and React `Analytics` imports, the `NEXT_PUBLIC_VERCEL_OBSERVABILITY_*` settings test, and the `window.vaq` helper.
- **Tests:**
  - Unit: the consent store (fresh, expired, blocked storage); the tag loader's calls and its single script; `PageAnalytics`'s page views as `dataLayer` entries, for the existing scenarios, plus none before consent and one at once on Accept; the banner's buttons, its link and its return through Cookie settings; the sheet leaving the banner usable, whether the sheet or the banner appears first; withdrawal deleting the cookies and reloading; no banner or button without an ID.
  - E2E: the specs that need the tag skip when the target has no ID (a preview deployment, decision 222), which the server-rendered Cookie settings button shows; builder's call, so `BASE_URL=<preview>` smoke runs keep passing. The build that the tests run sets a placeholder ID, and every test blocks requests to Google, so no test reaches Google even against production (`BASE_URL`). A shared helper stores a choice before each existing spec runs, so the bar does not cover what they click; the analytics specs store `granted` and read page views from `dataLayer`. New specs: the banner on a first visit, Accept on a sheet loaded by URL and on one opened in the page, the sheet's last lines clear of the bar, Reject loading nothing from Google, Accept requesting the tag, Cookie settings reopening it, and `/privacy` returning 200 with its heading and its sitemap entry.
- **The user's actions:**
  - GA Admin, property `G-3L6VP0EV5V`: data stream URL `https://kapantzakis.gr`; enhanced measurement as in decision 226; data retention 14 months; Google signals off; automatic collection of user-provided data off.
  - Vercel: add `NEXT_PUBLIC_GA_ID=G-3L6VP0EV5V` for Production only before the merge deploys; after it, turn off Web Analytics for the project.
  - Review the privacy page and banner copy.
- **Checks after deploy:** the served tag for `G-3L6VP0EV5V` no longer has history events on; a first visit to production shows the banner; Accept sends one page view (GA DebugView or Realtime).
- **Known limits:**
  - GA counts only visitors who accept; with Vercel Web Analytics gone, there is no count of everyone.
  - The banner appears after hydration, so it slides in a moment after the page.
  - The `dataLayer` entries the tests read are gtag's public API, but GA's own handling of them (and the history-events switch) is tested only by the checks after deploy.
  - Found while building it: if the scroll tracker writes a section path (decision 174) while a client navigation off the home page is still in flight, Next.js treats the write as a restore and cancels the navigation, leaving the home page on `/contact`. Traced with stack traces and reproduced by a click in the same frame as the scroll that reveals the footer. The footer's Privacy link avoids it by loading the page (decision 229); any future client link from the home page to another page would meet the same race.

## 33. CV page (2026-10-21)

The user had a standalone CV builder outside this repo (Node, `cv/content.json` rendered by `cv/template.mjs` and printed to a 2-page A4 PDF with Playwright and the installed Google Chrome; its own design is `docs/superpowers/specs/2026-10-20-cv-design.md`). They asked to generate the CV on demand with a script, show it on the site at its own route, and let visitors download it as a PDF. The user approved decisions 231–236 on 2026-10-21, and chose one public CV with no per-application variants (decision 231): the standalone folder is frozen, and edits to the CV happen here.

- **Why the PDF is committed (decision 232):** printing needs Chrome, which the Vercel build does not have; a serverless Chromium would mean a new dependency, a rewritten launch and a new way for deploys to fail. A CV changes rarely, and the user checks each PDF before committing it.
- **Files:**
  - `cv/content.json`: moved unchanged. `outputBasename` names the PDF.
  - `cv/template.mjs`: dependency-free as before. It now exports the CV's markup as a fragment wrapped in `<div class="cv">` for the page, and a full document for the PDF, built from that fragment. The escaping (`esc`) is unchanged.
  - `cv/cv.css`: the rules the page and the PDF share, every selector scoped under `.cv`, so they cannot reach the rest of the site, even after a client navigation away from `/cv` leaves the stylesheet loaded. The colour custom properties move from `:root` to `.cv`. Font families read the site's stacks with the CV's fonts as fallback (`var(--font-body-stack, "Inter", Arial, Helvetica, sans-serif)`, and likewise for the display face), so the page uses the site's `next/font` faces and the PDF, which has no site tokens, uses the static ones. Narrow-screen rules sit in `@media screen` blocks, which the PDF (printed with print media) never applies. Builder's call: `.cv`-scoped resets undo the site's global heading rules (`styles/globals.css` gives `h1`–`h3` the display font, a tight line height and `overflow-wrap: anywhere`), so the CV's `h3` stays Inter on the page as in the PDF; the CV's colour properties are renamed with a `--cv-` prefix so they do not override the site's `--accent` for elements inside the sheet.
  - `cv/print.css`: PDF only: the `@font-face` rules, `@page`, and the `html`/`body` reset and white background.
  - `cv/fonts/`: moved unchanged, plus the SIL Open Font License for Momo Trust Display, which the source folder lacked; the repo is public, and the OFL requires the license to travel with the font.
  - `cv/build.mjs`: the PDF build (decision 232).
  - `cv/sources.mjs` and `cv/sources.sha256`: the stale-PDF guard (decision 235).
  - `docs/superpowers/specs/2026-10-20-cv-design.md`: the CV's own design (A4, 2 pages, section order, content constraints), moved from the standalone folder with its layout notes updated to these paths; builder's call, so the CV's decisions are recorded where the CV now lives.
- **PDF build (`npm run cv`):** renders the full document to `.tmp/cv/<outputBasename>.html` with a `<base>` pointing at `cv/`, so the fonts' relative URLs resolve; opens it in Chrome through `@playwright/test`'s `chromium` with `channel: "chrome"` (the site's existing dependency; no new one), waits for fonts and fails, naming the face, if any face declared in `print.css` did not load (a missing file would otherwise print in a fallback face without complaint), prints with print media and the same `page.pdf` options as before to `public/<outputBasename>.pdf`, then writes `cv/sources.sha256`. The HTML stays in `.tmp/` for inspection; it is not served.
- **Stale-PDF guard (decision 235):** `cv/sources.mjs` hashes (SHA-256) `content.json`, `template.mjs`, `cv.css`, `print.css` and `build.mjs`, in that order. `cv/sources.test.ts` recomputes it, compares it with `cv/sources.sha256`, fails with "CV sources changed; run npm run cv", and checks that `public/<outputBasename>.pdf` exists. The guard runs only where `npm test` runs (the repo has no CI; README's pre-merge checks include it). It catches a forgotten rebuild, not a rebuild left uncommitted.
- **Page (decision 233):** `app/cv/page.tsx`, outside the `(home)` group, with `PageMain` like `/privacy`. It is a server component that imports `cv/content.json`, `cv/cv.css` and the template's fragment, and renders the fragment with `dangerouslySetInnerHTML`; the data is the repo's own and escaped by the template. Above the sheet, a "Download PDF" link (`href="/<outputBasename>.pdf"`, `download`) styled as a button. The sheet: paper background (`--color-paper`), centred, about A4's width at most, with padding that shrinks on phones. The CV's name is the page's `h1`. Metadata: title "CV" through the title template, a description, and canonical `/cv`; the sitemap lists `/cv`.
- **Links (decision 234):** `NavLinks` renders a CV `<li>` after the section items as a plain `<a href="/cv">`, with `aria-current="page"` on `/cv`; `Nav.module.css` styles that state like a current section. `NAV_ITEMS` stays the in-page sections, since its types and the scroll tracker assume regions. The footer gets `<a href="/cv">CV</a>` before Privacy.
- **Tests:**
  - Unit: the stale-PDF guard; `NavLinks` links to every section's path and then to `/cv`, and marks CV current only on `/cv`.
  - E2E (`e2e/cv.spec.ts`): `/cv` returns 200, with the CV's name as `h1`, the title `CV — <name>`, and canonical `https://kapantzakis.gr/cv`; the Download PDF link fetches with status 200 and `application/pdf`; no horizontal overflow (desktop and Pixel 7); the nav's and the footer's CV links reach `/cv` from the home page. The sitemap spec counts `3 + SHEET_PAGES.length` and checks the `/cv` entry.
- **Checks on the moved build:** the new PDF is still A4, 2 pages, with no role split across a page, 4 embedded fonts, clickable links and the same title as the last PDF from the standalone folder; the user compares the two by eye before committing.
- **Formatting:** the moved files are run through Prettier, since `format:check` covers them; the changes are whitespace only.
- **Not changed:** the standalone CV folder outside the repo, which is left as it is and no longer edited; GA and the privacy page (decision 236); `content/profile.ts`.
- **Known limits:**
  - `npm run cv` needs Google Chrome installed locally.
  - The page and the PDF use different files of the same font families (the site's `next/font` faces and the CV's static ones).
  - `content.json` and `content/profile.ts` overlap and are kept in step by hand (decision 231).
