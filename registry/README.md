# Foglamp UI registry

The Foglamp design system shipped as a [shadcn GitHub registry](https://ui.shadcn.com/docs/registry/github).
It exists so another project can reproduce the Foglamp look — color tokens,
shadow-instead-of-border surfaces, squircle radii, and all 56 primitives —
without copying files by hand.

## How it works

`registry.json` lives at the repository root. The shadcn CLI reads it straight
from GitHub, so there is **no build step and no hosting** — the repository is the
registry.

## Install

From any project that already uses **Tailwind v4 + shadcn + Base UI**:

```bash
# Color system, shadows, radii, squircle variant, motion keyframes
npx shadcn@latest add PakandAlive/fogui-style/theme

# cn() helper (clsx + tailwind-merge) and the useIsMobile hook
npx shadcn@latest add PakandAlive/fogui-style/utils
npx shadcn@latest add PakandAlive/fogui-style/use-mobile

# Any primitive — its registryDependencies pull theme/utils/hooks in automatically
npx shadcn@latest add PakandAlive/fogui-style/button
npx shadcn@latest add PakandAlive/fogui-style/sidebar
```

`theme` installs a self-contained `foglamp-theme.css` (into
`@lib/foglamp-theme.css`). Import it once, right after Tailwind:

```css
@import "tailwindcss";
@import "./foglamp-theme.css"; /* adjust to where the file landed */
```

Pin a ref for reproducibility:

```bash
npx shadcn@latest add PakandAlive/fogui-style/button#main
npx shadcn@latest add PakandAlive/fogui-style/button#<commit-sha>
```

Inspect before installing:

```bash
npx shadcn@latest list PakandAlive/fogui-style
npx shadcn@latest view PakandAlive/fogui-style/theme
npx shadcn@latest add PakandAlive/fogui-style/button --dry-run
```

## Items

| Item | Type | Contents |
| --- | --- | --- |
| `theme` | `registry:file` | One self-contained CSS file: 50 light + 49 dark CSS variables (color, sidebar, chart, 18 shadow tokens), the `@theme inline` mappings, `@custom-variant` dark + squircle, `@plugin @toolwind/corner-shape`, shimmer keyframes |
| `utils` | `registry:lib` | `cn()` — clsx + tailwind-merge |
| `use-mobile` | `registry:hook` | `useIsMobile()` |
| 56 primitives | `registry:ui` | Every component in `registry/ui/` |

Each component declares its own npm `dependencies` (e.g. `@base-ui/react`,
`@tabler/icons-react`, `cmdk`, `recharts`, `vaul`, `embla-carousel-react`), its
`registryDependencies` (other primitives it imports, plus `theme` and `utils`),
and installs into the consumer's configured `@ui/` / `@lib/` / `@hooks/` aliases.

## Requirements in the target project

- **Tailwind v4** with shadcn initialized (`components.json`).
- **Base UI**, not Radix. Foglamp primitives use `@base-ui/react` and the Base UI
  `render` prop. Radix's `asChild` will not work.
- A `@import "tailwindcss";` in your global CSS. The `theme` item ships its own
  `@theme inline` mappings, tokens, and variants, so it does not depend on the
  default CSS block from `shadcn init`. Ordering matters: the theme import must
  come after the Tailwind import.
- Chromium gets true squircle corners via `@toolwind/corner-shape`; other
  browsers fall back to plain rounding by design.

## Caveats

1. **`@source` is project-specific.** Foglamp's own `globals.css` contains
   monorepo paths (`@source "../../../apps/**/*.{ts,tsx}"`). The registry does not
   ship those. Ensure your `globals.css` scans your app so Tailwind generates the
   classes. If classes are missing, this is the first thing to check.
2. **Fonts are not shipped.** Inter is self-hosted in Foglamp. Wire your own
   `--font-sans` / `--font-heading` in `@theme inline`. See `DESIGN.md` §5.
3. **The theme is a file, not a merge.** `theme` is `registry:file`: it drops
   `foglamp-theme.css` into the project and you `@import` it. This is deliberate.
   shadcn's `registry:style` + `cssVars` path is unreliable here — its keys are
   not `--`-prefixed, it never overwrites tokens the project already has, and it
   emits invalid `var(----custom-shadow)` for Foglamp's non-color shadow tokens.
   Shipping the whole CSS file is byte-faithful and order-independent.
4. **Token collisions are on you.** Because the theme file defines `--background`,
   `--primary`, etc. in `:root` / `.dark`, importing it overrides those tokens —
   that is the point. Import it last if you need to layer your own values on top.

## Self-contained, with an optional sync

This repository is **self-contained**: `registry/` and `registry.json` are the
source of truth. Edit them directly.

They originate from the Foglamp repo. To pull upstream changes, run the sync
script:

```bash
node scripts/sync-from-foglamp.mjs --source /path/to/foglamp/packages/ui
# or: FOGLAMP_UI_SRC=/path/to/foglamp/packages/ui node scripts/sync-from-foglamp.mjs
# default source: ../foglamp/foglamp-src/packages/ui
```

It rewrites `@foglamp/ui/*` imports to portable `@/lib/*` and
`@/components/ui/*` aliases, extracts npm and registry dependencies, assembles a
self-contained `registry/theme/foglamp-theme.css` (tokens + `@theme inline` +
variants + keyframes), and regenerates `registry/ui/`, `registry/lib/`,
`registry/hooks/`, `registry/theme/`, and `registry.json`. **It overwrites local edits to those paths** — commit before
syncing.

Validate before pushing:

```bash
npx shadcn@latest build      # writes public/r/*.json; validates every item
```
