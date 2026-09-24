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

## Other primitives — noteworthy conventions

- **Input with icon/prefix/suffix:** always `InputGroup`
  (`InputGroupInput` / `InputGroupTextarea` / `InputGroupAddon`). Never fake a
  prefix with absolute positioning and padding.
- **Sidebar:** `<Sidebar variant="inset" />` only. Wrap in `SidebarProvider`,
  place content in `SidebarInset`. Handle scroll in the consumer layout
  (`h-svh min-h-0` on provider, `overflow-hidden` on inset, `overflow-y-auto`
  on inner main).
- **Tables:** the `<Table>` primitive. No TanStack Table / AG Grid.
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
