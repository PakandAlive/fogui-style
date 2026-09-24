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

function parseVars(block) {
	const vars = {};
	const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
	let m;
	while ((m = re.exec(block))) {
		vars[m[1]] = m[2].replace(/\s+/g, " ").trim();
	}
	return vars;
}

// ---------------------------------------------------------------------------
// 1. 组件
// ---------------------------------------------------------------------------
const componentsDir = join(UI_SRC, "components");
const componentFiles = readdirSync(componentsDir).filter((f) => f.endsWith(".tsx"));

rmSync(join(OUT, "ui"), { recursive: true, force: true });
mkdirSync(join(OUT, "ui"), { recursive: true });

const componentItems = [];
for (const file of componentFiles) {
	const name = basename(file, ".tsx");
	const src = readFileSync(join(componentsDir, file), "utf8");
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
	// 组件用到语义 token 与阴影，确保主题层先装。
	registryDeps.add(`${GITHUB}/theme`);

	componentItems.push({
		name,
		type: "registry:ui",
		title: pascal(name),
		description: `Foglamp ${pascal(name)} primitive.`,
		...(deps.length ? { dependencies: deps } : {}),
		registryDependencies: [...registryDeps].sort(),
		files: [
			{
				path: `registry/ui/${file}`,
				type: "registry:ui",
				target: `@ui/${file}`,
			},
		],
	});
}

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
// 4. theme（从 globals.css 解析变量，保留保真副本）
// ---------------------------------------------------------------------------
const globals = readFileSync(join(UI_SRC, "styles/globals.css"), "utf8");
const lightVars = parseVars(extractBlock(globals, ":root"));
const darkVars = parseVars(extractBlock(globals, ".dark"));

// radius 在 :root 里，dark 无需重复；shadcn 会把它写进 :root。
const themeItem = {
	name: "theme",
	type: "registry:style",
	title: "Foglamp Theme",
	description:
		"Foglamp color tokens, shadow-instead-of-border stack, squircle radii, and motion keyframes.",
	dependencies: ["tw-animate-css", "@toolwind/corner-shape"],
	cssVars: {
		light: lightVars,
		dark: darkVars,
	},
	css: {
		'@plugin "@toolwind/corner-shape"': {},
		"@custom-variant dark (&:is(.dark *))": {},
		"@custom-variant squircle (@supports (corner-shape: squircle))": {},
		"@keyframes shimmer": {
			"0%": { "background-position": "200% center" },
			"100%": { "background-position": "-200% center" },
		},
	},
};

// 保真副本：当 CLI 无法表达复杂 at-rule 时，用户可手动 @import。
mkdirSync(join(OUT, "theme"), { recursive: true });
const themeCss = `/*
 * Foglamp theme layer. Portable copy of the tokens, shadows, radii, squircle
 * variant and keyframes from packages/ui/src/styles/globals.css.
 *
 * Usage (Tailwind v4): import this at the top of your globals.css, after the
 * Tailwind import:
 *   @import "tailwindcss";
 *   @import "./foglamp-theme.css";
 *
 * Then add the @theme inline color mappings (bg-background, text-foreground, …)
 * generated by \`shadcn init\` — see DESIGN.md §11.
 */

@plugin "@toolwind/corner-shape";

@custom-variant squircle (@supports (corner-shape: squircle));
@custom-variant dark (&:is(.dark *));

${extractBlock(globals, ":root") ? `:root {${extractBlock(globals, ":root")}}` : ""}

.dark {${extractBlock(globals, ".dark")}}

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
// 5. 根 registry.json
// ---------------------------------------------------------------------------
const registry = {
	$schema: "https://ui.shadcn.com/schema/registry.json",
	name: "foglamp",
	homepage: "https://github.com/PakandAlive/fogui-style",
	items: [themeItem, utilsItem, ...hookItems, ...componentItems],
};

writeFileSync(join(ROOT, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);

console.log(
	`registry.json written: ${registry.items.length} items ` +
		`(${componentItems.length} components, ${hookItems.length} hooks, 1 theme, 1 utils)`,
);
