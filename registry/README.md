# Foglamp UI registry

The Foglamp design system shipped as a [shadcn GitHub registry](https://ui.shadcn.com/docs/registry/github).
It exists so another project can reproduce the Foglamp look — color tokens,
shadow-instead-of-border surfaces, squircle radii, all 56 primitives, and an
enhanced chart layer — without copying files by hand.

## How it works

`registry.json` lives at the repository root. The shadcn CLI reads it straight
from GitHub, so there is **no build step and no hosting** — the repository is the
registry.

## Install

From any project that already uses **Tailwind v4 + shadcn + Base UI**:

```bash
# Color system, shadows, radii, squircle variant, motion keyframes
npx shadcn@latest add PakandAlive/fogui-style/theme

# Marketing layer: font-display (Host Grotesk) + fog drift + .fog-layer
npx shadcn@latest add PakandAlive/fogui-style/marketing

# Marketing textures: FilmGrain / FogBank / HeroGrain
npx shadcn@latest add PakandAlive/fogui-style/noise-overlay

# cn() helper (clsx + tailwind-merge) and the useIsMobile hook
npx shadcn@latest add PakandAlive/fogui-style/utils
npx shadcn@latest add PakandAlive/fogui-style/use-mobile

# Any primitive — its registryDependencies pull theme/utils/hooks in automatically
npx shadcn@latest add PakandAlive/fogui-style/button
npx shadcn@latest add PakandAlive/fogui-style/sidebar

# Chart enhancement layer: theme-aware multi-color ramps, frosted tooltip,
# legend/dot/background variants, and a donut (installs chart-*.tsx into @ui/)
npx shadcn@latest add PakandAlive/fogui-style/chart-plus
```

`theme` installs a self-contained `foglamp-theme.css` (into
`@lib/foglamp-theme.css`). Import it once, right after Tailwind:

```css
@import "tailwindcss";
@import "./foglamp-theme.css"; /* adjust to where the file landed */
```

`marketing` installs `foglamp-marketing.css` the same way; import it after the
theme. `noise-overlay` is an ordinary component.

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
| `marketing` | `registry:file` | Marketing layer CSS: the `--font-display` mapping (Host Grotesk), the `fog-drift-*` keyframes, and the `.fog-layer` utility |
| `utils` | `registry:lib` | `cn()` — clsx + tailwind-merge |
| `use-mobile` | `registry:hook` | `useIsMobile()` |
| `noise-overlay` | `registry:ui` | `FilmGrain` (static SVG speckle), `FogBank` (fractal-noise haze), `HeroGrain` |
| 56 primitives | `registry:ui` | Every component in `registry/ui/` |
| `chart-plus` | `registry:ui` | Six files (`chart-plus`, `chart-tooltip`, `chart-legend`, `chart-dot`, `chart-background`, `chart-donut`): Foglamp's chart enhancement layer, the motion-free subset of its internal charts |

Each component declares its own npm `dependencies` (e.g. `@base-ui/react`,
`@tabler/icons-react`, `cmdk`, `recharts`, `vaul`, `embla-carousel-react`), its
`registryDependencies` (other primitives it imports, plus `theme` and `utils`),
and installs into the consumer's configured `@ui/` / `@lib/` / `@hooks/` aliases.

The standard `chart` primitive (a plain shadcn/recharts wrapper, mirroring
`packages/ui`) and `chart-plus` are independent — use either, not both. The
former is the design-system baseline; the latter reproduces the charts Foglamp
actually renders. See the skill's `references/charts.md`.

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
- **Host Grotesk, if you use `marketing`.** The marketing item maps
  `--font-display` to `var(--font-host-grotesk)` but does not bundle the font.
  Load it yourself (e.g. `next/font/google` `Host_Grotesk` with
  `variable: "--font-host-grotesk"`), or override `--font-display`.

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
node scripts/sync-from-foglamp.mjs \
  --source /path/to/foglamp/packages/ui \
  --web /path/to/foglamp/apps/web/src
# or: FOGLAMP_UI_SRC=... FOGLAMP_WEB_SRC=... node scripts/sync-from-foglamp.mjs
# defaults: ../foglamp/foglamp-src/packages/ui and ../foglamp/foglamp-src/apps/web/src
```

It rewrites `@foglamp/ui/*` imports to portable `@/lib/*` and
`@/components/ui/*` aliases, extracts npm and registry dependencies, assembles
self-contained `registry/theme/foglamp-theme.css` (tokens + `@theme inline` +
variants + keyframes) and `registry/theme/foglamp-marketing.css` (`font-display`
+ fog drift), copies the marketing textures to `registry/ui/noise-overlay.tsx`,
portions the motion-free subset of `apps/web`'s charts to `registry/charts/`,
and regenerates `registry/ui/`, `registry/charts/`, `registry/lib/`,
`registry/hooks/`, `registry/theme/`, and `registry.json`. **It overwrites local edits to those paths** — commit before
syncing.

Validate before pushing:

```bash
npx shadcn@latest build      # writes public/r/*.json; validates every item
```
