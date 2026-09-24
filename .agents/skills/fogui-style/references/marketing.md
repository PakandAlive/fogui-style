# Marketing layer

The dashboard runs on Inter and shadow-only surfaces. Marketing and product
pages layer on a second, deliberately theatrical treatment: a display face and
drifting fog. It ships as the `marketing` item (CSS) plus `noise-overlay`
(components) and is **opt-in**.

## Display face

- `--font-display` maps to `var(--font-host-grotesk)`. `font-display` is used on
  marketing headings only; the dashboard stays on `font-sans`.
- **Host Grotesk** (Google Fonts) is not bundled. Load it and expose it as
  `--font-host-grotesk`; in Next.js:

  ```tsx
  import { Host_Grotesk } from "next/font/google";
  const hostGrotesk = Host_Grotesk({ variable: "--font-host-grotesk" });
  ```

- Heading treatment: `font-display font-medium` with negative tracking
  (`tracking-[-0.045em]` at display sizes, `tracking-tight` below).

## Fog

Three parts, all needed for the real effect:

1. **Drift.** `.fog-layer` sets `will-change: transform` and an infinite
   `ease-in-out` timing function. The caller supplies `animation-name` /
   `animation-duration`; the six shipped keyframes are `fog-drift-a` …
   `fog-drift-e` and `fog-drift-footer`. They animate `transform` only, so the
   compositor handles them and the main thread stays free.
2. **Texture.** `<FogBank>` (from `noise-overlay`) paints deterministic fractal
   noise: `feTurbulence type="fractalNoise"` rasterized at quarter resolution,
   scaled 4x, recoloured by an `feFlood` that carries a light and a dark value.
   Fixed seeds keep it SSR-safe.
3. **Masking.** Each layer is masked to a soft radial blob so the cloud reads
   organic, then the whole field is masked to the section and faded on scroll.

`FilmGrain` is the cheaper static speckle (`feTurbulence` + grayscale filter)
used by the hero; `HeroGrain` wraps it with a bottom fade.

```tsx
import { FogBank } from "@/components/ui/noise-overlay";

<div
  className="fog-layer absolute inset-[-15%]"
  style={{ animationName: "fog-drift-a", animationDuration: "26s" }}
>
  <FogBank id="fog-a" freq={0.011} seed={7} octaves={4} />
</div>;
```

## Rules

- Fog is decoration: `aria-hidden`, never content, never interactive.
- Respect reduced motion. `.fog-layer` disables its animation under
  `prefers-reduced-motion: reduce`; scroll-driven opacity must also degrade to a
  static value.
- Keep fog on marketing pages. Do not put `.fog-layer`, `FogBank`, or
  `font-display` in the app dashboard.
- The masks, opacities, and scroll choreography live in the consuming component.
  `marketing.css` ships the mechanism, not a fixed composition.
