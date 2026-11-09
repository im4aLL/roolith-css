/**
 * Classify resolved custom properties into the token reference sections.
 *
 * Every token resolved for light and dark is placed in exactly one section:
 * palette primitives, accent roles, semantic tokens, component tokens, or
 * internal tokens. Component placement comes from the token's first segment
 * after `--r-`. A token that no section claims is reported as an error instead
 * of being dropped.
 *
 * The module returns data only: each row carries raw resolved values and a
 * control descriptor, and the renderer turns those into Markdown.
 *
 * @module token-sections
 */

import {
    PALETTE_PREFIX,
    readAccentRole,
    readAccentRoles,
    readPaletteSlot,
    readPaletteSlots,
} from './token-palette.mjs';

const PUBLIC_PREFIX = '--r-';
const INTERNAL_PREFIX = '--_r-';

/**
 * Where a token's value comes from, before any Markdown is applied.
 *
 * A `text` control is a plain phrase such as `derived per theme`. A `code`
 * control is a setting, role, or slot name, optionally with the value it carries
 * or aliases, joined by `separator`.
 *
 * @typedef {{text?: string, code?: string, value?: string, separator?: string}} Control
 */

/**
 * One row of the reference, with its resolved values.
 *
 * @typedef {{token: string, light?: string, dark?: string, control?: Control}} TokenRow
 */

/**
 * One heading and its rows.
 *
 * @typedef {{title: string, rows: TokenRow[]}} TokenGroup
 */

/**
 * The reference grouped by section, in documented order.
 *
 * @typedef {{palette: TokenRow[], accentRoles: TokenRow[], semantic: TokenGroup[], components: TokenGroup[], internal: TokenRow[]}} Sections
 */

/**
 * Public semantic groups in the order they are documented.
 *
 * The first four groups are the registry roles declared in `_css-variable.scss`.
 * The last three are token layer values that carry no theme role.
 */
const SEMANTIC_GROUPS = [
    {
        title: 'Surface',
        control: { text: 'derived role' },
        matches: (token) => token === '--r-surface' || token.startsWith('--r-surface-'),
    },
    { title: 'Text', control: { text: 'derived role' }, matches: (token) => token.startsWith('--r-text') },
    { title: 'Border', control: { text: 'derived role' }, matches: (token) => token.startsWith('--r-border') },
    { title: 'Link', control: { text: 'derived role' }, matches: (token) => token === '--r-link' },
    { title: 'Global', control: { text: 'token layer' }, matches: (token) => token.startsWith('--r-global-') },
    { title: 'Focus', control: { text: 'token layer' }, matches: (token) => token.startsWith('--r-focus-') },
    { title: 'Animation', control: { text: 'token layer' }, matches: (token) => token.startsWith('--r-animation-') },
];

/**
 * Display names for component segments that are part of a multi-word component.
 *
 * Segments without an entry are title-cased, so `--r-form-input-radius` lands in
 * `Form`. Labels affect headings only and never decide which tokens group.
 */
const COMPONENT_GROUP_LABELS = new Map([
    ['action', 'Action menu'],
    ['combo', 'Combo box'],
    ['img', 'Image'],
    ['quick', 'Quick menu'],
    ['sidebar', 'Sidebar nav'],
    ['toast', 'Toast notification'],
]);

/**
 * Group one resolved token snapshot into the reference sections.
 *
 * @param {{light: Map<string, string>, dark: Map<string, string>, sources: {settingsPairs: Map<string, string>, themeTokens: Set<string>}}} input
 * Resolved token maps and the wiring read from `_css-variable.scss`.
 * @returns {Sections} Sections in documented order.
 * @throws {Error} When a palette token does not match a slot, an accent role matches several slots, a token cannot be classified, or a token is missing from the result.
 */
export function readTokenSections({ light, dark, sources }) {
    const tokens = [...new Set([...light.keys(), ...dark.keys()])].sort();
    const slots = readPaletteSlots(light);
    const context = { light, slots, sources, accentRoles: readAccentRoles({ light, dark, slots }) };
    const collected = {
        palette: [],
        accentRoles: [],
        semantic: new Map(),
        components: new Map(),
        internal: [],
    };
    const unclassified = [];

    for (const token of tokens) {
        const placement = classifyToken(token, context);

        if (placement === null) {
            unclassified.push(token);
            continue;
        }

        const row = { token, light: light.get(token), dark: dark.get(token), control: placement.control };

        appendRow(collected, placement, row);
    }

    if (unclassified.length > 0) {
        throw new Error(
            `Cannot classify ${unclassified.length} token(s) for TOKENS.md: ${unclassified.join(', ')}. Extend scripts/token-sections.mjs so every resolved token has a section.`,
        );
    }

    const sections = {
        palette: collected.palette,
        accentRoles: collected.accentRoles,
        semantic: orderGroups(
            collected.semantic,
            SEMANTIC_GROUPS.map(({ title }) => title),
        ),
        components: orderGroups(collected.components, [...collected.components.keys()].sort()),
        internal: collected.internal,
    };

    if (countTokenRows(sections) !== tokens.length) {
        throw new Error(`TOKENS.md covers ${countTokenRows(sections)} of ${tokens.length} resolved tokens.`);
    }

    return sections;
}

/**
 * Count the rows held by every section.
 *
 * @param {Sections} sections Sections to count.
 * @returns {number} Total row count.
 */
export function countTokenRows(sections) {
    let total = sections.palette.length + sections.accentRoles.length + sections.internal.length;

    for (const group of [...sections.semantic, ...sections.components]) {
        total += group.rows.length;
    }

    return total;
}

/**
 * Place one token in a section and describe what controls it.
 *
 * @param {string} token Custom property name.
 * @param {{light: Map<string, string>, slots: string[], sources: {settingsPairs: Map<string, string>, themeTokens: Set<string>}, accentRoles: Map<string, string>}} context
 * Resolved snapshot and derived palette knowledge.
 * @returns {{section: string, group?: string, control?: Control} | null} Placement, or null when no section claims the token.
 * @throws {Error} When a `--r-color-*` token does not match a palette slot.
 */
function classifyToken(token, context) {
    if (token.startsWith(INTERNAL_PREFIX)) {
        return { section: 'internal' };
    }

    if (token.startsWith(PALETTE_PREFIX)) {
        const slot = readPaletteSlot(token, context.slots);

        if (slot === null) {
            throw new Error(`Palette token ${token} does not match a slot in $colors.`);
        }

        return { section: 'palette', control: describePalette(token, slot, context.light.get(token)) };
    }

    const accentRole = readAccentRole(token, context.accentRoles);

    if (accentRole !== null) {
        return { section: 'accentRoles', control: describeAccent(accentRole) };
    }

    const semanticGroup = SEMANTIC_GROUPS.find(({ matches }) => matches(token));

    if (semanticGroup !== undefined) {
        return { section: 'semantic', group: semanticGroup.title, control: semanticGroup.control };
    }

    const componentGroup = readComponentGroup(token);

    if (componentGroup === null) {
        return null;
    }

    return { section: 'components', group: componentGroup, control: describeComponent(token, context.sources) };
}

/**
 * Describe the setting behind a palette token.
 *
 * @param {string} token Palette token.
 * @param {string} slot Palette slot that owns the token.
 * @param {string | undefined} lightValue Resolved light value, used as the setting default.
 * @returns {Control} Control descriptor.
 */
function describePalette(token, slot, lightValue) {
    const base = `${PALETTE_PREFIX}${slot}`;

    if (token === base) {
        return { code: `$colors.${slot}`, value: lightValue, separator: '=' };
    }

    if (token === `${base}-on`) {
        return { code: `$colors-on.${slot}`, value: lightValue, separator: '=' };
    }

    return { text: 'derived per theme' };
}

/**
 * Describe the role alias behind an accent role token.
 *
 * @param {{role: string, slot: string}} accentRole Owning role and its slot.
 * @returns {Control} Control descriptor.
 */
function describeAccent(accentRole) {
    return { code: `$accent-roles.${accentRole.role}`, value: accentRole.slot, separator: '->' };
}

/**
 * Describe what controls a component token.
 *
 * @param {string} token Custom property name.
 * @param {{settingsPairs: Map<string, string>, themeTokens: Set<string>}} sources Wiring read from `_css-variable.scss`.
 * @returns {Control} Control descriptor naming the interpolated setting, the theme token map, or the token layer.
 */
function describeComponent(token, sources) {
    const setting = sources.settingsPairs.get(token);

    if (setting !== undefined) {
        return { code: `$${setting}` };
    }

    if (sources.themeTokens.has(token)) {
        return { text: 'theme token' };
    }

    return { text: 'token layer' };
}

/**
 * Read the component heading a token belongs to.
 *
 * @param {string} token Custom property name.
 * @returns {string | null} Group title, or null when the token has no component segment.
 */
function readComponentGroup(token) {
    if (!token.startsWith(PUBLIC_PREFIX)) {
        return null;
    }

    const segment = token.slice(PUBLIC_PREFIX.length).split('-')[0];

    if (segment === undefined || segment === '') {
        return null;
    }

    return COMPONENT_GROUP_LABELS.get(segment) ?? `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`;
}

/**
 * Add a row to the section and group named by a placement.
 *
 * @param {{palette: TokenRow[], accentRoles: TokenRow[], semantic: Map<string, TokenRow[]>, components: Map<string, TokenRow[]>, internal: TokenRow[]}} collected Collector by section.
 * @param {{section: string, group?: string}} placement Section placement.
 * @param {TokenRow} row Row to store.
 * @returns {void}
 * @throws {Error} When the placement names a section that does not exist.
 */
function appendRow(collected, placement, row) {
    switch (placement.section) {
        case 'palette':
            collected.palette.push(row);
            return;
        case 'accentRoles':
            collected.accentRoles.push(row);
            return;
        case 'semantic':
            appendGroupRow(collected.semantic, placement.group, row);
            return;
        case 'components':
            appendGroupRow(collected.components, placement.group, row);
            return;
        case 'internal':
            collected.internal.push(row);
            return;
        default:
            throw new Error(`Unknown token section "${placement.section}".`);
    }
}

/**
 * Append a row to one group inside a section.
 *
 * @param {Map<string, TokenRow[]>} groups Rows grouped by heading.
 * @param {string | undefined} title Group heading.
 * @param {TokenRow} row Row to store.
 * @returns {void}
 */
function appendGroupRow(groups, title, row) {
    const groupRows = groups.get(title) ?? [];

    groupRows.push(row);
    groups.set(title, groupRows);
}

/**
 * Turn grouped rows into an ordered list, skipping empty groups.
 *
 * @param {Map<string, TokenRow[]>} groups Rows grouped by heading.
 * @param {string[]} titles Heading order.
 * @returns {TokenGroup[]} Groups that hold at least one row.
 */
function orderGroups(groups, titles) {
    return titles.filter((title) => groups.has(title)).map((title) => ({ title, rows: groups.get(title) }));
}
