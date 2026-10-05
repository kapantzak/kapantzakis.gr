# kapantzakis.gr

Personal website. Next.js (App Router), deployed on Vercel.

## Development

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script                 | What it does                                 |
| ---------------------- | -------------------------------------------- |
| `npm run lint`         | ESLint                                       |
| `npm run typecheck`    | Generates Next.js types, then `tsc --noEmit` |
| `npm run test`         | Vitest unit tests                            |
| `npm run e2e`          | Builds, then runs Playwright smoke tests     |
| `npm run format`       | Prettier                                     |
| `npm run format:check` | Prettier check (no writes)                   |
| `npm run build`        | Production build                             |

Run `format:check`, `lint`, `typecheck`, `test`, `e2e` and `build` before merging.
To smoke-test a deployed site: `BASE_URL=https://kapantzakis.gr npm run e2e`.

## Content

The site is a single page (`app/page.tsx`): hero, experience, writing and contact.

- **Profile** (intro, experience, education, community, links, email): `content/profile.ts`.
- **Writing**: every post is published elsewhere. Add an entry to `content/external-posts.ts`; invalid entries fail the build with the entry index in the error.
