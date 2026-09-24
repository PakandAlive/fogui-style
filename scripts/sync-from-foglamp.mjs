#!/usr/bin/env node
/**
 * 从上游 Foglamp 的 packages/ui 同步设计系统资产到本仓库。
 *
 * fogui-style 是自包含仓库：registry/ 与 registry.json 本身就是可发布的事实源，
 * 直接改这里即可。本脚本只在需要从 Foglamp 拉取组件/工具/主题更新时运行，它会：
 *   1. 读取 Foglamp 的 packages/ui
 *   2. 把 @foglamp/ui/* import 改写为可移植形式
 *   3. 重新生成 registry/ui、registry/lib、registry/hooks、registry/theme、registry.json
 *
 * 转换规则：
 *   @foglamp/ui/lib/*        -> @/lib/*
 *   @foglamp/ui/components/* -> @/components/ui/*
 *   @foglamp/ui/hooks/*      -> @/hooks/*
 * 这样目标项目的 shadcn CLI 才能按自身别名重写 import。
 *
 * 用法（源路径按优先级解析）：
 *   node scripts/sync-from-foglamp.mjs --source /path/to/foglamp/packages/ui
 *   FOGLAMP_UI_SRC=/path/to/foglamp/packages/ui node scripts/sync-from-foglamp.mjs
 * 默认源：<本仓库>/../foglamp/foglamp-src/packages/ui
 */
import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

/**
 * 解析上游源目录：--source > FOGLAMP_UI_SRC > 默认相对路径。
 * 返回值是包含 components/、hooks/、styles/ 的目录（即 packages/ui/src）。
 * 传入 packages/ui 或 packages/ui/src 都能识别。
 */
function resolveSource() {
	const flag = process.argv.indexOf("--source");
	const raw =
		(flag !== -1 && process.argv[flag + 1]) ||
		process.env.FOGLAMP_UI_SRC ||
		resolve(ROOT, "../foglamp/foglamp-src/packages/ui/src");
	const given = resolve(raw);
	if (existsSync(join(given, "src/components"))) return join(given, "src");
	return given;
}

const UI_SRC = resolveSource();
if (!existsSync(UI_SRC)) {
	console.error(
		`找不到 Foglamp 的 packages/ui：${UI_SRC}\n` +
			"请用 --source <path> 或 FOGLAMP_UI_SRC=<path> 指定上游路径。",
	);
	process.exit(1);
}

/**
 * 解析上游 web app 源目录：--web > FOGLAMP_WEB_SRC > 默认从 UI_SRC 推导。
 * marketing 层（字体显示面、雾气动效与纹理组件）位于 apps/web，而非 packages/ui。
 */
function resolveWebSource() {
	const flag = process.argv.indexOf("--web");
	const raw =
		(flag !== -1 && process.argv[flag + 1]) ||
		process.env.FOGLAMP_WEB_SRC ||
		resolve(UI_SRC, "../../../apps/web/src");
	return resolve(raw);
}

const WEB_SRC = resolveWebSource();

const OUT = join(ROOT, "registry");
const GITHUB = "PakandAlive/fogui-style";

/** 判断是否是需要在 registry 声明的外部 npm 包（排除 react/next/内部路径）。 */
function isExternalDep(spec) {
	if (spec.startsWith(".") || spec.startsWith("@/") || spec.startsWith("@foglamp/"))
		return false;
	if (spec === "react" || spec.startsWith("react/") || spec.startsWith("react-dom"))
		return false;
	if (spec.startsWith("next/")) return false;
	return true;
}

/** 归一化到真实包名：@base-ui/react/button -> @base-ui/react。 */
function normalizeDep(spec) {
	if (spec === "@base-ui/react" || spec.startsWith("@base-ui/react/"))
		return "@base-ui/react";
	if (spec === "recharts" || spec.startsWith("recharts/")) return "recharts";
	return spec;
}

const IMPORT_RE = /from\s+["']([^"']+)["']/g;

/** 改写 @foglamp/* 路径到可移植的 shadcn 别名形式。 */
function rewriteImports(src) {
	return src
		.replace(/@foglamp\/ui\/lib\/([a-z0-9-]+)/g, "@/lib/$1")
		.replace(/@foglamp\/ui\/components\/([a-z0-9-]+)/g, "@/components/ui/$1")
		.replace(/@foglamp\/ui\/hooks\/([a-z0-9-]+)/g, "@/hooks/$1");
}

function collectImports(src) {
	const specs = new Set();
	let m;
	while ((m = IMPORT_RE.exec(src))) specs.add(m[1]);
	return [...specs];
}

function pascal(name) {
	return name
		.split("-")
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join(" ");
}

/** 解析 CSS 里某个选择器的声明块，提取 --var: value。 */
function extractBlock(css, selector) {
	// 必须匹配 "<selector> {"，否则 ":root" / ".dark" 会被
	// "@custom-variant dark (&:is(.dark *))" 里的同名子串抢先命中。
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const match = new RegExp(`${escaped}\\s*\\{`).exec(css);
	if (!match) return "";
	const start = match.index + match[0].length - 1;
	let depth = 0;
	for (let i = start; i < css.length; i++) {
		if (css[i] === "{") depth++;
		else if (css[i] === "}") {
			depth--;
			if (depth === 0) return css.slice(start + 1, i);
		}
	}
	return "";
}

/** 提取整块 "@keyframes <name> { ... }"（含花括号），保留原格式。 */
function extractKeyframes(css, name) {
	const match = new RegExp(`@keyframes\\s+${name}\\s*\\{`).exec(css);
	if (!match) return "";
	const start = match.index;
	let depth = 0;
	for (let i = match.index + match[0].length - 1; i < css.length; i++) {
		if (css[i] === "{") depth++;
		else if (css[i] === "}") {
			depth--;
			if (depth === 0) return css.slice(start, i + 1);
		}
	}
	return "";
}

// ---------------------------------------------------------------------------
// 1. 组件
// ---------------------------------------------------------------------------
const componentsDir = join(UI_SRC, "components");
const componentFiles = readdirSync(componentsDir).filter((f) => f.endsWith(".tsx"));

rmSync(join(OUT, "ui"), { recursive: true, force: true });
mkdirSync(join(OUT, "ui"), { recursive: true });

/**
 * 由一个 TSX 源生成 registry:ui item：改写 import、落盘并解析依赖。
 * 组件用到语义 token 与阴影，因此一律声明对 theme 的依赖。
 */
function uiItem({ name, file, src, description }) {
	const rewritten = rewriteImports(src);
	writeFileSync(join(OUT, "ui", file), rewritten);

	const specs = collectImports(rewritten);
	const deps = [
		...new Set(specs.filter(isExternalDep).map(normalizeDep)),
	].sort();

	const registryDeps = new Set();
	for (const spec of specs) {
		const comp = spec.match(/^@\/components\/ui\/([a-z0-9-]+)$/);
		if (comp) registryDeps.add(`${GITHUB}/${comp[1]}`);
		if (spec === "@/lib/utils") registryDeps.add(`${GITHUB}/utils`);
		const hook = spec.match(/^@\/hooks\/([a-z0-9-]+)$/);
		if (hook) registryDeps.add(`${GITHUB}/${hook[1]}`);
	}
	registryDeps.add(`${GITHUB}/theme`);

	return {
		name,
		type: "registry:ui",
		title: pascal(name),
		description,
		...(deps.length ? { dependencies: deps } : {}),
		registryDependencies: [...registryDeps].sort(),
		files: [
			{ path: `registry/ui/${file}`, type: "registry:ui", target: `@ui/${file}` },
		],
	};
}

const componentItems = componentFiles.map((file) =>
	uiItem({
		name: basename(file, ".tsx"),
		file,
		src: readFileSync(join(componentsDir, file), "utf8"),
		description: `Foglamp ${pascal(basename(file, ".tsx"))} primitive.`,
	}),
);

// ---------------------------------------------------------------------------
// 2. lib/utils（标准 shadcn cn 实现，避免依赖 Foglamp 内部的 cn 包）
// ---------------------------------------------------------------------------
rmSync(join(OUT, "lib"), { recursive: true, force: true });
mkdirSync(join(OUT, "lib"), { recursive: true });
writeFileSync(
	join(OUT, "lib/utils.ts"),
	`import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
\treturn twMerge(clsx(inputs));
}
`,
);

const utilsItem = {
	name: "utils",
	type: "registry:lib",
	title: "cn utility",
	description: "Class merge helper (clsx + tailwind-merge), the standard shadcn cn.",
	dependencies: ["clsx", "tailwind-merge"],
	files: [
		{ path: "registry/lib/utils.ts", type: "registry:lib", target: "@lib/utils.ts" },
	],
};

// ---------------------------------------------------------------------------
// 3. hooks
// ---------------------------------------------------------------------------
const hooksDir = join(UI_SRC, "hooks");
const hookFiles = existsSync(hooksDir)
	? readdirSync(hooksDir).filter((f) => f.endsWith(".ts"))
	: [];
rmSync(join(OUT, "hooks"), { recursive: true, force: true });
mkdirSync(join(OUT, "hooks"), { recursive: true });

const hookItems = hookFiles.map((file) => {
	const name = basename(file, ".ts");
	cpSync(join(hooksDir, file), join(OUT, "hooks", file));
	return {
		name,
		type: "registry:hook",
		title: pascal(name),
		description: `Foglamp ${pascal(name)} hook.`,
		files: [
			{ path: `registry/hooks/${file}`, type: "registry:hook", target: `@hooks/${file}` },
		],
	};
});

// ---------------------------------------------------------------------------
// 4. theme（整份主题 CSS 以 registry:file 分发，保真且无 cssVars 注入副作用）
// ---------------------------------------------------------------------------
const globals = readFileSync(join(UI_SRC, "styles/globals.css"), "utf8");
const rootBlock = extractBlock(globals, ":root");
const darkBlock = extractBlock(globals, ".dark");
const themeInlineBlock = extractBlock(globals, "@theme inline");

// 为什么不用 registry:style + cssVars：
// shadcn 的 cssVars key 约定不带 "--"，且不会覆盖目标项目已有变量；对
// Foglamp 的自定义 shadow 变量还会生成 `var(----custom-shadow)` 这类无效 CSS。
// 整份 CSS 以 registry:file 落到项目里，用户 @import 一次即完全保真。
const themeItem = {
	name: "theme",
	type: "registry:file",
	title: "Foglamp Theme",
	description:
		"Foglamp color tokens, shadow-instead-of-border stack, squircle radii, and motion keyframes, shipped as one self-contained CSS file.",
	dependencies: ["tw-animate-css", "@toolwind/corner-shape"],
	docs: 'Add `@import "./foglamp-theme.css";` (adjust the path to where the file landed) right after `@import "tailwindcss";` in your global CSS.',
	files: [
		{
			path: "registry/theme/foglamp-theme.css",
			type: "registry:file",
			target: "@lib/foglamp-theme.css",
		},
	],
};

// 自包含主题 CSS：tokens + shadow + radii + @theme inline 映射 + 动效，
// 用户 @import 一次即可，不再依赖 shadcn 的变量注入。
mkdirSync(join(OUT, "theme"), { recursive: true });
const themeCss = `/*
 * Foglamp theme layer — self-contained.
 * Portable copy of the tokens, shadows, radii, @theme inline mappings, squircle
 * variant, and keyframes from packages/ui/src/styles/globals.css.
 *
 * Usage (Tailwind v4), in your global CSS file:
 *   @import "tailwindcss";
 *   @import "./foglamp-theme.css";
 */

@plugin "@toolwind/corner-shape";

@custom-variant squircle (@supports (corner-shape: squircle));
@custom-variant dark (&:is(.dark *));

:root {${rootBlock}}

.dark {${darkBlock}}

@theme inline {${themeInlineBlock}}

@keyframes shimmer {
	0% {
		background-position: 200% center;
	}
	100% {
		background-position: -200% center;
	}
}
`;
writeFileSync(join(OUT, "theme/foglamp-theme.css"), themeCss);

// ---------------------------------------------------------------------------
// 5. marketing（字体显示面 + 雾气漂移；来源为 apps/web，而非 packages/ui）
// ---------------------------------------------------------------------------
const marketingCssSrc = join(WEB_SRC, "index.css");
const noiseOverlaySrc = join(WEB_SRC, "components/marketing/noise-overlay.tsx");
if (!existsSync(marketingCssSrc) || !existsSync(noiseOverlaySrc)) {
	console.error(
		`找不到 marketing 源，期望：\n  ${marketingCssSrc}\n  ${noiseOverlaySrc}\n` +
			"请用 --web <apps/web/src> 或 FOGLAMP_WEB_SRC=<apps/web/src> 指定。",
	);
	process.exit(1);
}

const marketingSrc = readFileSync(marketingCssSrc, "utf8");
const fontDisplayBlock = extractBlock(marketingSrc, "@theme inline");
const FOG_KEYFRAMES = [
	"fog-drift-a",
	"fog-drift-b",
	"fog-drift-c",
	"fog-drift-d",
	"fog-drift-e",
	"fog-drift-footer",
];
const fogKeyframes = FOG_KEYFRAMES.map((name) =>
	extractKeyframes(marketingSrc, name),
);
const fogLayerBody = extractBlock(marketingSrc, ".fog-layer");
if (
	!fontDisplayBlock.trim() ||
	fogKeyframes.some((k) => !k) ||
	!fogLayerBody.trim()
) {
	console.error(
		"marketing 源缺少 --font-display 映射、fog-drift keyframes 或 .fog-layer 规则。",
	);
	process.exit(1);
}

const marketingCss = `/*
 * Foglamp marketing layer — self-contained.
 * The display-face mapping, fog drift, and the .fog-layer utility, taken from
 * apps/web/src/index.css.
 *
 * Usage (Tailwind v4), after the Tailwind and theme imports:
 *   @import "./foglamp-marketing.css";
 *
 * Host Grotesk is not bundled. Load it and expose it as --font-host-grotesk
 * (Next.js: next/font/google Host_Grotesk with variable: "--font-host-grotesk");
 * nothing else resolves \`font-display\`.
 */

@theme inline {${fontDisplayBlock}}

${fogKeyframes.join("\n\n")}

.fog-layer {${fogLayerBody}}

@media (prefers-reduced-motion: reduce) {
	.fog-layer {
		animation: none;
	}
}
`;
writeFileSync(join(OUT, "theme/foglamp-marketing.css"), marketingCss);

const marketingItem = {
	name: "marketing",
	type: "registry:file",
	title: "Foglamp Marketing",
	description:
		"Marketing layer: the `font-display` mapping (Host Grotesk), the fog drift keyframes, and the `.fog-layer` utility for atmospheric sections.",
	registryDependencies: [`${GITHUB}/theme`],
	docs: 'Add `@import "./foglamp-marketing.css";` (adjust the path) after your Tailwind and theme imports. Load Host Grotesk and expose it as `--font-host-grotesk`; nothing else resolves `font-display`.',
	files: [
		{
			path: "registry/theme/foglamp-marketing.css",
			type: "registry:file",
			target: "@lib/foglamp-marketing.css",
		},
	],
};

// 雾气纹理组件（FilmGrain / FogBank / HeroGrain），与 CSS 同属 marketing 层。
const noiseOverlayItem = uiItem({
	name: "noise-overlay",
	file: "noise-overlay.tsx",
	src: readFileSync(noiseOverlaySrc, "utf8"),
	description:
		"Foglamp atmospheric textures: FilmGrain (static SVG speckle), FogBank (fractal-noise haze), and HeroGrain.",
});

// ---------------------------------------------------------------------------
// 6. 图表增强层 chart-plus（evilcharts 的免 motion 子集，来源 apps/web）
//    Foglamp 产品里的图表是 apps/web 自研的 evilcharts（按主题多色 ramp、
//    frosted tooltip、dot/background 变体、带 motion 的入场动画与 brush/zoom）。
//    这里只抽「不依赖 motion/react 且能独立工作」的子集，作为标准 chart 之上的
//    可选增强层：
//      ui/chart.tsx          -> chart-plus.tsx      多色 ChartConfig + helpers
//      ui/tooltip.tsx        -> chart-tooltip.tsx
//      ui/legend.tsx         -> chart-legend.tsx
//      ui/background.tsx     -> chart-background.tsx
//      charts/donut-chart.tsx-> chart-donut.tsx
//    ui/dot.tsx 不抽：它的填充是 url(#<id>-colors-<key>) 渐变，而该渐变由未发布的
//    line/area/bar 包装定义，单独发布会是坏组件。
//    带 motion 的 line/area/bar 包装与 brush/zoom 同样不发布。
// ---------------------------------------------------------------------------
const EVILCHARTS_DIR = join(WEB_SRC, "components/evilcharts");

/** evilcharts 源文件 -> registry 文件名（加 chart- 前缀，避免与 chart/tooltip 等 item 冲突）。 */
const CHART_FILE_MAP = {
	"ui/chart.tsx": "chart-plus.tsx",
	"ui/tooltip.tsx": "chart-tooltip.tsx",
	"ui/legend.tsx": "chart-legend.tsx",
	"ui/background.tsx": "chart-background.tsx",
	"charts/donut-chart.tsx": "chart-donut.tsx",
};

/** 把 evilcharts 内部的 @/components/evilcharts/ui/<x> 改写为 @/components/ui/chart-*。 */
function rewriteChartImports(src) {
	return rewriteImports(src)
		.replace(
			/@\/components\/evilcharts\/ui\/chart/g,
			"@/components/ui/chart-plus",
		)
		.replace(
			/@\/components\/evilcharts\/ui\/([a-z0-9-]+)/g,
			"@/components/ui/chart-$1",
		);
}

rmSync(join(OUT, "charts"), { recursive: true, force: true });
mkdirSync(join(OUT, "charts"), { recursive: true });

const chartFiles = [];
for (const [srcRel, outFile] of Object.entries(CHART_FILE_MAP)) {
	const srcPath = join(EVILCHARTS_DIR, srcRel);
	if (!existsSync(srcPath)) {
		console.error(`找不到 evilcharts 源：${srcPath}`);
		process.exit(1);
	}
	writeFileSync(
		join(OUT, "charts", outFile),
		rewriteChartImports(readFileSync(srcPath, "utf8")),
	);
	chartFiles.push({
		path: `registry/charts/${outFile}`,
		type: "registry:ui",
		target: `@ui/${outFile}`,
	});
}

const chartPlusItem = {
	name: "chart-plus",
	type: "registry:ui",
	title: "Chart Plus",
	description:
		"Foglamp's chart enhancement layer: theme-aware multi-color ramps, a frosted tooltip, legend/dot/background variants, and a donut. The motion-free subset of Foglamp's internal charts, layered on top of recharts.",
	dependencies: ["recharts"],
	registryDependencies: [`${GITHUB}/theme`, `${GITHUB}/utils`],
	files: chartFiles,
};

// ---------------------------------------------------------------------------
// 7. 根 registry.json
// ---------------------------------------------------------------------------
const registry = {
	$schema: "https://ui.shadcn.com/schema/registry.json",
	name: "foglamp",
	homepage: "https://github.com/PakandAlive/fogui-style",
	items: [
		themeItem,
		marketingItem,
		utilsItem,
		...hookItems,
		...componentItems,
		noiseOverlayItem,
		chartPlusItem,
	],
};

writeFileSync(join(ROOT, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);

console.log(
	`registry.json written: ${registry.items.length} items ` +
		`(${componentItems.length + 1} components, ${hookItems.length} hooks, 2 theme, 1 utils, 1 chart-plus)`,
);
