# Components

## Inventory

56 primitives, shadcn-style, built on **Base UI** (`@base-ui/react`) with **CVA**
variants. They install into `components/ui/` (your configured alias).

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
- Extend by **composing**; add a CVA variant to the shared primitive only if it
  is reused.
- Never install a second component library. Never reimplement a primitive in the
  app.

## Button

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

## Badge

Base: `rounded-full`, `capitalize`, `font-medium`, `w-fit`.

Variants (13): `default`, `secondary`, `destructive`, the 10 chromatic variants
from `colors.md`, and `outline`. Each carries its matching shadow token.

Sizes (3): `sm h-4 text-[10px]`, `md h-5 text-xs`, `lg h-6 text-sm`.

Add an icon alongside the text where it clarifies state.

## Colored chips, tags, and ranks

The hue set lives in the `Badge` variants — `green blue amber orange emerald rose
red violet fuchsia sky`, plus `default secondary destructive outline`. Each
variant already bundles the tinted surface, the paired text color, and the
matching `--custom-shadow-*` edge. Do not rebuild it inline.

- Category / status chip → `<Badge variant="rose" size="sm">{label}</Badge>`.
- Hashtag / tag → neutral: `bg-secondary/60 text-secondary-foreground`, or a
  `secondary` Badge. One neutral treatment, not a rainbow.
- Leaderboard / heat rank → `text-muted-foreground` for the number, at most one
  accent for #1. Never `text-amber-500` / `text-emerald-500` / `text-rose-500`.
- Need a hue the variants do not cover? Add a Badge variant — do not inline
  `bg-<hue>-500`.

## Contrast

- Text must hit 4.5:1. `--muted-foreground` is fine at ≥ 12px on
  `--background` / `--card`; at `text-[11px]` or on a tinted surface it often
  fails.
- Never dim text with `/60` or `/70` opacity — pick a token that already has the
  contrast.
- Colored badge text is tuned for its own tinted surface; keep the `Badge`
  variant instead of restyling the colors by hand.

## Other primitives — noteworthy conventions

- **Input with icon/prefix/suffix:** always `InputGroup`
  (`InputGroupInput` / `InputGroupTextarea` / `InputGroupAddon`). Never fake a
  prefix with absolute positioning and padding.
- **Sidebar:** `<Sidebar variant="inset" />` only. Wrap in `SidebarProvider`,
  place content in `SidebarInset`. Handle scroll in the consumer layout
  (`h-svh min-h-0` on provider, `overflow-hidden` on inset, `overflow-y-auto`
  on inner main).
- **Tables:** the `<Table>` primitive. No TanStack Table / AG Grid.
- **Charts:** the `chart` primitive (recharts), grayscale `var(--chart-N)` only.
  See `references/charts.md` — charts are the one sanctioned `border` exception.
- **Dialogs:** the `<Dialog>` primitive. No custom overlay/portal logic.
- **Loading / empty:** `<Skeleton>` for placeholders, `<Empty>` for zero-states,
  `<IconLoader2 className="size-4 animate-spin" />` for spinners. Never render a
  bare "Loading…" string.

## Spacing and layout

- Keep spacing on Tailwind's scale (`gap-2`, `p-4`, `space-y-6`). No arbitrary
  `p-[13px]` unless justified — and if so, leave a one-line comment.
- `cursor-pointer` on every clickable item.
- Merge classes with `cn()` from `@/lib/utils`.

## Motion

- Default to `tw-animate-css` utilities (`animate-in`, `fade-in`,
  `slide-in-from-*`, `animate-spin`).
- **Never** add `motion/react` (Framer Motion) unless explicitly requested. It is
  heavier than most UI work needs.
- Respect `prefers-reduced-motion` for any bespoke keyframe animation.
