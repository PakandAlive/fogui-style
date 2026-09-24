# Icons

- Library: **`@tabler/icons-react`** only. Never mix in `lucide-react`,
  `react-icons`, etc.
- **Prefer the `*Filled` variant** when one exists (`IconPhotoFilled` over
  `IconPhoto`). Fall back to outline only when no `*Filled` exists (e.g.
  `IconLoader2`, `IconChevronDown`) or the user asks for outline.

## Color

- Icons draw with `currentColor` and inherit the parent's text color. That is
  the default — do not tint them.
- A standalone chromatic icon (`text-rose-500`, `text-amber-500`) is chromatic
  text and is **banned**. A chromatic icon must sit inside a `Badge` (or a
  `Button` variant that already carries the color), where the color belongs to
  the component, not to you.
- The one neutral exception is `text-muted-foreground`, for de-emphasized icons.

## Sizing

Via Tailwind, default `size-3.5`:

- `size-3` — compact: badges, dense table cells
- `size-3.25` — dense meta rows (timestamps, counts)
- `size-3.5` — default
- `size-4` — medium emphasis: page headers, primary actions
- `size-5` / `size-6` — marketing and empty states only

Stay on this scale; never size an icon with a font utility (`text-[13px]`).

- Never add margin (`mr-2`) to an icon inside a `<Button>`; the button already
  spaces children with `gap-*`.
- Keep Tabler's default stroke. Override only for optical weight on off-scale
  sizes (`stroke={1.5}` for large outline marks, `stroke={2.5}` for tiny ones),
  never as decoration.

## Accessibility

- Decorative icon beside a text label → `aria-hidden`, or rely on Tabler's
  default when it is not interactive.
- Icon-only control → a `Button size="icon*"` **with** an `aria-label`; never an
  unlabeled icon button.
- Loading spinner → `role="status"` plus a visually-hidden label
  (`<span className="sr-only">Loading</span>`), not a bare
  `<IconLoader2 className="animate-spin" />`.
- Never put meaning in the icon alone.

```tsx
import { IconCheckFilled } from "@tabler/icons-react";

<Button size="icon-sm" aria-label="Confirm">
  <IconCheckFilled />
</Button>
```
