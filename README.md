# kapantzakis.gr

Personal website. Next.js (App Router), deployed on Vercel.

## Development

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script              | What it does                                                  |
| ------------------- | ------------------------------------------------------------- |
| `npm run lint`      | ESLint                                                        |
| `npm run typecheck` | Generates Next.js types, then `tsc --noEmit`                  |
| `npm run test`      | Vitest unit tests                                             |
| `npm run e2e`       | Builds with drafts included, then runs Playwright smoke tests |
| `npm run format`    | Prettier                                                      |

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
