/**
 * Resolve the light and dark values of every CSS custom property roolith emits.
 *
 * The module compiles the Sass entry point with sass-embedded, reads the scoped
 * declarations from the expanded CSS with PostCSS, and resolves var() chains
 * plus computable color-mix() expressions per theme. It backs the `--json` and
 * `--report` CLI modes and is intended to drive the generated token reference
 * later.
 *
 * @module css-custom-properties
 */

import { compile } from 'sass-embedded';
import { pathToFileURL } from 'node:url';
import { readThemeTokens } from './css-theme-tokens.mjs';
import { mergeUnresolved, resolveTokenMap } from './css-token-resolution.mjs';

const DEFAULT_FILE = 'src/sass/roolith.scss';
const DEFAULT_LOAD_PATHS = ['src/sass'];

/**
 * Compile the framework and resolve every custom property for both themes.
 *
 * @param {{file?: string, loadPaths?: string[]}} [options] Sass entry point and
 * import paths, relative to the process working directory.
 * @returns {{light: Map<string, string>, dark: Map<string, string>, unresolved: Array<{token: string, themes: string[], reason: string}>}}
 * Resolved token maps and a merged report of tokens that could not resolve.
 * @throws {Error} When Sass compilation fails or a var() cycle is found.
 */
export function loadTokens({ file = DEFAULT_FILE, loadPaths = DEFAULT_LOAD_PATHS } = {}) {
    const { css } = compile(file, { loadPaths, style: 'expanded' });

    return resolveTokens(css);
}

/**
 * Read expanded CSS and resolve custom properties for light and dark.
 *
 * Palette primitives declared in `:root` are inherited by the dark theme, so a
 * dark token may read a root-only token such as `--r-color-primary`. Dark values
 * therefore resolve against the resolved root scope with the dark declarations
 * layered on top.
 *
 * Parsing is separate from compiling so the resolver can be exercised with
 * fixture CSS in tests or future documentation tooling.
 *
 * @param {string} css Expanded CSS text.
 * @returns {{light: Map<string, string>, dark: Map<string, string>, unresolved: Array<{token: string, themes: string[], reason: string}>}}
 * Resolved token maps and a merged report of tokens that could not resolve.
 * @throws {Error} When a var() cycle is found or resolution does not converge.
 */
export function resolveTokens(css) {
    const rawTokens = readThemeTokens(css);
    const root = resolveTokenMap(rawTokens.root);
    const light = resolveTokenMap(rawTokens.light);
    const darkSource = new Map(root.tokens);

    for (const [name, value] of rawTokens.dark) {
        darkSource.set(name, value);
    }

    const dark = resolveTokenMap(darkSource);

    return {
        light: light.tokens,
        dark: dark.tokens,
        unresolved: mergeUnresolved(light.unresolved, dark.unresolved),
    };
}

/**
 * Execute the command-line surface when this module is run directly.
 *
 * @returns {Promise<void>} Resolves after the CLI finishes.
 */
async function main() {
    const { runCli } = await import('./css-custom-properties.cli.mjs');

    runCli(process.argv.slice(2), loadTokens);
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await main();
}
