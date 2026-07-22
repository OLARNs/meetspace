# Vanilla JS + DOM

Source repos: `dnc02-dom-learning` (instructor live-coding notes),
`dnc02-dom-basic-lab` (18 numbered drills), `dnc02-dom-lab` (polished lab
platform). These are the pre-framework foundation lessons.

## Toolchain
- **No build step, no `package.json`, no npm.** Plain `.html` / `.css` / `.js`
  opened directly or via a live-server. Do not introduce bundlers or a
  `package.json` here.
- **No CSS framework** — all CSS is hand-written. The only CDN usage in the whole
  set is a single `pure-react.html` bridge file (React 18 UMD + Babel standalone
  from unpkg) used deliberately to contrast "what does a framework solve" — not a
  general convention.
- `.prettierrc` exists in one repo only (`singleQuote: true, semi: true,
  tabWidth: 2, trailingComma: 'none', printWidth: 80`) — treat as the target.

## File layout
Each exercise/lab is a self-contained folder: `index.html` + `script.js`
(sometimes `style.css`, `img.png`), plus a per-exercise `README.md` stating the
objective. Shared design tokens live in a `styles/common.css` when there's a hub.

```
01-selecting-elements/
  01/  { README.md, index.html, script.js }
  02/  { README.md, index.html, script.js, style.css }
```

## Style
- **2-space indent, single quotes, `const`/`let` only — never `var`.**
- Semicolons: the polished repos use them; the earliest `basic-lab` omits them.
  **Default to semicolons on** to match the Prettier target and everything after
  lesson 1.
- **`<script>` goes at the end of `<body>`.** `DOMContentLoaded` is *not* used
  anywhere in the course — don't wrap code in it.
- **`El` suffix for DOM element references:** `formEl`, `btnEl`, `inputEl`,
  `rootEl`, `anchorEl`. This is a signature naming tell.
- Naming split: `kebab-case` for HTML `id`/`class`, files, and folders
  (`note-input`, `add-note-btn`, `btn-red`); `camelCase` for JS identifiers.
- CSS uses custom-property design tokens on `:root` (`--primary`, `--radius`,
  `--shadow`) reused across pages.

## DOM API teaching patterns
- `querySelector` / `querySelectorAll` are the preferred modern APIs, but lessons
  **deliberately show all access methods side by side** for contrast
  (`getElementById`, `getElementsByClassName`, `getElementsByTagName`,
  `getElementsByName`). In a *lesson* file, matching this "N ways to do X" layout
  is correct; in app code, prefer `querySelector`.
- Events are introduced as a progression: HTML attribute (`onclick=`) → DOM
  property (`.onclick =`) → **`addEventListener`** (the endpoint). Later labs
  teach **event delegation** (one listener on a container, branch on
  `e.target`).
- HTML is generated with **template literals**; `localStorage` shows up for small
  persistence demos (e.g. a "mark complete" tracker).

## Scaffolding a new DOM exercise
- Folder with `index.html`, `script.js`, a Thai-language `README.md` objective.
- `<script src="script.js">` at the very end of `<body>`.
- Leave `// TODO: ...` markers and `const x = null // replace null with your code`
  placeholders if it's a **`-lab`** (student) exercise; write the full worked
  version for a **`-learning`** file.
