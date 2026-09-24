# Anti-patterns (hard bans)

| Never | Instead |
| --- | --- |
| `border`, `border-*`, `divide-*` for separation (chart internals excepted — see `charts.md`) | a `--custom-shadow-*` token |
| `slate` / `gray` / `zinc` / `stone` | `neutral`, or a semantic token |
| A hand-rolled colored pill — `bg-<hue>-500/10 text-<hue>-700 shadow-(--custom-shadow-<hue>)` written inline | `<Badge variant="<hue>">` |
| Chromatic text outside a Badge — `text-amber-500`, `text-emerald-500` | a `Badge` variant; otherwise `text-muted-foreground` |
| A standalone colored icon — `<IconHeartFilled className="text-rose-500" />` | inherit the color, or sit inside a `Badge`/`Button` variant |
| A second chart library (visx, nivo, chart.js, ECharts) | the shipped `chart` / `chart-plus` (recharts) |
| Hardcoded `#hex` / `rgb()` / `oklch()` in a className | add a token first |
| `text-muted-foreground/60`, or `text-muted-foreground` at ≤ 12px | a full-strength token that meets 4.5:1 |
| `alert()` or a custom toast | `toast.success` / `toast.error` from `sonner` |
| `<a href>` for in-app navigation | the framework router's `<Link>` |
| Raw `<img>` | the framework image component |
| A second icon / component / table / date library | the pinned one |
| Radix `asChild` | Base UI `render` prop |
| Reimplementing a shared primitive in the app | extend the installed primitive |
| `motion/react` by default | `tw-animate-css` |
| A global state library (Zustand/Redux/Jotai) | `useState` + TanStack Query |

The shipped `Badge` is the **only** place raw chromatic palette classes belong:
its variants already pair `bg-<hue>-500/10`, `text-<hue>-700 dark:text-<hue>-300`,
and `shadow-(--custom-shadow-<hue>)`. In app code, reach for the variant, never
the palette class. `neutral-*` is the one palette family allowed inline (grays).

Some rows name the framework idiom generically: in Next.js that is
`next/link`, `next/image`, and `next/font`. Use your framework's equivalent.
