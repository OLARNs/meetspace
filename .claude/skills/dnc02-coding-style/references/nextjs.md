# Next.js (App Router)

Source repos: `dnc02-nextjs-basic-routing`, `dnc02-nextjs-optimize`,
`dnc02-nextjs-server-client-component`, `dnc02-nextjs-mutation`,
`dnc02-nextjs-basic-todo` (fullest: CRUD + auth), `dnc02-nextjs-authentication`.

## Stack (identical across all six)
- **Next.js 16.x, React 19, TypeScript `strict` — no JavaScript.** pnpm.
- **App Router only** (`src/app`), never Pages Router.
- **Tailwind v4, CSS-first:** `globals.css` is just `@import 'tailwindcss';` and
  **no `tailwind.config` file exists** — don't create one. Utility classes inline.
- `eslint.config.mjs` = `eslint-config-next` (`core-web-vitals` + `typescript`),
  byte-identical across repos. No Prettier config; manual style is single quotes,
  semicolons, no trailing commas, 2-space.
- `tsconfig.json`: `strict: true`, path alias **`@/*` → `./src/*`**,
  `target: ES2017`, `moduleResolution: bundler`.
- Brand placeholder in demos is "DevNest".

> Tell for authored vs untouched code: `create-next-app` boilerplate uses double
> quotes. If you see double-quoted JSX, it's scaffold the instructor never edited —
> author new code with single quotes.

## Server vs Client components
- **Server Components by default.** `"use client"` goes on the **leaf component
  only, and only for interactivity:** URL/search-param state
  (`useRouter`/`useSearchParams`), `react-hook-form`, or `useTransition`.
- **Data fetching happens in async Server Components directly** — `async function
  Page()` calling Prisma or `fetch()`. No client-side data-fetching library
  (no TanStack Query / SWR) appears in Next repos.
- Granular streaming with per-boundary `<Suspense>` around async server
  components (distinct fallbacks per section) is the taught pattern.

## Routing
- Parenthesized **route groups** for shared layouts without URL segments:
  `(root)`, `(common)`, `(auth)`.
- `kebab-case` route segments; dynamic `[id]`, catch-all `[...slug]`, optional
  `[[...slug]]`.
- Pages take params via the **typed `PageProps<'/route'>`** helper; `params` and
  `searchParams` are **Promises — `await` them**.

## Mutations
- **Server Actions, always.** `'use server'` files under `lib/actions/` (or
  `lib/action.ts`), invoked from `<form action={fn}>` or via `useTransition` in a
  client leaf. Actions type their input as `unknown` and `safeParse` it with Zod.
- **The only API route handler in the entire course is the NextAuth catch-all**
  (`app/api/auth/[...nextauth]/route.ts`). Don't build REST `route.ts` handlers
  for app data — use server actions.

## Data & validation
- **Prisma + Postgres** whenever there's persistence: `@prisma/adapter-pg`,
  `provider = "prisma-client"` generator with custom `output`
  (`src/generated/prisma` or `src/lib/db/generated/prisma`), `globalThis`
  singleton.
- **Zod**, imported `import z from 'zod'`; schemas in `lib/schema.ts` /
  `lib/schemas/<feature>.ts`, kept separate from the actions that use them.

## Auth
- **`next-auth@5` (beta / Auth.js)**, Credentials + bcrypt as the default; OAuth
  (Google, GitHub) added in the auth deep-dive. Role propagated DB → JWT → session
  via callbacks + a `next-auth.d.ts` module augmentation.
- Guard pattern at the top of a protected Server Component:
  ```ts
  const session = await auth()
  if (!session) redirect('/login')
  ```
- Route-level protection uses **`proxy.ts`** (Next 16's renamed `middleware.ts`)
  with a matcher gating `/dashboard`, `/todo`, and redirecting logged-in users away
  from `/login` / `/register`.

## Organization
```
src/
  app/               # route groups, layouts, pages (Server by default)
  components/<feature>/   # PascalCase files, grouped by feature (todo/ auth/ ...)
  lib/
    actions/  'use server' mutations
    schemas/  Zod
    data/     read queries
    db/       Prisma singleton
    utils     cn() = clsx + tailwind-merge
```
Mature repos (`basic-todo`) use the folder-per-concern `lib/` split; earlier repos
keep `lib/` flat (`auth.ts`, `action.ts`, `schema.ts`, `data.ts`).

## Voice
Casual live-coding register: commented-out alternate implementations left directly
under the live code, comments narrating framework internals (callback order),
stray `console.log`s, and uncorrected typos in placeholder copy. This is expected
in lesson repos — clean it up for anything presented as a solution.
