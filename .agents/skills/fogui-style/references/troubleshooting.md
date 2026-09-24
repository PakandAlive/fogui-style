# Troubleshooting and pitfalls

Every entry below is a failure seen in practice. Symptom first, then cause, then
fix. Check here before re-deriving a solution.

## What the `theme` item ships (and does not)

Ships, in one CSS file:

- `:root` (light) and `.dark` token values
- `@theme inline` mappings (`--color-*`, radius scale, `--font-*`)
- `@plugin "@toolwind/corner-shape"`
- `@custom-variant dark` and `@custom-variant squircle`
- the `shimmer` keyframes

Does **not** ship:

- `@import "tailwindcss"` / `tw-animate-css` / the shadcn base import
- `@source` paths
- `@layer base` (body background, thin scrollbars, autofill fix)

That last one is the source of several symptoms below.

## Install / CLI

### CLI cannot read the registry

Symptom: `add PakandAlive/fogui-style/...` fails with
`Failed to read GitHub source file "registry.json" ...`, or a 404, even though
the repo is there.

Causes and fixes, in order:

- **The repo is private.** shadcn fetches GitHub anonymously. Make it public, or
  pass a token: `GH_TOKEN=<token> npx shadcn@latest add ...`.
- **You just pushed.** GitHub's raw CDN lags a few seconds behind a push. Retry;
  `api.github.com` updates before `raw.githubusercontent.com`.
- **No `components.json`.** Run `npx shadcn@latest init` first.

### Imports do not resolve after install

Symptom: `@/lib/utils` or `@/components/ui/...` unresolved in the editor/build.

Cause: `tsconfig.json` has no `@/*` path mapping, or `components.json` aliases
disagree with it.

Fix: align both. Custom prefixes are fine — shadcn rewrites registry imports to
whatever you configured.

```json
// tsconfig.json
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } } }
```

```json
// components.json
{ "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "hooks": "@/hooks", "lib": "@/lib" } }
```

The `theme` and `marketing` files land under `@lib/` (e.g.
`@/lib/foglamp-theme.css`). If you use a different `lib` alias, adjust the
`@import` path accordingly.

## Theme / CSS

### Styles do nothing after installing `theme`

Symptom: components render, but colors and shadows look default.

Cause: `theme` is a **file item**. It drops `foglamp-theme.css` into the project;
it is NOT auto-imported and does NOT merge into your CSS.

Fix: import it in your global CSS, right after the Tailwind import:

```css
@import "tailwindcss";
@import "./foglamp-theme.css"; /* relative path to where it landed */
```

`marketing` is the same: import `foglamp-marketing.css` after the theme.

### `@import` must be relative and near the top

- CSS `@import` does not understand `@/` aliases. Use a relative path.
- CSS requires `@import` before other rules. Put it at the top of the global CSS
  file, after `@import "tailwindcss"`. Do not bury it mid-file.

### Invalid CSS `var(----custom-shadow)`

Symptom: dev tools show `var(----custom-shadow)`; shadows break.

Cause: hand-rolling a `registry:style` item with `cssVars` whose keys are already
`--`-prefixed. shadcn's `cssVars` keys are un-prefixed, and it refuses to
overwrite a project's existing tokens, so custom non-color tokens come out wrong.

Fix: do not reproduce the theme with `cssVars`. Install the `theme` item (which
ships the whole CSS file) or copy `foglamp-theme.css` verbatim.

### Page background stays white, dark mode shows no dark background

Cause: `theme` ships tokens, not `@layer base`. Foglamp applies
`body { @apply bg-background text-foreground }` (plus thin scrollbars and an
autofill fix) in `@layer base`, which is **not** part of the theme file.
`shadcn init` adds a minimal base layer; if you skipped init or removed it, the
body has no background token applied.

Fix: make sure your global CSS has at least:

```css
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply font-sans bg-background text-foreground; }
}
```

Optionally add Foglamp's thin scrollbars and WebKit autofill handling.

### Tokens do not apply / old values win

Cause: a `:root` / `.dark` block that appears **after** the theme import
overrides it, or you applied the theme via `cssVars` (which never overwrites).

Fix: import the theme last, or delete the stale token block. The theme file is
meant to replace those tokens.

### `font-sans` resolves to nothing

Cause: the theme maps `--font-sans: var(--font-sans)`. It expects the **project**
to provide `--font-sans`.

Fix: define it once.

```tsx
const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
// <html className={inter.variable}>
```

or, in CSS: `:root { --font-sans: "Inter", system-ui, sans-serif; }`.

### `@source` scans the wrong tree

Cause: you copied Foglamp's whole `globals.css`, which carries monorepo paths
(`@source "../../../apps/**/*.{ts,tsx}"`) pointing outside the project.

Fix: remove them, or repoint at this project:
`@source "../app/**/*.{ts,tsx}";`. Do not add `@source` for node_modules.

### A colored Badge or `shadow-(--custom-shadow-*)` has no shadow

Symptom: colored chips/badges render with no edge shadow; some
`--custom-shadow-*` tokens read as empty.

Cause: the theme was not installed verbatim — an older snapshot, or a
hand-copied token block that dropped tokens.

Fix: reinstall the `theme` item, then confirm they resolve:

```js
getComputedStyle(document.documentElement).getPropertyValue("--custom-shadow-rose");
```

### Animations do nothing (`animate-in`, `fade-in`, …)

Cause: `tw-animate-css` is a dependency but never imported.

Fix: `@import "tw-animate-css";` in the global CSS.

### Dark mode never switches

Cause: the dark variant is `@custom-variant dark (&:is(.dark *))` — it needs an
ancestor carrying the `dark` class.

Fix: put `class="dark"` on `<html>`, e.g. next-themes with `attribute="class"`.

### Squircle corners look like plain rounding

Cause: `@toolwind/corner-shape` and the `squircle:` variant do real squircles
only in Chromium.

Behavior: other browsers fall back to normal rounding. This is intentional; do
not paper over it.

## Components

### `asChild` throws or is ignored

Cause: these are Base UI primitives, not Radix.

Fix: use the Base UI `render` prop.

```tsx
<Button render={<a href="/login" />}>Start</Button>
```

### Icons look inconsistent

Cause: mixing icon libraries.

Fix: `@tabler/icons-react` only. Prefer `*Filled`, default `size-3.5`.

### An input prefix is faked with padding

Cause: an absolutely positioned span over a plain input.

Fix: use `InputGroup` / `InputGroupAddon` / `InputGroupInput` (or
`InputGroupTextarea`).

## Marketing

### `font-display` does nothing

Cause: `--font-display` maps to `var(--font-host-grotesk)`, which the project
must provide. Host Grotesk is not bundled.

Fix: load it (`Host_Grotesk({ variable: "--font-host-grotesk" })`) or override
`--font-display`.

### Fog is invisible or static

Causes:

- The `.fog-layer` element is empty. It needs a texture child, `<FogBank>`.
- No `animation-name` / `animation-duration` set. `.fog-layer` only defines
  timing and iteration; the caller sets the name and duration.
- `prefers-reduced-motion: reduce` is on — `.fog-layer` disables its animation.

## Maintaining this registry (for fogui-style itself)

### Raw file 404 right after a push

GitHub's raw CDN lags a few seconds behind a push. Retry; the API updates first.

### A private repo breaks the CLI

A private repo is readable by `git` (with credentials) but not by the shadcn
CLI's anonymous fetch. Publish it, or require `GH_TOKEN` from consumers.

### The sync script needs the web app

`scripts/sync-from-foglamp.mjs` reads `packages/ui` (components, tokens) and
`apps/web` (marketing). Pass `--web` (or `FOGLAMP_WEB_SRC`) when the default
sibling path is wrong. It errors clearly when the marketing source is missing —
it does not silently skip.

### Prefer `registry:file` for CSS

`registry:style` + `cssVars` is unreliable for non-color tokens (see
`var(----custom-shadow)` above). Ship CSS as a `registry:file` item and let
consumers `@import` it.

### The distributed skill must stay self-contained

Everything under `.agents/skills/fogui-style/` must reference only its own
`references/`. Never point it at repo-only paths (`registry/...`, `DESIGN.md`),
or it breaks the moment it is copied to
`~/.config/opencode/skills/fogui-style/`. After editing, resync the global copy:

```bash
cp -r .agents/skills/fogui-style ~/.config/opencode/skills/
```
