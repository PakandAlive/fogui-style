# Icons

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

```tsx
import { IconCheckFilled } from "@tabler/icons-react";

<IconCheckFilled className="size-3.5" />
```
