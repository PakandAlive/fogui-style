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
| `theme` | `registry:style` | 50 light + 49 dark CSS variables (color, sidebar, chart, 18 shadow tokens), `@custom-variant` dark + squircle, `@plugin @toolwind/corner-shape`, shimmer keyframes |
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
- The `@theme inline` block in `globals.css` that maps `--color-*` to your
  variables (created by `shadcn init`). The `theme` item sets variable values; it
  does not create the mappings.
- Chromium gets true squircle corners via `@toolwind/corner-shape`; other
  browsers fall back to plain rounding by design.

## Caveats

1. **`@source` is project-specific.** Foglamp's own `globals.css` contains
   monorepo paths (`@source "../../../apps/**/*.{ts,tsx}"`). The registry does not
   ship those. Ensure your `globals.css` scans your app so Tailwind generates the
   classes. If classes are missing, this is the first thing to check.
2. **Fonts are not shipped.** Inter is self-hosted in Foglamp. Wire your own
   `--font-sans` / `--font-heading` in `@theme inline`. See `DESIGN.md` §5.
3. **Complex CSS fallback.** The `theme` item expresses tokens as `cssVars` and
   the squircle/plugin/keyframes as `css`. If a CLI version drops any of it, a
   byte-faithful copy lives at `registry/theme/foglamp-theme.css` — `@import` it
   after `@import "tailwindcss"` instead.
4. **`registry:style` merges into your CSS.** The `theme` item is not a
   side-by-side drop-in; it deliberately sets your semantic tokens. Install it
   into a project whose design you intend to replace.

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
`@/components/ui/*` aliases, extracts npm and registry dependencies, parses the
`:root` / `.dark` blocks out of `globals.css` into `cssVars`, and regenerates
`registry/ui/`, `registry/lib/`, `registry/hooks/`, `registry/theme/`, and
`registry.json`. **It overwrites local edits to those paths** — commit before
syncing.

Validate before pushing:

```bash
npx shadcn@latest build      # writes public/r/*.json; validates every item
```
