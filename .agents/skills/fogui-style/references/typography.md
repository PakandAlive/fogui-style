# Typography

Three faces, three jobs. Do not cross them.

| Face | CSS variable | Loading | Scope |
| --- | --- | --- | --- |
| **Inter** (variable) | `--font-sans` | self-hosted (rsms/inter woff2) or `next/font` | Everything in the app |
| **Host Grotesk** | `--font-host-grotesk` → `--font-display` | `next/font/google` | Marketing / product headings only |
| **Geist Mono** | `--font-geist-mono` | `next/font/google` | Mono contexts (optional) |

The `theme` item maps:

```css
@theme inline {
  --font-sans: var(--font-sans);
  --font-heading: var(--font-sans);
}
```

The `marketing` item adds:

```css
@theme inline {
  --font-display: var(--font-host-grotesk);
}
```

Rules:

- **`--font-sans` is provided by the project.** The theme only maps `font-sans`
  to it; if it is unset, `font-sans` resolves to nothing and text inherits. Wire
  it in your root layout or `:root`:

  ```tsx
  import { Inter } from "next/font/google";
  const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
  // <html className={inter.variable}>
  ```

- **Vite / non-Next projects** have no `next/font`. Install the variable font
  from npm and expose it as `--font-sans`; never `@import` a Google Fonts URL:

  ```bash
  npm i @fontsource-variable/inter
  ```

  ```ts
  // main.tsx
  import "@fontsource-variable/inter";
  ```

  ```css
  :root { --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif; }
  ```

- **Verify it landed.** If the dashboard renders in a system stack,
  `--font-sans` was never set:

  ```js
  getComputedStyle(document.body).fontFamily; // must contain "Inter"
  ```

- Self-host Inter from the canonical rsms/inter release, not Google Fonts
  (Google serves an older, feature-stripped build).
- The dashboard is Inter everywhere. `font-display` is marketing only.
- Never `<link rel="stylesheet">` a Google Fonts URL. Never `@import` a font in
  CSS.
- Do not map `--font-mono` to Geist Mono unless you actually want mono to be
  Geist. Decide it explicitly; it is off by default.

Marketing headings use `font-display font-medium` with negative tracking
(`tracking-[-0.045em]` at display sizes, `tracking-tight` below).
