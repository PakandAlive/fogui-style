# FogUI Style

The Foglamp design system, packaged for reuse. Near-monochrome OKLCH color
tokens, a shadow-instead-of-border surface model, squircle radii, Tabler filled
icons, 56 Base UI + CVA primitives, and an enhanced chart layer — extracted from
the Foglamp app so any project can reproduce the same look.

This repository is the system's **independent home**. It is self-contained: the
files under `registry/` are the source of truth, not a build artifact.

## What's here

| Path | What it is |
| --- | --- |
| `DESIGN.md` | The authoritative design-system document — philosophy, color, shadows, radii, type, icons, component matrix, anti-patterns. |
| `.agents/skills/fogui-style/` | Self-contained agent skill that enforces the rules when building UI (`SKILL.md` + 9 references: troubleshooting, colors, shadows, typography, icons, charts, components, anti-patterns, marketing). |
| `registry.json` | A shadcn GitHub registry — 62 items (theme, marketing, utils, use-mobile, 56 primitives, `noise-overlay`, `chart-plus`). |
| `registry/theme/foglamp-theme.css` | The theme layer: tokens, shadows, squircle variant, keyframes. |
| `registry/theme/foglamp-marketing.css` | The marketing layer: `font-display` (Host Grotesk), fog drift keyframes, `.fog-layer`. |
| `registry/ui/`, `registry/charts/`, `registry/lib/`, `registry/hooks/` | Distributable components (incl. `noise-overlay`), the `chart-plus` layer, `cn()`, and hooks. |
| `scripts/sync-from-foglamp.mjs` | Optional tool to pull upstream changes from the Foglamp repo. |

## Use it

The repository **is** the registry — no build, no hosting. From a project using
Tailwind v4 + shadcn + Base UI:

```bash
# Color system, shadows, radii, squircle variant, motion keyframes
npx shadcn@latest add PakandAlive/fogui-style/theme

# Marketing layer (font-display + fog drift) and its textures
npx shadcn@latest add PakandAlive/fogui-style/marketing
npx shadcn@latest add PakandAlive/fogui-style/noise-overlay

# cn() and a hook
npx shadcn@latest add PakandAlive/fogui-style/utils
npx shadcn@latest add PakandAlive/fogui-style/use-mobile

# Any primitive — dependencies resolve automatically
npx shadcn@latest add PakandAlive/fogui-style/button
npx shadcn@latest add PakandAlive/fogui-style/sidebar

# Chart enhancement layer (theme-aware multi-color ramps, frosted tooltip,
# legend/dot/background variants, donut)
npx shadcn@latest add PakandAlive/fogui-style/chart-plus
```

`theme` and `marketing` land self-contained CSS files; import them once after
Tailwind (`marketing` after `theme`):

```css
@import "tailwindcss";
@import "./foglamp-theme.css"; /* adjust to where the files landed */
@import "./foglamp-marketing.css";
```

Then read `DESIGN.md` (or load the skill) before writing UI. The five laws:

1. Near-monochrome base; color only in badge variants.
2. Separate surfaces with a shadow token, never a border.
3. One radius, squircle-aware; buttons/badges are fully round.
4. Filled Tabler icons first, default `size-3.5`.
5. Token or nothing; never hardcode color in a className.

See `registry/README.md` for the full item map, requirements, and caveats.

## Agent skill

`.agents/skills/fogui-style/` is a self-contained skill: it references only its
own `references/`, so it works outside this repository. Install it once, globally,
and every project can load it:

```bash
mkdir -p ~/.config/opencode/skills
cp -r .agents/skills/fogui-style ~/.config/opencode/skills/
```

The skill ID is `fogui-style` (the directory name). Ask the agent to use the
`fogui-style` skill, or let it discover the skill from its `description`.
Alternative locations OpenCode scans: `~/.claude/skills`, `~/.agents/skills`
(global) and `.opencode/skills`, `.claude/skills`, `.agents/skills` (project).

## Relationship to Foglamp

The components and tokens originate from the
[Foglamp](https://github.com/foglamp-labs/foglamp) app (`packages/ui`,
`apps/web`). This repo is now self-contained — edit `registry/` directly. When
you want upstream changes:

```bash
node scripts/sync-from-foglamp.mjs \
  --source /path/to/foglamp/packages/ui \
  --web /path/to/foglamp/apps/web/src
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
