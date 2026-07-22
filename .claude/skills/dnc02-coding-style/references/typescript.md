# TypeScript conventions

Source repos: `dnc02-ts-learning` (lecture scratch), `dnc-ts-lab` (numbered
compiler-error drills), `dnc02-ts-oop` (classes/OOP), `dnc02-express-ts` +
`dnc02-ts-express` (TS backends), `dnc02-react-ts` + `dnco02-react-ts-todo-lab`
(TS React). Applies on top of any framework reference.

## Toolchain
- **pnpm**, pure **ESM** (`"type": "module"`).
- Backend/fundamentals run via **`tsx watch <entry>`** — no build step, no test
  runner. React uses Vite.
- Prettier configured in one repo (`singleQuote: true, semi: true,
  trailingComma: 'none', printWidth: 80`) — the target everywhere.

## tsconfig baseline
- Backend/lecture: `module: nodenext`, `target: esnext`, **`strict: true`**,
  `skipLibCheck`, `verbatimModuleSyntax`, `isolatedModules`, and often the extra
  `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`.
- Vite React: generated config (`target: es2023`, `moduleResolution: bundler`,
  `noUnusedLocals`/`noUnusedParameters`) — leave it as Vite emits it.
- **Beginner exercise repos deliberately relax strictness** (e.g. `dnc-ts-lab`
  turns `noUncheckedIndexedAccess` off "for a beginner exercise set"). Honor the
  existing config; don't tighten a lab's tsconfig.
- NodeNext backends require **explicit `.js` extensions** on relative imports.

## `type` vs `interface`
- **`type` alias is the default** — it outnumbers `interface` ~4–6:1 in every
  measurable repo. Reach for `type` first.
- Use **`interface`** for its distinctive strengths: `extends`, declaration
  merging (module augmentation), and `class … implements`.
- Not dogmatic — a course README literally says *"use an interface (or a type —
  both work)."* Don't refactor one into the other for its own sake.

## Naming
- **Plain `PascalCase`; never `IUser`/Hungarian prefixes.**
- Component props types suffixed **`...Props`** (`ButtonProps`, `TodoItemProps`).
- Derived/response types named by **intent**, not a generic `...Type` suffix:
  `LoginResponse`, `RegisterInput`, `SafeUser`.
- No dedicated `interfaces/` folder anywhere. React puts shared types in a single
  top-level `types.ts`; layered backends use a `types/` folder with
  `<name>.type.ts` files.

## enum vs `as const`
`enum` is taught **once**, as a fundamentals concept. **Applied code uses
`as const` objects with a derived union type** instead:
```ts
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400
} as const satisfies Record<string, number>
export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus]
```
Prefer this over `enum` unless the lesson *is* about enums.

## Deriving types instead of restating them
- From Zod: `type RegisterInput = z.infer<typeof registerSchema>`.
- Object modules typed with `satisfies` to keep literal inference:
  `export const authService = { … } satisfies Record<string, Handler>`.
- Utility types (`Partial`, `Pick`, `Omit`, `Record`, `ComponentProps<'input'>`)
  are used freely.

## `any`
**Never an accepted end state.** It appears only as an intentional "before"
placeholder in `-lab` starters that students must replace — labs state the goal as
*"zero `any` left."* In authored/solution code, type it properly.

## Classes / OOP
Concentrated in the OOP lesson and the DI/SOLID Express skeleton. When classes are
called for: parameter-property injection (`constructor(private readonly dep: Dep)`),
`public`/`private`/`protected` modifiers, `abstract` classes, `implements` an
interface. Elsewhere (advanced backends, all React) prefer plain functions and
object modules; classes otherwise survive mainly for `extends Error`.

## Style
Semicolons always; single quotes the target; **no JSDoc** — comments are plain
`//` / `/* */`, English, often numbered `TODO`-driven teaching notes with
banner-style section dividers.
