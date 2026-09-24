---
name: FogUI Style
description: Apply the Foglamp design language to UI — near-monochrome OKLCH tokens, shadow-instead-of-border surfaces, a single squircle-aware radius, Tabler filled icons, and the Base UI + CVA component set. Use when building or reviewing UI, adding or restyling components, checking visual consistency, or installing the design system in a new project.
---

# Foglamp Design System

The rules that make Foglamp UI look like Foglamp UI. Follow them literally; every
rule below is a hard rule.

## When to use

- Building or reviewing UI in a project that uses this design system.
- Adding, restyling, or extending a component.
- Installing the design system in a new project.

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
   className. Add a token first if one is missing.

## Install into a project

Requires Tailwind v4, shadcn initialized (`components.json`), and Base UI
(`@base-ui/react`), not Radix.

```bash
# Theme layer: tokens, shadows, radii, squircle variant, keyframes
npx shadcn@latest add PakandAlive/fogui-style/theme

# cn() and the useIsMobile hook
npx shadcn@latest add PakandAlive/fogui-style/utils
npx shadcn@latest add PakandAlive/fogui-style/use-mobile

# Any primitive, by name — its dependencies resolve automatically
npx shadcn@latest add PakandAlive/fogui-style/button
npx shadcn@latest add PakandAlive/fogui-style/badge

# Marketing pages only: display face + fog
npx shadcn@latest add PakandAlive/fogui-style/marketing
npx shadcn@latest add PakandAlive/fogui-style/noise-overlay
```

Then, in order:

1. **Import the theme.** `theme` ships a self-contained CSS file. In your global
   CSS, right after the Tailwind import, add
   `@import "./foglamp-theme.css";` (adjust the path). It carries the tokens, the
   `@theme inline` mappings, the squircle variant, and the keyframes.
2. **Point `@source` at your app.** If your global CSS carries monorepo
   `@source` paths, repoint them at your source tree, or Tailwind generates no
   classes.
3. **Wire fonts.** The theme maps `font-sans` to `var(--font-sans)`, so the
   project must define `--font-sans`. For marketing, load Host Grotesk as
   `--font-host-grotesk`. See `references/typography.md`.
4. **Verify both themes.** Every screen must look correct in light and dark.

Do not hand-port tokens from memory — install the `theme` item.

## Decision flow

- Need a surface edge? → `shadow-(--custom-shadow)`. Never a border.
- Need a status color? → a `Badge` variant (`green`/`blue`/`amber`/…), never a
  raw Tailwind hue on chrome.
- Need gray? → `neutral` or a semantic token. Never
  `slate`/`gray`/`zinc`/`stone`.
- Need a color not in the system? → add a token first.
- Need a button variant? → compose with `className`, or add a CVA variant to the
  primitive if reused.
- Need a component to render as another element? → Base UI `render` prop. Never
  Radix `asChild`.
- Marketing page (landing, hero, product)? → `font-display`, and fog via
  `.fog-layer` + `FogBank`. Never in the app dashboard.

## References

Read the one a task points at; each is self-contained.

- `references/colors.md` — token tables (base, sidebar, chart, badge accents).
- `references/shadows.md` — every shadow token, its values, and the border rule.
- `references/typography.md` — the three faces and where each is allowed.
- `references/icons.md` — Tabler rules and sizing.
- `references/components.md` — inventory, Button/Badge, composition, spacing, motion.
- `references/anti-patterns.md` — the hard-ban table.
- `references/marketing.md` — the display face and the fog atmosphere.
