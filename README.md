# FogUI Style

The Foglamp design system, packaged for reuse. Near-monochrome OKLCH color
tokens, a shadow-instead-of-border surface model, squircle radii, Tabler filled
icons, and 56 Base UI + CVA primitives — extracted from the Foglamp app so any
project can reproduce the same look.

This repository is the system's **independent home**. It is self-contained: the
files under `registry/` are the source of truth, not a build artifact.

## What's here

| Path | What it is |
| --- | --- |
| `DESIGN.md` | The authoritative design-system document — philosophy, color, shadows, radii, type, icons, component matrix, anti-patterns. |
| `.agents/skills/design-system/` | An agent skill that enforces the rules when building UI (`SKILL.md` + color/shadow references). |
| `registry.json` | A shadcn GitHub registry — 59 items (theme, utils, use-mobile, 56 primitives). |
| `registry/theme/foglamp-theme.css` | The theme layer: tokens, shadows, squircle variant, keyframes. |
| `registry/ui/`, `registry/lib/`, `registry/hooks/` | Distributable components, `cn()`, and hooks. |
| `scripts/sync-from-foglamp.mjs` | Optional tool to pull upstream changes from the Foglamp repo. |

## Use it

The repository **is** the registry — no build, no hosting. From a project using
Tailwind v4 + shadcn + Base UI:

```bash
# Color system, shadows, radii, squircle variant, motion keyframes
npx shadcn@latest add PakandAlive/fogui-style/theme

# cn() and a hook
npx shadcn@latest add PakandAlive/fogui-style/utils
npx shadcn@latest add PakandAlive/fogui-style/use-mobile

# Any primitive — dependencies resolve automatically
npx shadcn@latest add PakandAlive/fogui-style/button
npx shadcn@latest add PakandAlive/fogui-style/sidebar
```

Then read `DESIGN.md` (or load the skill) before writing UI. The four laws:

1. Near-monochrome base; color only in badge variants.
2. Separate surfaces with a shadow token, never a border.
3. One radius, squircle-aware; buttons/badges are fully round.
4. Filled Tabler icons first, default `size-3.5`.

See `registry/README.md` for the full item map, requirements, and caveats.

## Relationship to Foglamp

The components and tokens originate from the
[Foglamp](https://github.com/foglamp-labs/foglamp) app (`packages/ui`,
`apps/web`). This repo is now self-contained — edit `registry/` directly. When
you want upstream changes:

```bash
node scripts/sync-from-foglamp.mjs --source /path/to/foglamp/packages/ui
```

The script rewrites `@foglamp/ui/*` imports to portable aliases and regenerates
`registry/` and `registry.json`. It overwrites local edits to those paths, so
commit before syncing.

## Validate

```bash
npx shadcn@latest build      # writes public/r/*.json; validates every item
```

## License

Apache 2.0.
