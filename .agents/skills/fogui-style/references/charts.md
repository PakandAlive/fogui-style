# Charts

Charts are grayscale by design — a deliberate `--chart-1…5` ramp, never a
categorical palette (`DESIGN.md` §2.3). The shipped primitive is `chart.tsx`, a
thin wrapper over **recharts**.

## Use

`chart` installs like any other item. It exports `ChartContainer`,
`ChartConfig`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`,
`ChartLegendContent`, and `ChartStyle`.

```tsx
const config: ChartConfig = {
  runs: { label: "Runs", color: "var(--chart-2)" },
};

<ChartContainer config={config} className="h-64 w-full">
  <AreaChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="day" tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Area dataKey="runs" fill="var(--color-runs)" stroke="var(--color-runs)" />
  </AreaChart>
</ChartContainer>
```

## Color

- Only the grayscale ramp: `var(--chart-1)` … `var(--chart-5)`. They are
  identical in light and dark.
- Give the color a name in `ChartConfig` — `color`, or
  `theme: { light, dark }` when a value must differ per theme — and let the
  primitive emit `--color-<key>`. Paint bars/areas/lines with
  `var(--color-<key>)`.
- Never `#hex` / `rgb()` / `oklch()`, never the Badge chromatic hues, never a
  categorical rainbow.
- Ramp order: `--chart-2` is the primary series; `-1`, `-3…5` are secondary.

## The border exception

Charts are the **one** sanctioned `border` usage in the system — and only
inside the chart:

- The tooltip is `border border-border/50`; the dashed indicator is
  `border-dashed`. Leave them as shipped — do not replace them with a custom
  shadow.
- Grid and axis lines use `stroke-*`
  (`stroke-muted-foreground/20`, dark `stroke-border/50`), not `border-*`.
- Everything **around** the chart still obeys the law: the card holding a chart
  gets `shadow-(--custom-shadow)`, never a border.

## Recharts specifics

- Keep the primitive's `aspect-video` or set an explicit height on
  `ChartContainer`; never let a chart collapse to zero height.
- Tooltip values are `font-mono tabular-nums` on purpose. If the project has not
  mapped `--font-mono`, that falls back to Tailwind's default mono — map it if
  numeric alignment matters.
- `ChartContainer` already neutralizes recharts' default cursor/dot strokes; do
  not re-add outline utilities.

## Do not

- Do not add a second chart library (visx, nivo, chart.js, ECharts, …).
- Do not add `motion/react` for a chart. The shipped chart is animation-free.
- Foglamp's own advanced charts (area/bar/line/donut with brush, zoom, and
  reveal animation) live in the app, are **not** published in this registry, and
  depend on `motion/react`. Treat them as reference, not as an installable API.

## Accessibility

- Give the chart an accessible name — `role="img"` plus an `aria-label` that
  states the takeaway — on the container.
- Surface the numbers somewhere accessible: a visually-hidden `<table>` or an
  adjacent summary. Recharts' SVG output is not screen-reader friendly on its
  own.
