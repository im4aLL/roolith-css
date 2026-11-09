/**
 * Read the token wiring that only the SCSS source carries.
 *
 * Two facts cannot be read back from the compiled CSS: which setting a
 * declaration interpolates, and which tokens come from the per-theme component
 * token map. Both are read from `_css-variable.scss`, so the generated token
 * reference follows the source instead of keeping a second, hand-maintained
 * table next to it.
 *
 * @module css-variable-source
 */

import { readFileSync } from 'node:fs';

const DEFAULT_FILE = 'src/sass/_css-variable.scss';
const PUBLIC_PREFIX = '--r-';
const SETTING_DECLARATION = /^[ \t]*(--[a-z0-9_-]+):[ \t]*'?#\{\$([a-z0-9-]+)\}'?;[ \t]*$/gm;
const THEME_COMPONENT_MAP_START = /\$-theme-component-tokens:[ \t]*\(/;
const THEME_COMPONENT_MAP_END = '\n);';
const THEME_COMPONENT_ENTRY = /^[ \t]+([a-z][a-z0-9-]*):/gm;
const THEME_COMPONENT_META_KEYS = new Set(['light', 'dark']);

/**
 * Read the custom property wiring declared by `_css-variable.scss`.
 *
 * @param {{file?: string}} [options] Source file, relative to the process working directory.
 * @returns {{settingsPairs: Map<string, string>, themeTokens: Set<string>}} Token to setting name pairs, and the tokens emitted from the per-theme component token map.
 * @throws {Error} When the file cannot be read or the component token map is malformed.
 */
export function readCssVariableSource({ file = DEFAULT_FILE } = {}) {
    return parseCssVariableSource(readFileSync(file, 'utf8'));
}

/**
 * Read the wiring from SCSS source text.
 *
 * `settingsPairs` maps a token to the setting it interpolates, for example
 * `--r-form-input-radius` to `form-input-radius`. `themeTokens` holds the token
 * names produced by `$-theme-component-tokens` for both themes.
 *
 * @param {string} scss Contents of `_css-variable.scss`.
 * @returns {{settingsPairs: Map<string, string>, themeTokens: Set<string>}} Parsed wiring.
 * @throws {Error} When the component token map cannot be located or is not closed.
 */
export function parseCssVariableSource(scss) {
    return {
        settingsPairs: readSettingsPairs(scss),
        themeTokens: readThemeComponentTokens(scss),
    };
}

/**
 * Collect declarations of the form `--r-x: #{$setting}`.
 *
 * Quoted interpolations such as `--r-breadcrumb-sep-symbol: '#{$symbol}'` are
 * included. Declarations built from generated names, such as the palette loop,
 * are skipped because their property name is not a literal token.
 *
 * @param {string} scss SCSS source text.
 * @returns {Map<string, string>} Token name to setting name, without the `$`.
 */
function readSettingsPairs(scss) {
    const pairs = new Map();

    for (const match of scss.matchAll(SETTING_DECLARATION)) {
        pairs.set(match[1], match[2]);
    }

    return pairs;
}

/**
 * Collect the token names emitted by the per-theme component token map.
 *
 * The map holds a `light` and a `dark` sub-map with the same keys, so the keys
 * are collected once and the theme sub-map names are skipped.
 *
 * @param {string} scss SCSS source text.
 * @returns {Set<string>} Token names, for example `--r-nav-link-color`.
 * @throws {Error} When the map cannot be located or has no closing line.
 */
function readThemeComponentTokens(scss) {
    const start = scss.search(THEME_COMPONENT_MAP_START);

    if (start === -1) {
        throw new Error('Cannot find the $-theme-component-tokens map in _css-variable.scss.');
    }

    const end = scss.indexOf(THEME_COMPONENT_MAP_END, start);

    if (end === -1) {
        throw new Error('The $-theme-component-tokens map in _css-variable.scss is not closed.');
    }

    const tokens = new Set();

    for (const match of scss.slice(start, end).matchAll(THEME_COMPONENT_ENTRY)) {
        if (THEME_COMPONENT_META_KEYS.has(match[1])) {
            continue;
        }

        tokens.add(`${PUBLIC_PREFIX}${match[1]}`);
    }

    return tokens;
}
