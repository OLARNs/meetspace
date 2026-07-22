# Starting a new fullstack Next.js project (dnc02 style)

Companion to [nextjs.md](nextjs.md) — that file is the *conventions*; this is the
*bootstrap order* for a fresh project. Follow it top to bottom. Match versions to
sibling `dnc02-*` repos where possible (course pins Next 16.x, React 19).

## 1. Scaffold
```bash
pnpm create next-app@latest <app-name> \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-pnpm
```
This yields exactly the course baseline: `src/app`, App Router, TS `strict`,
`@/*` → `./src/*`, Tailwind v4 CSS-first (**no `tailwind.config` — leave it that
way**), and `eslint.config.mjs` (`next/core-web-vitals` + `typescript`).

**Immediately after scaffolding:** the generated `page.tsx`/`layout.tsx` use
double quotes and placeholder markup. Rewrite what you keep in house style
(single quotes, semicolons, no trailing commas) so authored code is visibly
distinct from leftover boilerplate.

## 2. Add dependencies
```bash
pnpm add @prisma/client @prisma/adapter-pg zod next-auth@beta bcryptjs clsx tailwind-merge
pnpm add -D prisma @types/bcryptjs
```
(`next-auth@beta` = the v5 line the course uses. Use `bcryptjs` unless a sibling
repo pins native `bcrypt`.) Skip a client data-fetching lib — Next repos fetch in
Server Components, never TanStack Query/SWR.

## 3. Prisma + Postgres
```bash
pnpm prisma init --datasource-provider postgresql
```
Then match the course setup:
- `prisma/schema.prisma` generator uses the driver-adapter output path:
  ```prisma
  generator client {
    provider = "prisma-client"
    output   = "../src/generated/prisma"
  }
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```
- Add `src/generated/` to `.gitignore`.
- Model convention: `PascalCase` singular model `@@map`'d to snake_case plural
  table; `camelCase` fields `@map`'d to snake_case; a `createdAt`/`updatedAt`
  `@db.Timestamptz(3)` pair on every model; `enum Role { ADMIN USER }`.
- **`globalThis`-guarded singleton** at `src/lib/db/prisma.ts` (or `src/lib/db.ts`)
  built on the pg adapter:
  ```ts
  import { PrismaClient } from '@/generated/prisma'
  import { PrismaPg } from '@prisma/adapter-pg'

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
  export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter })
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
  ```
- `pnpm prisma migrate dev --name init` once models exist.

## 4. Folder layout to create up front
```
src/
  app/
    (root)/          # public landing
    (auth)/          # login, register  (route group, no URL segment)
    (common)/        # authenticated area, shared layout (Header/Menu)
    api/auth/[...nextauth]/route.ts   # the ONLY api route you should have
  components/<feature>/    # PascalCase files grouped by feature
  lib/
    actions/   # 'use server' mutation files
    schemas/   # Zod schemas (import z from 'zod')
    data/      # read queries
    db/        # prisma singleton
    auth.ts    # NextAuth config (handlers, auth, signIn, signOut)
    utils.ts   # cn() = twMerge(clsx(...))
  proxy.ts     # Next 16's renamed middleware — route matcher gate
```
Small project? Keep `lib/` flat (`auth.ts`, `action.ts`, `schema.ts`, `data.ts`)
like the earlier repos and split into folders once it grows.

## 5. Auth wiring (NextAuth v5 + Credentials + bcrypt)
- `src/lib/auth.ts`: `export const { handlers, auth, signIn, signOut } = NextAuth({...})`,
  Credentials provider that looks the user up via Prisma and `bcrypt.compare`s;
  `session: { strategy: 'jwt' }`; `jwt`/`session` callbacks that carry
  `id` + `role`; augment types in `src/types/next-auth.d.ts`.
- `src/app/api/auth/[...nextauth]/route.ts`: `export const { GET, POST } = handlers`.
- `src/proxy.ts`: matcher protecting `/dashboard`, `/todo`, and redirecting
  logged-in users away from `/login`, `/register`.
- In protected Server Components: `const session = await auth(); if (!session) redirect('/login')`.

## 6. First feature slice (repeat per resource)
1. Prisma model → migrate.
2. `lib/schemas/<feature>.ts` — Zod schema.
3. `lib/data/<feature>.ts` — read queries (called from async Server Components).
4. `lib/actions/<feature>.ts` — `'use server'`; type input `unknown`, `safeParse`,
   mutate via Prisma, `revalidatePath`.
5. `components/<feature>/` — Server Components for display; a `"use client"` leaf
   only where you need `react-hook-form` / `useTransition` / URL state.
6. Wire the form with `<form action={serverAction}>` (or `useTransition`).

## 7. Prettier (optional, matches the target)
The course leaves Prettier unconfigured on Next repos but writes to this style. If
you want it enforced, add `.prettierrc`:
```json
{ "singleQuote": true, "semi": true, "tabWidth": 2, "trailingComma": "none", "printWidth": 80 }
```

## Don't
- ❌ Create a `tailwind.config.js/ts` (v4 is CSS-first here).
- ❌ Build REST `route.ts` handlers for app data — use Server Actions.
- ❌ Reach for a client data-fetching library, Redux, or an ORM other than Prisma.
- ❌ Leave `any`, or ship the double-quoted `create-next-app` boilerplate as-is.
