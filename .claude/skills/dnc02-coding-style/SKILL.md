---
name: dnc02-coding-style
description: >-
  House coding style and toolchain for the "dnc02" bootcamp course repos
  (instructor earth824). Use whenever writing, scaffolding, or reviewing code
  meant to match this course — vanilla JS/DOM, React (Vite), Express, TypeScript,
  Next.js App Router, or Nest.js. Encodes the shared stack (pnpm + ESM, Prisma +
  Postgres, Zod, Tailwind v4) plus naming, folder, formatting, and API
  conventions so generated code looks like the instructor wrote it. Framework
  detail lives in references/ — read the one matching the task.
---

# dnc02 Coding Style

Style guide distilled from ~34 `dnc02-*` course/workshop repos by instructor
`earth824`. Goal: make new code indistinguishable from the instructor's own so it
drops cleanly into the curriculum. When a rule below conflicts with a generic
"best practice," **follow this guide** — it reflects observed house style, not
generic defaults.

## When to use

- Building or extending anything in a `dnc02-*` repo, or a project the user frames
  as "in the course style / like the bootcamp / like earth824's repos."
- **Starting a new solo/final project** in the course style — read
  [references/nextjs-starter.md](references/nextjs-starter.md) for the fullstack
  Next.js bootstrap order (scaffold → deps → Prisma → folders → auth → first slice).
- Scaffolding a new lesson/lab/workshop in any of the covered stacks.
- Reviewing student or instructor code for consistency with the course.

Pick the reference file for the stack you're in and read it before writing:

| Stack | Read |
|---|---|
| **New fullstack Next.js project (from scratch)** | [references/nextjs-starter.md](references/nextjs-starter.md) → then [nextjs.md](references/nextjs.md) |
| Vanilla JS + DOM (no build step) | [references/vanilla-dom.md](references/vanilla-dom.md) |
| React (Vite, plain JS) | [references/frontend-react.md](references/frontend-react.md) |
| Express (JS or TS backend) | [references/backend-express.md](references/backend-express.md) |
| TypeScript fundamentals / OOP / typing rules | [references/typescript.md](references/typescript.md) |
| Next.js (App Router) | [references/nextjs.md](references/nextjs.md) |
| Nest.js | [references/nestjs.md](references/nestjs.md) |

---

## Universal conventions (all stacks)

These hold everywhere unless a reference file overrides them.

### Toolchain
- **Package manager: `pnpm`.** Always. Lockfile is `pnpm-lock.yaml`; repos ship a
  `pnpm-workspace.yaml` even when single-package, and often pin
  `devEngines.packageManager` to pnpm `^11`. Never generate `package-lock.json` /
  `yarn.lock`. (One legacy repo used npm; treat pnpm as the rule.)
- **Modules: ESM only.** `"type": "module"`, `import` / `export`. Never `require()`
  / `module.exports` in authored code.
- **Dev runners:** `nodemon <entry>` for plain-JS Node; `tsx watch <entry>` for
  TypeScript Node (no build step in lessons); **Vite** for React (never CRA);
  Next.js / Nest.js use their own CLIs. No test runner is set up in the course —
  don't add one unless asked.
- **Env:** `dotenv` (`import 'dotenv/config'`), read once into a `config`/`env`
  module, never `process.env.X` scattered through the code.

### Data & validation (whenever persistence or input validation exists)
- **Database is PostgreSQL, ORM is Prisma** — via the **driver-adapter** pattern
  (`@prisma/adapter-pg`), generator `provider = "prisma-client"` with a custom
  `output` path under the repo (gitignored). A `globalThis`-guarded singleton
  client (`db`/`prisma`). Never Mongoose/Sequelize/TypeORM/raw SQL.
- **Validation is Zod** for app input (Express bodies, React/Next forms, Next
  server actions). Nest.js is the one split: **class-validator** for DTOs but
  **Zod for env/config** validation. Never joi / express-validator / yup.
- Prisma schema convention: `PascalCase` singular models `@@map`'d to snake_case
  plural tables; `camelCase` fields `@map`'d to snake_case columns; a
  `createdAt`/`updatedAt` `@db.Timestamptz(3)` pair on every model; `enum` for
  role/status; `env("DATABASE_URL")`.

### Auth (whenever auth exists)
- `bcrypt` (or `bcryptjs`) for hashing, `SALT_ROUNDS` 10–12.
- `jsonwebtoken`, payload always `{ sub: user.id, email, role }`, signed with an
  `expiresIn`. Verify from an `Authorization: Bearer <token>` header.
- Role-based access via a `checkRole(...roles)` / guard factory reading the token
  role. (Next.js/Nest have framework-specific variants — see their references.)

### Styling (frontend)
- **Tailwind CSS v4, CSS-first.** Enable with `@import 'tailwindcss';` in the
  global stylesheet (Vite additionally uses the `@tailwindcss/vite` plugin).
  **There is no `tailwind.config.js/ts`** — do not create one. Classes are inline
  utility strings in JSX.
- The *very first* lesson of a track may use hand-written plain CSS with custom
  properties (`--primary`, `--radius`) as design tokens; everything past the intro
  is Tailwind. Never Bootstrap, MUI, styled-components, or CSS Modules.

### Formatting
- **Single quotes** in JS/TS. **Semicolons on.** **2-space** indent.
  **`trailingComma: 'none'`**, **`printWidth: 80`**. Double quotes only where
  they're idiomatic (JSX attributes, JSON, HTML).
- Prettier is configured in only a few repos but its settings are the intended
  target everywhere:
  ```json
  { "singleQuote": true, "semi": true, "tabWidth": 2, "trailingComma": "none", "printWidth": 80 }
  ```
- ESLint, when present, is **flat config** (`eslint.config.mjs`) — the framework
  default (Vite / Next / typescript-eslint), lightly tuned. Don't hand-roll
  `.eslintrc`.

### Naming
- **Files:** `kebab-case`, with a **dot-tag suffix** describing the file's role in
  layered backends — `auth.route.js`, `user.controller.ts`, `todo.service.ts`,
  `check-role.middleware.js`, `auth.schema.ts`, `create-user.dto.ts`,
  `product.type.ts`. React/Next component files are the exception: **`PascalCase`**
  (`ProductCard.jsx`, `LoginForm.tsx`).
- **Identifiers:** `camelCase` for variables/functions; `PascalCase` for
  components, classes, types/interfaces, and Prisma models; `UPPER_SNAKE` for true
  constants (`SALT_ROUNDS`, `JWT_SECRET`).
- **Types:** plain `PascalCase`, **never** Hungarian `IUser` prefixes. Component
  props types are suffixed `...Props` (`ButtonProps`, `TodoItemProps`). See the
  TypeScript reference for `type` vs `interface`.

### Voice & comments (this is a teaching codebase)
- **Code, identifiers, and inline comments are in English.** **Thai** is used only
  in student-facing prose — README exercise objectives, task prompts,
  `instruction.txt`. Sample *data* (names, provinces) may be Thai.
- Two recurring comment idioms worth matching:
  - ALL-CAPS section banners: `// ROUTING MIDDLEWARE`, `// READ METADATA`.
  - Concept traces: `// CONCEPT ===> api(args) => result`.
- **Teaching artifacts are deliberate in lesson/lab code:** `// TODO: your code
  here` scaffolds, `null`/`any` placeholders to be filled in, commented-out
  alternative implementations left beside the live version, and stray
  `console.log`s that show render/exec timing. Reference/"solution" and app code
  is progressively cleaner — mature repos (e.g. `*-connect`) are nearly
  comment-free and self-documenting.
- Distinguish repo intent from the name: **`-lab`** = student starter with TODOs
  (often a `solution` git branch); plain/**`-learning`** = instructor's worked
  example; **`-workshop`** = branch-staged build (`starter`→`guided`→`solution`).

### Structural instincts
- **Layer backends** once past the intro: `src/{app,config,db,routes,controllers,`
  `services,middlewares,schemas,utils,types}`. One file per resource per layer.
- **Prefer plain object-literal modules over classes** for controllers/services
  (`export const authService = { async register() {…} }`). Classes appear only in
  the dedicated OOP lesson, the SOLID/DI Express variant, and Nest.js (which is
  class-native).
- **`as const` objects with derived union types over TS `enum`** in applied code
  (`HttpStatus`, filter sets) — even though `enum` is taught once as a concept.
- Match the **exact dependency versions** already pinned in sibling `dnc02-*`
  repos when adding to the course; the instructor reuses one scaffold and layers
  deps in as the curriculum advances.

---

## Quick self-check before finishing

- [ ] pnpm + ESM? No `require()`, no `package-lock.json`?
- [ ] Persistence → Prisma + Postgres + `@prisma/adapter-pg`? Input → Zod?
- [ ] Single quotes, semicolons, 2-space, no trailing commas?
- [ ] Files `kebab-case.role.ext`; components `PascalCase`; no `IFoo` types?
- [ ] Tailwind v4 with **no** config file? No Bootstrap/MUI?
- [ ] English in code, Thai only in student-facing docs?
- [ ] Followed the matching **references/** file for framework specifics?
