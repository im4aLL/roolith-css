/**
 * Read theme-scoped custom property declarations from expanded CSS.
 *
 * PostCSS parses the stylesheet, then each rule is classified by the themes it
 * declares: `:root` outside a dark media query is light, `:root` inside one is
 * dark, explicit theme classes map directly, and rules nested in at-rules other
 * than `@media` are ignored. The output keeps raw values so the resolver can
 * substitute references per scope.
 *
 * @module css-theme-tokens
 */

import postcss from 'postcss';

const DARK_MEDIA_PATTERN = /prefers-color-scheme\s*:\s*dark/;
const NEGATED_GROUP_PATTERN = /:not\((?:[^()]|\([^()]*\))*\)/g;
const THEME_LIGHT_PATTERN = /(^|[^A-Za-z0-9_-])\.theme-light(?![\w-])/;
const THEME_DARK_PATTERN = /(^|[^A-Za-z0-9_-])\.theme-dark(?![\w-])/;
const ROOT_SELECTOR_PATTERN = /^:root(?![\w-])/;

/**
 * Collect raw custom property values for the root, light, and dark scopes.
 *
 * Root holds declarations that apply to `:root` outside the dark media query.
 * Light adds `.theme-light` and the light side of a shared selector list. Dark
 * holds every dark rule, including the dark media branch, so the caller can seed
 * it with inherited root values.
 *
 * @param {string} css Expanded CSS text.
 * @returns {{root: Map<string, string>, light: Map<string, string>, dark: Map<string, string>}} Raw values by scope.
 * @throws {Error} When PostCSS cannot parse the CSS.
 */
export function readThemeTokens(css) {
    const root = new Map();
    const light = new Map();
    const dark = new Map();

    postcss.parse(css).walkRules((rule) => {
        const media = mediaConditions(rule);

        if (media === null) {
            return;
        }

        const scope = classifySelectors(rule.selectors, media.some((condition) => DARK_MEDIA_PATTERN.test(condition)));

        if (!scope.root && !scope.light && !scope.dark) {
            return;
        }

        for (const [name, value] of readDeclarations(rule)) {
            if (scope.root) {
                root.set(name, value);
            }

            if (scope.light) {
                light.set(name, value);
            }

            if (scope.dark) {
                dark.set(name, value);
            }
        }
    });

    return { root, light, dark };
}

/**
 * Read the media conditions enclosing a rule, outermost first.
 *
 * Only `@media` is traversed because it is the only at-rule that changes theme
 * applicability. A rule inside any other at-rule is opaque and reported as null.
 *
 * @param {import('postcss').Rule} rule Rule to inspect.
 * @returns {string[] | null} Enclosing media conditions, or null when the rule is not theme relevant.
 */
function mediaConditions(rule) {
    const conditions = [];

    for (let parent = rule.parent; parent !== undefined && parent.type !== 'root'; parent = parent.parent) {
        if (parent.type !== 'atrule') {
            continue;
        }

        if (parent.name.toLowerCase() !== 'media') {
            return null;
        }

        conditions.unshift(parent.params.trim());
    }

    return conditions;
}

/**
 * Classify a selector list by the scopes it declares.
 *
 * @param {string[]} selectors Selectors of one rule.
 * @param {boolean} isDarkMedia Whether the rule sits inside a dark media query.
 * @returns {{root: boolean, light: boolean, dark: boolean}} Scopes the rule contributes to.
 */
function classifySelectors(selectors, isDarkMedia) {
    const scope = { root: false, light: false, dark: false };

    for (const selector of selectors) {
        const positive = stripNegations(selector);
        const themes = selectorThemes(positive, isDarkMedia);

        scope.light ||= themes.has('light');
        scope.dark ||= themes.has('dark');
        scope.root ||= !isDarkMedia && isRootSelector(positive);
    }

    return scope;
}

/**
 * Classify one positive selector by the themes it declares.
 *
 * Negated theme classes are ignored, so `:root:not(.theme-light)` does not count
 * as a light selector.
 *
 * @param {string} selector Selector text without negation groups.
 * @param {boolean} isDarkMedia Whether the rule sits inside a dark media query.
 * @returns {Set<'light' | 'dark'>} Themes the selector contributes to.
 */
function selectorThemes(selector, isDarkMedia) {
    const themes = new Set();

    if (THEME_LIGHT_PATTERN.test(selector)) {
        themes.add('light');
    }

    if (THEME_DARK_PATTERN.test(selector)) {
        themes.add('dark');
    }

    if (isRootSelector(selector)) {
        themes.add(isDarkMedia ? 'dark' : 'light');
    }

    return themes;
}

/**
 * Remove `:not(...)` groups from a selector, including nested groups.
 *
 * @param {string} selector Selector text.
 * @returns {string} Selector without negation groups.
 */
function stripNegations(selector) {
    let current = selector;
    let previous;

    do {
        previous = current;
        current = current.replace(NEGATED_GROUP_PATTERN, '');
    } while (current !== previous);

    return current;
}

/**
 * Check whether a selector targets `:root` itself.
 *
 * @param {string} selector Selector text without negation groups.
 * @returns {boolean} True when the selector starts with the root pseudo-class.
 */
function isRootSelector(selector) {
    return ROOT_SELECTOR_PATTERN.test(selector.trim());
}

/**
 * Read the custom property declarations owned by a rule.
 *
 * Nested rules are separate rules, so only direct declarations belong to the
 * rule being classified.
 *
 * @param {import('postcss').Rule} rule Rule to inspect.
 * @returns {Array<[string, string]>} Declared name and trimmed value pairs.
 */
function readDeclarations(rule) {
    const declarations = [];

    for (const node of rule.nodes ?? []) {
        if (node.type === 'decl' && node.prop.startsWith('--')) {
            declarations.push([node.prop, node.value.trim()]);
        }
    }

    return declarations;
}
