# Anti-patterns (hard bans)

| Never | Instead |
| --- | --- |
| `border`, `border-*`, `divide-*` for separation | a `--custom-shadow-*` token |
| `slate` / `gray` / `zinc` / `stone` | `neutral`, or a semantic token |
| Hardcoded `#hex` / `rgb()` / `oklch()` in a className | add a token first |
| `alert()` or a custom toast | `toast.success` / `toast.error` from `sonner` |
| `<a href>` for in-app navigation | the framework router's `<Link>` |
| Raw `<img>` | the framework image component |
| A second icon / component / table / date library | the pinned one |
| Radix `asChild` | Base UI `render` prop |
| Reimplementing a shared primitive in the app | extend the installed primitive |
| `motion/react` by default | `tw-animate-css` |
| A global state library (Zustand/Redux/Jotai) | `useState` + TanStack Query |

Some rows name the framework idiom generically: in Next.js that is
`next/link`, `next/image`, and `next/font`. Use your framework's equivalent.
