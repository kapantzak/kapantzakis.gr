# kapantzakis.gr

Personal website. Next.js (App Router), deployed on Vercel.

## Development

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script                 | What it does                                                      |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run lint`         | ESLint                                                            |
| `npm run typecheck`    | Generates Next.js types, then `tsc --noEmit`                      |
| `npm run test`         | Vitest unit tests                                                 |
| `npm run e2e`          | Builds, then runs Playwright smoke tests                          |
| `npm run format`       | Prettier                                                          |
| `npm run format:check` | Prettier check (no writes)                                        |
| `npm run build`        | Production build                                                  |
| `npm run cv`           | Rebuilds the CV PDF in `public/` from `cv/` (needs Google Chrome) |

Run `format:check`, `lint`, `typecheck`, `test`, `e2e` and `build` before merging.

After editing the CV's content, template or styles in `cv/`, run `npm run cv` and commit the PDF and
`cv/sources.sha256`; `npm test` fails until you do. Before committing, open the PDF, select all and paste into a
plain-text editor to check the reading order, then confirm it has 2 pages, no role split across pages, and clickable
links.

Google Analytics and its consent banner run only when `NEXT_PUBLIC_GA_ID` is set at build time; on Vercel it is set
for Production only, so local runs and previews send nothing. `npm run e2e` builds with a placeholder ID and blocks
every request to Google.
To smoke-test a deployed site: `BASE_URL=https://kapantzakis.gr npm run e2e`.

## Content

The site is a single page (`app/page.tsx`): hero, experience, writing and contact.

- **Profile** (intro, experience, education, community, links, email): `content/profile.ts`.
- **Writing**: every post is published elsewhere. Add an entry to `content/external-posts.ts`; invalid entries fail the build with the entry index in the error.
