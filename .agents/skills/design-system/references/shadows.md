# Shadow tokens

Source: `registry/theme/foglamp-theme.css`. Foglamp separates surfaces with
shadows instead of borders. Every stack starts with a `0 0 0 0.5px` ring (a
hairline) and adds depth. Light and dark stacks differ — never reuse one for the
other.

## The rule

> Separate surfaces with a `--custom-shadow-*` token. Never `border`, `border-*`,
> or `divide-*`.

Use `shadow-(--custom-shadow)` for the default surface edge, and a colour variant
to tint the edge to a semantic state.

## Token map

| Token | Role |
| --- | --- |
| `--custom-shadow` | Default surface edge + depth |
| `--custom-shadow-chrome` | Framed/demo chrome; firmer hairline, top-edge catch |
| `--custom-shadow-lifted` | Card floating above other cards |
| `--custom-outline-shadow` | Outline buttons (light mirrors `--custom-shadow`) |
| `--custom-shadow-primary` | Primary action (near-black / near-white) |
| `--custom-shadow-secondary` | Secondary surface |
| `--custom-shadow-destructive` | Danger affordance |
| `--custom-shadow-green` | Green status |
| `--custom-shadow-blue` | Blue status |
| `--custom-shadow-amber` | Amber status |
| `--custom-shadow-orange` | Orange status |
| `--custom-shadow-emerald` | Emerald status |
| `--custom-shadow-rose` | Rose status |
| `--custom-shadow-red` | Red status |
| `--custom-shadow-slate` | Slate status |
| `--custom-shadow-violet` | Violet status |
| `--custom-shadow-fuchsia` | Fuchsia status |
| `--custom-shadow-sky` | Sky status |

## Light values

```css
--custom-shadow:
  0px 0px 0px 0.5px rgba(0, 0, 0, 0.06),
  0px 0.5px 2px -0.5px rgba(0, 0, 0, 0.06),
  0px 1px 4px 0px rgba(0, 0, 0, 0.04);

--custom-shadow-chrome:
  0px 0px 0px 0.5px rgba(0, 0, 0, 0.09),
  0px -1px 4px 0px rgba(0, 0, 0, 0.04),
  0px 1px 2px -0.5px rgba(0, 0, 0, 0.06),
  0px 4px 8px -2px rgba(0, 0, 0, 0.06),
  0px 12px 24px -6px rgba(0, 0, 0, 0.08);

--custom-shadow-lifted:
  0px 0px 0px 0.5px rgba(0, 0, 0, 0.08),
  0px 1px 2px -0.5px rgba(0, 0, 0, 0.06),
  0px 6px 12px -4px rgba(0, 0, 0, 0.1),
  0px 16px 32px -8px rgba(0, 0, 0, 0.16);

--custom-shadow-primary:
  0px 0px 0px 0.5px rgba(0, 0, 0, 0.6),
  0px 0.5px 2px -0.5px rgba(0, 0, 0, 0.4),
  0px 2px 4px 0px rgba(0, 0, 0, 0.18);

--custom-shadow-secondary:
  0px 0px 0px 0.5px rgba(0, 0, 0, 0.08),
  0px 0.5px 2px -0.5px rgba(0, 0, 0, 0.08),
  0px 2px 4px 0px rgba(0, 0, 0, 0.05);

--custom-outline-shadow:
  0px 0px 0px 0.5px rgba(0, 0, 0, 0.06),
  0px 0.5px 2px -0.5px rgba(0, 0, 0, 0.06),
  0px 2px 4px 0px rgba(0, 0, 0, 0.04);
```

Colour recipe (light), with `<hue>` such as `green` at alpha `0.25 / 0.18 / 0.12`:

```css
--custom-shadow-<hue>:
  0px 0px 0px 0.5px rgba(<hue-500>, 0.25),
  0px 0.5px 2px -0.5px rgba(<hue-500>, 0.18),
  0px 2px 4px 0px rgba(<hue-500>, 0.12);
```

Applied hues: `destructive/rose` → `rgba(244,63,94)`, `green` → `rgba(34,197,94)`,
`blue` → `rgba(59,130,246)`, `amber` → `rgba(245,158,11)`, `orange` →
`rgba(249,115,22)`, `emerald` → `rgba(16,185,129)`, `red` → `rgba(239,68,68)`,
`slate` → `rgba(100,116,139)`, `violet` → `rgba(139,92,246)`, `fuchsia` →
`rgba(217,70,239)`, `sky` → `rgba(14,165,233)`.

## Dark values

Dark adds a light inset highlight and a dark ring.

```css
--custom-shadow:
  inset 0 0.75px 0 0 rgba(255, 255, 255, 0.03),
  inset 0 0 0 0.75px rgba(255, 255, 255, 0.03),
  0 0 0 0.75px rgba(0, 0, 0, 0.1), 0 2px 2px 0 rgba(0, 0, 0, 0.1),
  0 4px 4px 0 rgba(0, 0, 0, 0.1), 0 8px 8px 0 rgba(0, 0, 0, 0.1);

--custom-shadow-lifted:
  inset 0 0.75px 0 0 rgba(255, 255, 255, 0.06),
  inset 0 0 0 0.75px rgba(255, 255, 255, 0.05),
  0 0 0 0.75px rgba(0, 0, 0, 0.3), 0 4px 8px 0 rgba(0, 0, 0, 0.25),
  0 12px 24px 0 rgba(0, 0, 0, 0.35), 0 24px 48px -8px rgba(0, 0, 0, 0.4);

--custom-outline-shadow:
  inset 0 0.5px 0 0 rgba(255, 255, 255, 0.05),
  inset 0 0 0 0.5px rgba(255, 255, 255, 0.045),
  0 0 0 0.5px rgba(0, 0, 0, 0.14), 0 0.5px 2px -0.5px rgba(0, 0, 0, 0.14),
  0 2px 4px 0 rgba(0, 0, 0, 0.08);

--custom-shadow-primary:
  inset 0 0.5px 0 0 rgba(255, 255, 255, 0.45),
  0 0 0 0.5px rgba(255, 255, 255, 0.55), 0 0.5px 2px 0 rgba(0, 0, 0, 0.5);

--custom-shadow-secondary:
  inset 0 0.5px 0 0 rgba(255, 255, 255, 0.04),
  0 0 0 0.5px rgba(255, 255, 255, 0.08), 0 0.5px 2px 0 rgba(0, 0, 0, 0.25);
```

Colour recipe (dark):

```css
--custom-shadow-<hue>:
  inset 0 0.5px 0 0 rgba(<hue-500>, 0.03),
  0 0 0 0.5px rgba(<hue-500>, 0.18),
  0 0.5px 2px 0 rgba(<hue-500>, 0.1);
```

## Usage

```tsx
// Correct
<div className="rounded-lg bg-card shadow-(--custom-shadow)" />
<span className="shadow-[var(--custom-shadow-green)]" />
<Button variant="outline" />   // shadow-(--custom-outline-shadow) built in

// Wrong
<div className="rounded-lg border border-border" />
<div className="divide-y divide-border" />
```
