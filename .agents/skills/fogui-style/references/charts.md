# Charts

Charts are grayscale by design — a deliberate `--chart-1…5` ramp, never a
categorical palette (`DESIGN.md` §2.3). Two layers ship, both over **recharts**;
pick one and stay on it:

- **`chart`** — the design-system baseline. A thin recharts wrapper
  (`ChartContainer`, `ChartConfig` with a single `color`, `ChartTooltipContent`,
  `ChartLegendContent`). Mirrors Foglamp's `packages/ui`.
- **`chart-plus`** — reproduces the charts Foglamp actually renders: theme-aware
  multi-color ramps, tooltip roundness + frosted glass, seven legend variants,
  SVG background patterns, and a donut. The motion-free subset of Foglamp's
  internal charts.

Do not install both — their `ChartContainer` / `ChartConfig` differ.

## chart-plus

### Config and color

`ChartConfig` maps a key to a label and a `colors` object keyed by theme. Each
value is an **array** of ramp steps; `ChartStyle` spreads them across the slots
it needs and emits `--color-<key>-<index>`.

```tsx
import { ChartContainer, type ChartConfig } from "@/components/ui/chart-plus";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart-tooltip";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

// one ramp step, identical in both themes
const themed = (color: string) => ({ light: [color], dark: [color] });

const config: ChartConfig = {
  runs: { label: "Runs", colors: themed("var(--chart-2)") },
  errors: { label: "Errors", colors: themed("var(--chart-4)") },
};

<ChartContainer config={config} className="h-64 w-full">
  <AreaChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="day" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Area dataKey="runs" stroke="var(--color-runs-0)" fill="var(--color-runs-0)" />
    <Area dataKey="errors" stroke="var(--color-errors-0)" fill="var(--color-errors-0)" />
  </AreaChart>
</ChartContainer>
```

- Colors must be the grayscale ramp: `var(--chart-1)` … `var(--chart-5)`.
  Never `#hex` / `rgb()` / `oklch()`, never a chromatic hue, never a rainbow.
- `colors.light` / `colors.dark` may differ, but stay grayscale.
- The slot suffix is `-0`, `-1`, …; pass a longer array for a multi-stop series.

### Tooltip, legend, background

- **`ChartTooltipContent`** — `indicator: "dot" | "line" | "dashed"`,
  `variant: "default" | "frosted-glass"`,
  `roundness: "sm" | "md" | "lg" | "xl"`, `valueFormatter`. Wrap with
  `<ChartTooltip content={…} />`.
- **`ChartLegendContent`** — `variant: "square" | "circle" | "circle-outline" |
  "rounded-square" | "rounded-square-outline" | "vertical-bar" |
  "horizontal-bar"`. Wrap with `<ChartLegend content={…} />`.
- **`ChartBackground`** — an SVG pattern layer; place it inside the chart.
  `variant: "dots" | "grid" | "cross-hatch" | "diagonal-lines" | "plus" |
  "falling-triangles" | "4-pointed-star" | "tiny-checkers" |
  "overlapping-circles" | "wiggle-lines" | "bubbles"`.

### Donut

```tsx
<EvilDonutChart
  config={config}
  data={[{ key: "runs", value: 62 }, { key: "errors", value: 38 }]}
  centerLabel="1,204"
  centerSubLabel="total"
  showLegend
  legendVariant="rounded-square"
/>
```

Every `data.key` must exist in `config`; zero/negative slices are dropped.

### Helpers

`useChart`, `getPayloadConfigFromPayload`, `getColorsCount`, `niceDomain`
(zero-based y-axis with a stable "nice" ceiling), `niceCeil`,
`axisValueToPercentFormatter`, `getLoadingData`, `ChartStyle`, and
`LoadingIndicator` (driven by `isLoading`).

## The border exception

Charts are the **one** sanctioned `border` usage, and only inside the chart:
the tooltip frame (`border border-border/50`), dashed indicators, and pattern
strokes. Everything **around** a chart still gets `shadow-(--custom-shadow)`,
never a border.

## Accessibility

Give the chart an accessible name (`role="img"` + an `aria-label` that states the
takeaway), and surface the numbers somewhere accessible — a visually-hidden
`<table>` or an adjacent summary. Recharts' SVG is not screen-reader friendly on
its own.

## Do not

- Do not add a second chart library (visx, nivo, chart.js, ECharts, …).
- Do not add `motion/react` for a chart. `chart-plus` is animation-free.
- Foglamp's animated line/area/bar wrappers (intro reveal, animated-dashed
  strokes) and their brush/zoom live in the app, depend on `motion/react`, and
  are **not** published. `chart-plus` is the supported subset.
