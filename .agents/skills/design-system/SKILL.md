---
name: design-system
description: Apply or replicate the Foglamp design language — near-monochrome OKLCH tokens, shadow-instead-of-border surfaces, single-radius squircle corners, Tabler filled icons, and the Base UI + CVA component set. Use when building or reviewing UI, adding components, checking visual consistency, or porting the Foglamp look into another project.
metadata:
  author: foglamp
  version: "1.0.0"
  argument-hint: <file-or-pattern | "replicate">
---

# Foglamp Design System

The rules that make Foglamp UI look like Foglamp UI. Follow them literally; every
rule below is a hard rule. The full reference is `DESIGN.md` at the repo root.

## When to use this skill

- Building any new UI in this repo.
- Reviewing a screen for visual consistency.
- Replicating the Foglamp look in a different project.

## Five laws

1. **Near-monochrome.** The base palette is achromatic (`oklch(… 0 0)`). The only
   chromatic base token is `--destructive`. Color appears only in badge variants.
2. **Shadow, not border.** Separate surfaces with a `--custom-shadow-*` token.
   Never `border` / `border-*` / `divide-*`.
3. **One radius, squircle-aware.** Everything derives from `--radius`
   (`0.625rem`). Buttons/badges are `rounded-full`. Large surfaces get
   `rounded-lg squircle:rounded-3xl corner-squircle`.
4. **Filled icons first.** `@tabler/icons-react`, prefer `*Filled`, default
   `size-3.5`. Never mix icon libraries.
5. **Token or nothing.** Never hardcode `#hex` / `rgb()` / `oklch()` in a
   className. Add a token to `globals.css` if one is missing.

## Replicating into a new project

This system ships as a shadcn GitHub registry. From the new project:

```bash
# 1. Theme layer: color tokens, shadows, radii, squircle variant, keyframes
npx shadcn@latest add PakandAlive/fogui-style/theme

# 2. Shared utils (cn) and the useIsMobile hook
npx shadcn@latest add PakandAlive/fogui-style/utils

# 3. Any primitive, by name
npx shadcn@latest add PakandAlive/fogui-style/button
npx shadcn@latest add PakandAlive/fogui-style/badge

# 4. Marketing pages only: display face + fog
npx shadcn@latest add PakandAlive/fogui-style/marketing
npx shadcn@latest add PakandAlive/fogui-style/noise-overlay
```

Then, in order:

1. **Import the theme.** `theme` ships a self-contained `foglamp-theme.css`; add
   `@import "./foglamp-theme.css";` (adjust the path) right after
   `@import "tailwindcss";` in your global CSS. It carries the tokens, the
   `@theme inline` mappings, the squircle variant, and the keyframes.
2. **Fix `@source`.** Foglamp's `globals.css` contains monorepo paths
   (`@source "../../../apps/**/*.{ts,tsx}"`). Remove them or repoint them at the
   target project. If you skip this, Tailwind generates no classes.
3. **Wire fonts** (see `DESIGN.md` §5). Self-host Inter; add the
   `--font-sans` / `--font-heading` mapping in `@theme inline`. For marketing
   pages, load Host Grotesk as `--font-host-grotesk` (§13).
4. **Install npm deps** declared by the installed items (`@base-ui/react`,
   `@tabler/icons-react`, `@toolwind/corner-shape`, `class-variance-authority`,
   `clsx`, `tailwind-merge`, `tw-animate-css`).
5. **Verify both themes.** Every screen must look correct in light and dark.

Do not hand-port tokens from memory — install the `theme` item. If you must copy
manually, copy verbatim from `registry/theme/foglamp-theme.css`.

## Decision flow

- Need a surface edge? → `shadow-(--custom-shadow)`. Not a border.
- Need a status color? → a badge variant (`green`/`blue`/`amber`/…), never a raw
  Tailwind hue on chrome.
- Need gray? → `neutral` or a semantic token. Never `slate`/`gray`/`zinc`/`stone`.
- Need a color not in the system? → add a token to `globals.css` first.
- Need a button variant? → compose with `className`, or add a CVA variant to the
  primitive in `registry/ui` if reused.
- Need a component to render as another element? → Base UI `render` prop. Never
  Radix `asChild`.
- Marketing page (landing, hero, product)? → `font-display`, and fog via
  `.fog-layer` + `FogBank` (§13). Never in the app dashboard.

## References

- `references/colors.md` — full token tables (base, sidebar, chart, badge accents).
- `references/shadows.md` — every shadow token and its role.
- Repo root `DESIGN.md` — complete system, anti-pattern table, replication steps.
- Repo root `registry/README.md` — item map, target-project requirements, caveats.
