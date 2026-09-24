# Color tokens

These are the values shipped by the `theme` item. All values are OKLCH.

## Base semantic tokens

| Token | Light | Dark | Utility examples |
| --- | --- | --- | --- |
| `--background` | `oklch(0.99 0 0)` | `oklch(0.17 0 0)` | `bg-background` |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | `text-foreground` |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | `bg-card` |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | `text-card-foreground` |
| `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | `bg-popover` |
| `--popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | `text-popover-foreground` |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | `bg-primary` |
| `--primary-foreground` | `oklch(0.98 0 0)` | `oklch(0.205 0 0)` | `text-primary-foreground` |
| `--secondary` | `oklch(0.95 0 0)` | `oklch(0.269 0 0)` | `bg-secondary` |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | `text-secondary-foreground` |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | `bg-muted` |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | `text-muted-foreground` |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | `bg-accent` |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | `text-accent-foreground` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | `bg-destructive`, `text-destructive` |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | token only — prefer shadows |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | `border-input` in primitives |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | `ring-ring` |

`--destructive` is the only chromatic base token. Hue `27` (red).

## Sidebar tokens

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

`--sidebar-primary` is achromatic in light but blue (hue `259`) in dark.

## Chart tokens

Grayscale ramp, identical in light and dark.

| Token | Value |
| --- | --- |
| `--chart-1` | `oklch(0.87 0 0)` |
| `--chart-2` | `oklch(0.556 0 0)` |
| `--chart-3` | `oklch(0.439 0 0)` |
| `--chart-4` | `oklch(0.371 0 0)` |
| `--chart-5` | `oklch(0.269 0 0)` |

## Badge chromatic accents

Color is allowed only here. Each pairs a `500` tint with `700` (light) / `300`
(dark) text and a matching shadow token (see `shadows.md`).

| Variant | Background | Light text | Dark background | Dark text |
| --- | --- | --- | --- | --- |
| `green` | `bg-green-500/10` | `text-green-700` | `bg-green-500/15` | `text-green-300` |
| `blue` | `bg-blue-500/10` | `text-blue-700` | `bg-blue-500/15` | `text-blue-300` |
| `amber` | `bg-amber-500/10` | `text-amber-700` | `bg-amber-500/15` | `text-amber-300` |
| `orange` | `bg-orange-500/10` | `text-orange-600` | `bg-orange-600/15` | `text-orange-400` |
| `emerald` | `bg-emerald-500/10` | `text-emerald-700` | `bg-emerald-500/15` | `text-emerald-300` |
| `rose` | `bg-rose-500/10` | `text-rose-700` | `bg-rose-500/15` | `text-rose-400` |
| `red` | `bg-red-500/10` | `text-red-700` | `bg-red-500/15` | `text-red-400` |
| `violet` | `bg-violet-500/10` | `text-violet-700` | `bg-violet-500/15` | `text-violet-300` |
| `fuchsia` | `bg-fuchsia-500/10` | `text-fuchsia-700` | `bg-fuchsia-500/15` | `text-fuchsia-300` |
| `sky` | `bg-sky-500/10` | `text-sky-700` | `bg-sky-500/15` | `text-sky-300` |

## Palette rules

- **Allowed raw grayscale:** Tailwind `neutral` only.
- **Banned raw grayscale:** `slate`, `gray`, `zinc`, `stone`.
- **Never** hardcode `#hex` / `rgb()` / `oklch()` in a className or inline style.
  Add a token to `globals.css` first.
- Design and verify **both** light and dark for every screen.
