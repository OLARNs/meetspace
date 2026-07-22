# React (Vite, plain JS)

Source repos: `dnc02-react-fundamental(-lab)`, `dnc02-react-advanced(-lab)`,
`dnc02-react-beer-workshop`, `dnc02-react-todo-workshop`,
`dnc02-react-todo-router`, `dnc02-react-connect`. (React **with TypeScript** is a
separate track — see [typescript.md](typescript.md).)

## Toolchain
- **Vite, never CRA.** The course reuses one scaffold and pins the *same* exact
  versions across repos (e.g. React `19.2.x`, Vite `8.x`, `@vitejs/plugin-react`
  `6.x`). Match sibling repos' versions rather than picking latest.
- **pnpm.** ESLint is the unmodified `create vite` flat config
  (`@eslint/js` recommended + `eslint-plugin-react-hooks` +
  `eslint-plugin-react-refresh`). **No path aliases / `jsconfig.json`** — always
  relative imports.
- CSS: plain CSS with custom properties in the *first* fundamentals lesson only;
  **Tailwind v4** (`@tailwindcss/vite` + `@import 'tailwindcss';` in `index.css`)
  everywhere after. Never CSS Modules / styled-components / MUI / Bootstrap.
- Only the two `-lab` repos ship a `.prettierrc` (`trailingComma: 'none'`, to keep
  TODO diffs clean); others rely on Prettier defaults.

## Components — the hard rules
- **Function components only. Never class components.**
- **Default export, declared with the `function` keyword:**
  ```jsx
  export default function ProductCard({ name, price }) {
    return <div className="rounded-xl border p-4">{name}</div>
  }
  ```
  Arrow-function components (`const X = () => {}`) essentially do not occur — don't
  produce them.
- **Custom hooks are named exports declared with `function`**, grouped in a
  `hooks/` folder once one exists: `export function useTodo() { … }`.
- Props: earliest teaching files access `props.x` undestructured on purpose; every
  state/data-driven component destructures in the signature. Default to
  **destructuring in the parameter list**.
- Conditional rendering: `&&` for show/hide, ternary for two-way, **early-return
  guard clauses** for route guards (`if (!user) return <Navigate to="/login" />`).

## Folder scaffolding (the strongest house-style signal)

**Lab repos** (`-lab`): a numbered-topic sidebar shell.
```
src/
  App.jsx                         # sidebar shell: labSections[] + labMap lookup
  labs/<topic-kebab-case>/LabN.jsx  # bilingual docblock (Thai objective + EN) + // TODO
```

**App / workshop repos:** a five-folder shape, grown as the curriculum adds deps.
```
src/
  api/        client.js (axios instance) + <resource>.js
  hooks/      use<Resource>.js  (wraps TanStack Query)
  components/ flat, then split into domain subfolders (auth/ common/ layout/ todo/)
  pages/      route-level components
  routes/     routes.jsx  (createBrowserRouter)
  stores/     <name>Store.js  (Zustand, once global client state appears)
  schemas/    <name>.js  (Zod, once forms appear)
```

## State & data layering (introduced in this order)
1. `useState` (local) → `useContext` + a custom hook (`contexts/CartContext.jsx`).
2. **Server state: TanStack Query** (`@tanstack/react-query`), wrapped per-resource
   in a `hooks/use<Resource>.js`.
3. **Global client state: Zustand** with `persist` (`stores/authStore.js`). Redux
   never appears.
- **HTTP is always `axios`**, instantiated once in `api/client.js`; never bare
  `fetch`. Per-resource modules (`api/todo.js`) import that client.

## Routing
- **`react-router` v7, imported as `'react-router'`** (not `react-router-dom`).
- `createBrowserRouter` config lives in `routes/routes.jsx`.
- Route guards are components that early-return `<Navigate>`
  (`ProtectedRoute` / `PublicOnlyRoute`), reading auth from the Zustand store.

## Forms
`react-hook-form` + `zod` + `@hookform/resolvers/zod`, schema in `schemas/`. On
React 19, pass `ref` as a normal prop (no `forwardRef`). A `FormField` wrapper is
typical.

## Voice
Bilingual docblocks in lab starters (Thai objective + an "Instructions (EN)"
block) ending in `// TODO: your code here`. Solution/app code is English-only and
sparsely commented. `console.log` left in fundamentals files to demonstrate
re-render timing is intentional.
