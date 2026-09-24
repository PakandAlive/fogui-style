# Foglamp Design System

The single source of truth for Foglamp's UI language, color system, and visual
rules. This repository (fogui-style) is the system's independent home: the
authoritative theme is `registry/theme/foglamp-theme.css`, the authoritative
components are in `registry/ui/`, and the machine-readable distribution is
`registry.json`. The design was extracted from the Foglamp codebase
(`packages/ui`, `apps/web`); when this document and `registry/` disagree, the
files win — then fix this document.

This file is written to be **portable**. A new project should be able to read it
top to bottom and reproduce the same look. The machine-readable counterpart
lives in `registry.json`; the AI-facing counterpart is the self-contained skill
in `.agents/skills/fogui-style/`.

---

## 1. Design philosophy

Five decisions define the look. Break any of them and it stops being Foglamp.

1. **Near-monochrome base.** The entire semantic palette is achromatic
   (`oklch(… 0 0)` — chroma `0`). Color is reserved for meaning: `destructive`
   for danger, and one chromatic accent per badge when a status needs it.
   There is no brand hue in the chrome.
2. **Shadow instead of border.** Surfaces are separated by layered
   `box-shadow` tokens, never by `border` / `divide-*`. The hairline you see is
   a `0 0 0 0.5px` ring inside the shadow stack, not a CSS border.
3. **Squircle corners.** Radii come from a single `--radius` and are bumped
   bigger under the `squircle:` variant so capable browsers draw
   `corner-shape: squircle`. Buttons and badges are fully round
   (`rounded-full`).
4. **Filled icons first.** Icons are Tabler, and the `*Filled` variant is the
   default. Outline is the fallback, not the norm.
5. **Token or nothing.** Colors, shadows, radii, and fonts are referenced
   through tokens (`bg-background`, `shadow-(--custom-shadow)`), never
   hardcoded as hex / `rgb()` / `oklch()` in components.

Stack the system sits on: **React 19 + Tailwind v4 + Base UI + CVA**. It is a
shadcn/ui-derived system (`style: base-vega`, `baseColor: neutral`,
`iconLibrary: tabler`).

---

## 2. Color system

### 2.1 Base semantic tokens

Defined in `registry/theme/foglamp-theme.css` under `:root` (light) and `.dark`,
and shipped as the `theme` registry item. All values are OKLCH. The base palette
is achromatic on purpose.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--background` | `oklch(0.99 0 0)` | `oklch(0.17 0 0)` | Page background |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Primary text |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Card surface |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text on card |
| `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Popover / menu surface |
| `--popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text on popover |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Primary action |
| `--primary-foreground` | `oklch(0.98 0 0)` | `oklch(0.205 0 0)` | Text on primary |
| `--secondary` | `oklch(0.95 0 0)` | `oklch(0.269 0 0)` | Secondary surface |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on secondary |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Muted surface |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Secondary text |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover / highlight surface |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Danger |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Token only — see §3 |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Input edge |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Focus ring |

`--destructive` is the **only** chromatic token in the base palette
(hue `27`). `--border` / `--input` are kept for primitives that need them, but
product UI separation uses shadows (§3).

### 2.2 Sidebar tokens

| Token | Light | Dark |
| --- | --- | --- |
| `--sidebar` | `oklch(0.975 0 0)` | `oklch(0.145 0 0)` |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.623 0.214 259.815)` |
| `--sidebar-primary-foreground` | `oklch(0.98 0 0)` | `oklch(0.97 0.014 254.604)` |
| `--sidebar-accent` | `oklch(0.95 0 0)` | `oklch(0.269 0 0)` |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` |

Note the inconsistency: `--sidebar-primary` is achromatic in light but uses
hue `259` (blue) in dark. This is inherited shadcn behaviour; keep it.

### 2.3 Chart tokens

Charts are grayscale — a deliberate ramp, not a categorical palette.

| Token | Light / Dark |
| --- | --- |
| `--chart-1` | `oklch(0.87 0 0)` |
| `--chart-2` | `oklch(0.556 0 0)` |
| `--chart-3` | `oklch(0.439 0 0)` |
| `--chart-4` | `oklch(0.371 0 0)` |
| `--chart-5` | `oklch(0.269 0 0)` |

### 2.4 Chromatic accents — badges only

Color enters the system through **badge variants**, and nowhere else for product
chrome. Each variant pairs a Tailwind `500` tint with a `700` (light) / `300`
(dark) text, plus a matching colored shadow (§3.2).

| Variant | Tint | Light text | Dark text |
| --- | --- | --- | --- |
| `green` | `green-500/10` | `green-700` | `green-300` |
| `blue` | `blue-500/10` | `blue-700` | `blue-300` |
| `amber` | `amber-500/10` | `amber-700` | `amber-300` |
| `orange` | `orange-500/10` | `orange-600` | `orange-400` |
| `emerald` | `emerald-500/10` | `emerald-700` | `emerald-300` |
| `rose` | `rose-500/10` | `rose-700` | `rose-400` |
| `red` | `red-500/10` | `red-700` | `red-400` |
| `violet` | `violet-500/10` | `violet-700` | `violet-300` |
| `fuchsia` | `fuchsia-500/10` | `fuchsia-700` | `fuchsia-300` |
| `sky` | `sky-500/10` | `sky-700` | `sky-300` |

Rule: pair the `500` tint with its `100`/`950`-range text so it reads in **both**
modes. Never invent a new hue outside this list without adding a shadow token
for it.

### 2.5 Allowed and banned palettes

- **Allowed raw grayscale:** Tailwind `neutral` only (e.g. `bg-neutral-800`,
  `text-neutral-500`). The button/badge primitives use it for the rare
  non-semantic shade.
- **Banned raw grayscale:** `slate`, `gray`, `zinc`, `stone`. They drift from the
  tonal range and clash with the semantic tokens.
- **Never** hardcode `#hex`, `rgb()`, `oklch()` in a `className` or `style`. If a
  value is missing, add a token to `globals.css` first.

---

## 3. Shadow and border system

### 3.1 The rule

> A surface is separated by a shadow token, never a `border`, `border-*`, or
> `divide-*`.

The shadow stack always starts with a `0 0 0 0.5px` (or `0.75px` in dark) ring
that reads as a 1px hairline, then adds depth. This is why Foglamp UI has crisp
edges without borders.

Use `shadow-(--custom-shadow)` for the default surface edge. Use the color
variants to tint the edge to match a semantic state.

### 3.2 Shadow tokens

Light and dark are different stacks — do not reuse one for the other.

| Token | Role |
| --- | --- |
| `--custom-shadow` | Default surface edge + depth |
| `--custom-shadow-chrome` | Framed/demo chrome, firmer hairline, top-edge catch |
| `--custom-shadow-lifted` | Card floating above other cards |
| `--custom-outline-shadow` | Outline buttons; light mirrors `--custom-shadow` |
| `--custom-shadow-primary` | Primary (near-black / near-white) action |
| `--custom-shadow-secondary` | Secondary surface |
| `--custom-shadow-destructive` | Danger affordance |
| `--custom-shadow-green` | Green badge / status |
| `--custom-shadow-blue` | Blue badge / status |
| `--custom-shadow-amber` | Amber badge / status |
| `--custom-shadow-orange` | Orange badge / status |
| `--custom-shadow-emerald` | Emerald badge / status |
| `--custom-shadow-rose` | Rose badge / status |
| `--custom-shadow-red` | Red badge / status |
| `--custom-shadow-slate` | Slate badge / status |
| `--custom-shadow-violet` | Violet badge / status |
| `--custom-shadow-fuchsia` | Fuchsia badge / status |
| `--custom-shadow-sky` | Sky badge / status |

Light values (default stack):

```css
--custom-shadow:
  0px 0px 0px 0.5px rgba(0, 0, 0, 0.06),
  0px 0.5px 2px -0.5px rgba(0, 0, 0, 0.06),
  0px 1px 4px 0px rgba(0, 0, 0, 0.04);
```

Dark values add an inset top highlight plus a dark ring:

```css
--custom-shadow:
  inset 0 0.75px 0 0 rgba(255, 255, 255, 0.03),
  inset 0 0 0 0.75px rgba(255, 255, 255, 0.03),
  0 0 0 0.75px rgba(0, 0, 0, 0.1), 0 2px 2px 0 rgba(0, 0, 0, 0.1),
  0 4px 4px 0 rgba(0, 0, 0, 0.1), 0 8px 8px 0 rgba(0, 0, 0, 0.1);
```

Colored variants follow one recipe (light):

```css
--custom-shadow-<hue>:
  0px 0px 0px 0.5px   rgba(<hue-500>, 0.25),
  0px 0.5px 2px -0.5px rgba(<hue-500>, 0.18),
  0px 2px 4px 0px      rgba(<hue-500>, 0.12);
```

Dark keeps the same geometry with an inset highlight and roughly half the alpha:

```css
--custom-shadow-<hue>:
  inset 0 0.5px 0 0      rgba(<hue-500>, 0.03),
  0 0 0 0.5px            rgba(<hue-500>, 0.18),
  0 0.5px 2px 0          rgba(<hue-500>, 0.1);
```

### 3.3 Usage

```tsx
// Correct
<div className="rounded-lg shadow-(--custom-shadow) bg-card" />
<span className="shadow-(--custom-shadow-green)" />

// Wrong — never do this
<div className="rounded-lg border border-border" />
<div className="divide-y divide-border" />
```

---

## 4. Radius system

A single `--radius: 0.625rem` drives everything through `@theme inline`:

| Utility | Value |
| --- | --- |
| `--radius-sm` | `calc(var(--radius) - 4px)` |
| `--radius-md` | `calc(var(--radius) - 2px)` |
| `--radius-lg` | `var(--radius)` |
| `--radius-xl` | `calc(var(--radius) + 4px)` |
| `--radius-2xl` | `calc(var(--radius) + 8px)` |
| `--radius-3xl` | `calc(var(--radius) + 12px)` |
| `--radius-4xl` | `calc(var(--radius) + 16px)` |

**Buttons and badges are fully round** (`rounded-full`), regardless of size.
Cards, inputs, popovers, and menus use the `rounded-lg`/`rounded-xl` range.

### Squircle variant

The radii are sized for squircle geometry, which reads less round than a
circular arc at the same radius. So the bumped radius only applies where the
browser supports `corner-shape: squircle`:

```css
@custom-variant squircle (@supports (corner-shape: squircle));
```

Usage pattern — small plain-round fallback, larger squircle when supported:

```tsx
<div className="rounded-lg squircle:rounded-3xl corner-squircle" />
```

Not every element needs it; it is for large surfaces (cards, panels, media
frames).

---

## 5. Typography

Three faces, three jobs. Do not cross them.

| Face | CSS variable | Loaded via | Scope |
| --- | --- | --- | --- |
| **Inter** (self-hosted variable) | `--font-sans` | `next/font/local` from rsms/inter woff2 | Everything in the app |
| **Host Grotesk** | `--font-host-grotesk` → `--font-display` | `next/font/google` | Marketing / product-page headings only |
| **Geist Mono** | `--font-geist-mono` | `next/font/google` | Reserved for mono contexts |

Mapping in `globals.css`:

```css
@theme inline {
  --font-sans: var(--font-sans);
  --font-heading: var(--font-sans);
}
```

Marketing layer adds the display face in `apps/web/src/index.css`:

```css
@theme inline {
  --font-display: var(--font-host-grotesk);
}
```

Rules:

- Inter is **self-hosted** from the canonical rsms/inter release, not Google
  Fonts (Google serves an older, feature-stripped build). Files live in
  `apps/web/src/app/fonts/`.
- The dashboard is Inter everywhere. `font-display` is marketing only.
- Never `<link rel="stylesheet">` a Google Fonts URL. Never `@import` a font in
  CSS.

> Known gap: `layout.tsx` declares `--font-geist-mono` but `globals.css` never
> maps it to `--font-mono`, so Tailwind's `font-mono` currently resolves to the
> default stack, not Geist Mono. Fix by adding
> `--font-mono: var(--font-geist-mono);` to `@theme inline` if mono is meant to
> be Geist. **When replicating, decide this explicitly.**

---

## 6. Icons

- Library: **`@tabler/icons-react`** only. Never mix in `lucide-react`,
  `react-icons`, etc.
- **Prefer the `*Filled` variant** when one exists (`IconPhotoFilled` over
  `IconPhoto`). Fall back to outline only when no `*Filled` exists (e.g.
  `IconLoader2`, `IconChevronDown`) or the user asks for outline.
- Sizing via Tailwind, default `size-3.5`:
  - `size-3` — compact: badges, dense table cells
  - `size-3.5` — default
  - `size-4` — medium emphasis: page headers, primary actions
- Never add margin (`mr-2`) to an icon inside a `<Button>`; the button already
  spaces children with `gap-*`.

---

## 7. Components

### 7.1 Inventory

55 primitives, shadcn-style, built on **Base UI** (`@base-ui/react`) with
**CVA** variants. Source: `registry/ui/`.

`accordion alert alert-dialog aspect-ratio avatar badge breadcrumb button
button-group calendar card carousel chart checkbox collapsible combobox command
context-menu dialog direction drawer dropdown-menu empty field hover-card input
input-group input-otp item kbd label loader menubar native-select
navigation-menu pagination popover progress radio-group resizable scroll-area
select separator sheet sidebar skeleton slider sonner spinner switch table tabs
textarea toggle toggle-group tooltip`

Composition rules:

- Use the Base UI **`render` prop** to render a primitive as another element
  (`<Button render={<Link href="/x" />}>`). **Never** Radix's `asChild`.
- Extend by **composing**; add a CVA variant in the package only if reused.
- Never install a second component library. Never reimplement a primitive in the
  app.

### 7.2 Button

Base classes include `rounded-full`, `text-sm font-medium`, `active:scale-[0.97]`,
and a `1.5px` focus ring.

Variants (7):

| Variant | Surface | Shadow |
| --- | --- | --- |
| `default` | `bg-neutral-800 dark:bg-neutral-100` | `--custom-shadow-primary` |
| `outline` | `bg-background` hover `bg-muted` | `--custom-outline-shadow` |
| `secondary` | `bg-secondary` | `--custom-shadow-secondary` |
| `ghost` | transparent, hover `bg-muted` | none |
| `ghost-destructive` | transparent, hover red tint | none |
| `destructive` | `bg-destructive/10 text-destructive` | `--custom-shadow-destructive` |
| `link` | underline, transparent at rest | none |

Sizes (8): `xs h-6`, `sm h-7`, `default h-8`, `lg h-8.5`, `icon size-8`,
`icon-xs size-6`, `icon-sm size-8`, `icon-lg size-10`. All round.

### 7.3 Badge

Base: `rounded-full`, `capitalize`, `font-medium`, `w-fit`.

Variants (13): `default`, `secondary`, `destructive`, the 10 chromatic variants
from §2.4, and `outline`. Each carries its matching shadow token.

Sizes (3): `sm h-4 text-[10px]`, `md h-5 text-xs`, `lg h-6 text-sm`.

Add an icon alongside the text where it clarifies state.

### 7.4 Other primitives — noteworthy conventions

- **Input with icon/prefix/suffix:** always `InputGroup`
  (`InputGroupInput` / `InputGroupTextarea` / `InputGroupAddon`). Never fake a
  prefix with absolute positioning and padding.
- **Sidebar:** `<Sidebar variant="inset" />` only. Wrap in `SidebarProvider`,
  place content in `SidebarInset`. Handle scroll in the consumer layout
  (`h-svh min-h-0` on provider, `overflow-hidden` on inset, `overflow-y-auto`
  on inner main).
- **Tables:** the shadcn `<Table>` primitive. No TanStack Table / AG Grid.
- **Dialogs:** the `<Dialog>` primitive. No custom overlay/portal logic.
- **Loading / empty:** `<Skeleton>` for placeholders, `<Empty>` for zero-states,
  `<IconLoader2 className="size-4 animate-spin" />` for spinners. Never render a
  bare "Loading…" string.

---

## 8. Spacing and layout

- Keep spacing on Tailwind's scale (`gap-2`, `p-4`, `space-y-6`). No arbitrary
  `p-[13px]` unless justified — and if so, leave a one-line comment.
- `cursor-pointer` on every clickable item.
- Merge classes with `cn()` from `@foglamp/ui/lib/utils` (re-exports the `cn`
  package).

---

## 9. Motion

- Default to `tw-animate-css` utilities (`animate-in`, `fade-in`,
  `slide-in-from-*`, `animate-spin`).
- **Never** add `motion/react` (Framer Motion) unless explicitly requested. It is
  heavier than most UI work needs.
- Respect `prefers-reduced-motion` for any bespoke keyframe animation (see the
  `page-fade-in` / `fog-layer` patterns in `apps/web/src/index.css`).

---

## 10. Anti-patterns (hard bans)

| Never | Instead |
| --- | --- |
| `border`, `border-*`, `divide-*` for separation | a `--custom-shadow-*` token |
| `slate` / `gray` / `zinc` / `stone` | `neutral`, or a semantic token |
| Hardcoded `#hex` / `rgb()` / `oklch()` in a className | add a token to `globals.css` |
| `alert()` or a custom toast | `toast.success` / `toast.error` from `sonner` |
| `<a href>` for in-app navigation | `<Link>` from `next/link` |
| Raw `<img>` | `<Image>` from `next/image` |
| A second icon / component / table / date library | the pinned one |
| Radix `asChild` | Base UI `render` prop |
| Reimplementing a primitive in the app | extend `@foglamp/ui` |
| `motion/react` by default | `tw-animate-css` |
| Global state library (Zustand/Redux/Jotai) | `useState` + TanStack Query |

---

## 11. Replicating this system in a new project

The intended path is the shadcn GitHub registry (see §12), which handles the
mechanical parts for you:

```bash
npx shadcn@latest add PakandAlive/fogui-style/theme
npx shadcn@latest add PakandAlive/fogui-style/utils
```

`theme` is a file item: it drops a self-contained `foglamp-theme.css` into the
project. Import it once, right after Tailwind:

```css
@import "tailwindcss";
@import "./foglamp-theme.css"; /* adjust to where the file landed */
```

Manual path, if you copy instead of install:

1. Copy `registry/theme/foglamp-theme.css` into the target project and `@import`
   it after `@import "tailwindcss"`. It is self-contained: the `:root` / `.dark`
   tokens, the `@theme inline` mappings, the `@custom-variant` dark and squircle
   declarations, the `@plugin`, and the `shimmer` keyframes.
2. Copy the `@layer base` block (body tokens, thin scrollbars, autofill fix).
3. Install deps: `@base-ui/react`, `@tabler/icons-react`,
   `@toolwind/corner-shape`, `class-variance-authority`, `clsx`,
   `tailwind-merge`, `tw-animate-css`, plus per-component deps (see
   `registry.json`).
4. Set up fonts (§5). Inter should be self-hosted.
5. **Rewrite `@source`.** If your `globals.css` carries monorepo `@source`
   paths, repoint them at the target project, or Tailwind will not scan the app.
6. Copy component files from `registry/ui/`; their imports already use
   `@/lib/utils` and `@/components/ui/*`, which the shadcn CLI (or your own
   aliases) resolve.

---

## 12. Machine-readable distribution

`registry.json` at the repository root exposes this system as a shadcn GitHub
registry. Consumers install items directly:

```bash
# Theme tokens + shadows + squircle (the color system)
npx shadcn@latest add PakandAlive/fogui-style/theme

# Marketing layer: display font + fog atmosphere
npx shadcn@latest add PakandAlive/fogui-style/marketing
npx shadcn@latest add PakandAlive/fogui-style/noise-overlay

# Utilities and hooks
npx shadcn@latest add PakandAlive/fogui-style/utils

# A single primitive
npx shadcn@latest add PakandAlive/fogui-style/button
```

See `registry/README.md` for the full item map and caveats.

---

## 13. Marketing layer

The app dashboard runs on Inter and shadow-only surfaces. Marketing and product
pages layer on a second, deliberately theatrical treatment: a display face and
drifting fog. It ships as `marketing` (CSS) plus `noise-overlay` (components) and
is **opt-in** — nothing in §1–§10 depends on it.

### 13.1 Display face

- `--font-display` maps to `var(--font-host-grotesk)`. `font-display` is used on
  marketing headings only; the dashboard stays on `font-sans` (Inter).
- **Host Grotesk** (Google Fonts) is not bundled. Load it and expose it as
  `--font-host-grotesk`; in Next.js:

  ```tsx
  import { Host_Grotesk } from "next/font/google";
  const hostGrotesk = Host_Grotesk({ variable: "--font-host-grotesk" });
  ```

- Heading treatment: `font-display font-medium` with negative tracking
  (`tracking-[-0.045em]` at display sizes, `tracking-tight` below).

### 13.2 Fog

Three parts, all needed for the real effect:

1. **Drift.** `.fog-layer` sets `will-change: transform` and an infinite
   `ease-in-out` timing function. The caller supplies `animation-name` /
   `animation-duration`; the six shipped keyframes are `fog-drift-a` …
   `fog-drift-e` and `fog-drift-footer`. They animate `transform` only, so the
   compositor handles them and the main thread stays free.
2. **Texture.** `<FogBank>` (from `noise-overlay`) paints deterministic fractal
   noise: `feTurbulence type="fractalNoise"` rasterized at quarter resolution,
   scaled 4x, recoloured by an `feFlood` that carries a light value and a dark
   value. Fixed seeds keep it SSR-safe.
3. **Masking.** Each layer is masked to a soft radial blob so the cloud reads
   organic, then the whole field is masked to the section and faded on scroll.

`FilmGrain` is the cheaper static speckle (`feTurbulence` + grayscale filter)
used by the hero; `HeroGrain` wraps it with a bottom fade.

### 13.3 Rules

- Fog is decoration: `aria-hidden`, never content, never interactive.
- Respect reduced motion. `.fog-layer` disables its animation under
  `prefers-reduced-motion: reduce`; scroll-driven opacity must also degrade to a
  static value.
- Keep fog on marketing pages. Do not put `.fog-layer`, `FogBank`, or
  `font-display` in the app dashboard.
- The masks, opacities, and scroll choreography live in the consuming
  component, not in the theme file. `marketing.css` ships the mechanism, not a
  fixed composition.
