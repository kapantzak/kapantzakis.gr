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
4. Every page ships no client-side JavaScript beyond what Next.js needs, plus the analytics script.
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
| 14 | Analytics               | Vercel Web Analytics (`@vercel/analytics`)                                                                |
| 15 | MDX pipeline            | *Superseded by 35.* `@next/mdx`; each post exports `metadata`; external entries live in a typed TS file |
| 16 | Light pages             | *Superseded by 38.* `/posts` and `/posts/[slug]` use the light theme; all other routes stay dark |
| 17 | Post-page test coverage | *Superseded by 35.* Optional `draft: true` post flag; a permanent draft fixture is built only when `INCLUDE_DRAFTS=1` (e2e) |
| 18 | Cache Components        | Off; routes use classic static generation                                                                 |
| 19 | Owner's name in code    | Allowed in `content/profile.ts` only; everything else reads `profile.name`                               |
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
| 31 | Old routes              | *Sitemap superseded by 168.* `/about`, `/posts`, `/contact` removed (404); the `/projects` redirect removed; the sitemap lists `/` only |
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
| 94 | Logo link scroll        | On the home page the logo-and-name link scrolls to the top on every click and drops any `#section` from the URL; on other pages it navigates to `/`; its `href` stays `/` |
| 95 | Back-to-top link        | A quiet "Back to top ↑" text control in the footer beside the © line, styled like the footer links |
| 96 | Back-to-top technique   | A button that shares the logo link's scroll-to-top behaviour: smooth through the existing CSS `scroll-behavior`, instant under `prefers-reduced-motion`, and the URL stays clean |
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
| 116 | Skroutz copy             | The draft's engineering practices section is folded into "My role" as one sentence; its role and dates heading is dropped, since the sheet header already shows both; the Turbo 7 thanks is described as shared with Sean Doyle, as the announcement words it |
| 117 | Adzuna story             | Adzuna is the third role with a story: an "Adzuna" / "My role" intro and three contributions: the product built from zero, its charts and maps, and exploring the data; the team's collaboration is told in "My role" rather than in a panel of its own |
| 118 | Product name             | The copy calls the product "Labour Market Intelligence", as the user knew it; Adzuna markets it today as "Adzuna Intelligence", so its link is labelled "The product on adzuna.co.uk" instead of by either name |
| 119 | Shipping claim           | The first panel says the team shipped the product in less than a year; the user confirmed it reached release within their time at Adzuna (Feb 2022 – Jan 2023), although Adzuna's public marketing pages for it date from March 2023 |
| 120 | Adzuna copy              | Written only from the user's own account and Adzuna's public pages, with no claims about libraries or individual ownership; the intro quotes Adzuna's current public figures (more than 15 million jobseekers a month, 20 countries) |
| 121 | Adzuna tints             | Light greens near the brand green, in panel order: `#e4f2e0`, `#edf4dc`, `#ddeee6`; the paper text tokens keep 4.5:1 on each (decision 104) |
| 122 | Adzuna images            | The first panel shows Adzuna's public product screenshot (the platform page's laptop image), cut from its laptop frame to 16:9 above the chart legend; the other two show generated, generic illustrations (a hex-tile regional map with line and bar charts, and a filtered search with grouping, KPI tiles, a location table and a salary histogram) with made-up figures marked "Illustrative figures", no Adzuna logo or name, and a slate sidebar instead of Adzuna's green, so they do not pass for the real product |
| 123 | Adzuna image format      | 1714×964, quality-90 WebP under `assets/stories/adzuna/`; decorative, as in decision 108; each keeps its search bar and filters at the top left, so they survive the phones' 5:2 strip (decision 106) |
| 124 | Hash follows scroll      | On the home page the URL hash names the section marked current in the nav (decision 40), so scrolling updates it like a nav click; the current history entry is replaced, never a new one pushed |
| 125 | Hash with no section     | When no section is current (the hero, the footer, a gap between sections) the hash is dropped, so Back to top still leaves a clean URL (decision 96) |
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
| 153 | MSc visual               | A photo of the University of Macedonia main building, its sign and its campus map, from `entreped2026.uom.gr` (`uom1.jpg`, 1600×1067), unchanged apart from conversion to quality-90 WebP; it takes the shared tilt, fade and phone strip (decisions 57, 60–62); it replaces an earlier logo-on-a-card visual |
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
| 170 | Home-only behaviour      | The section tracking and hash (decisions 124–125), Back to top and the brand link's scroll (decisions 94–98) stay keyed to `usePathname() === "/"`; on a sheet path they are off, so the hash is never written onto a sheet path |
| 171 | Analytics routes         | Vercel Web Analytics reports a sheet's page view under its route, `/experience/[slug]`, `/education/[slug]` or `/community/[slug]`, whether a row, Back, Forward or the page load opened it; a site component wraps `@vercel/analytics/react`'s `Analytics` and replaces `@vercel/analytics/next`'s, passing the same settings (`framework: "next"`, and the base path and client config from the `NEXT_PUBLIC_VERCEL_OBSERVABILITY_*` build variables); other paths keep the route the Next.js component reported |
| 172 | Home page views          | Every sheet opening counts as a page view of that sheet; `/` counts when the page loads on it, and the first time a page load that opened a sheet shows it; a return to `/` from a sheet after `/` has counted in that page load is not a new view |

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
