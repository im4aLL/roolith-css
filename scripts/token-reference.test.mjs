import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { loadTokens } from './css-custom-properties.mjs';
import { parseCssVariableSource, readCssVariableSource } from './css-variable-source.mjs';
import { renderTokenReference } from './token-reference.mjs';

const SOURCE = `
$-theme-component-tokens: (
    light: (
        nav-link-color: var(--r-text),
    ),
    dark: (
        nav-link-color: var(--r-link),
    ),
);

@mixin roolith-css-variable() {
    :root {
        --r-button-radius: #{$button-radius};
        --r-breadcrumb-sep-symbol: '#{$breadcrumb-sep-symbol}';
    }
}
`;

/**
 * Store one token in both resolved theme maps.
 *
 * @param {{light: Map<string, string>, dark: Map<string, string>}} snapshot Token maps.
 * @param {string} token Custom property name.
 * @param {string} lightValue Resolved light value.
 * @param {string | undefined} [darkValue] Resolved dark value, defaults to the light value.
 * @returns {void}
 */
function addToken({ light, dark }, token, lightValue, darkValue = lightValue) {
    light.set(token, lightValue);
    dark.set(token, darkValue);
}

/**
 * Build a snapshot that contains at least one token of every documented kind.
 *
 * @returns {{light: Map<string, string>, dark: Map<string, string>}} Resolved token maps.
 */
function createSnapshot() {
    const snapshot = { light: new Map(), dark: new Map() };

    addToken(snapshot, '--r-color-primary', '#4a5cd0');
    addToken(snapshot, '--r-color-primary-on', '#ffffff');
    addToken(snapshot, '--r-color-primary-text', '#3d4dab', '#8f9be8');

    addToken(snapshot, '--r-accent', '#4a5cd0');
    addToken(snapshot, '--r-accent-on', '#ffffff');
    addToken(snapshot, '--r-accent-text', '#3d4dab', '#8f9be8');

    addToken(snapshot, '--r-surface', '#ffffff', '#181818');
    addToken(snapshot, '--r-text', '#1e2128', '#a3a3a3');
    addToken(snapshot, '--r-border-subtle', '#ebeced', '#2b2b2b');
    addToken(snapshot, '--r-link', '#5568de', '#8f9be8');
    addToken(snapshot, '--r-global-width', '75rem');
    addToken(snapshot, '--r-focus-ring-color', '#5568de', '#8f9be8');
    addToken(snapshot, '--r-animation-duration', '0.25s');

    addToken(snapshot, '--r-button-radius', '0.5rem');
    addToken(snapshot, '--r-button-shadow', '0 0 0 1px rgba(0, 0, 0, 0.04)');
    addToken(snapshot, '--r-nav-link-color', '#1e2128', '#8f9be8');

    addToken(snapshot, '--_r-on-surface', '#000000', '#ffffff');

    return snapshot;
}

test('reads the setting pairs and the theme component token names', () => {
    const sources = parseCssVariableSource(SOURCE);

    assert.equal(sources.settingsPairs.get('--r-button-radius'), 'button-radius');
    assert.equal(sources.settingsPairs.get('--r-breadcrumb-sep-symbol'), 'breadcrumb-sep-symbol');
    assert.deepEqual([...sources.themeTokens], ['--r-nav-link-color']);
});

test('classifies every token into exactly one section', () => {
    const sources = parseCssVariableSource(SOURCE);
    const { markdown, counts } = renderTokenReference({ ...createSnapshot(), sources });

    assert.deepEqual(counts, { total: 17, public: 16, internal: 1 });
    assert.match(markdown, /\| `--r-color-primary` \| `#4a5cd0` \| `#4a5cd0` \| `\$colors\.primary` = `#4a5cd0` \|/);
    assert.match(markdown, /\| `--r-color-primary-on` \| `#ffffff` \| `#ffffff` \| `\$colors-on\.primary` = `#ffffff` \|/);
    assert.match(markdown, /\| `--r-color-primary-text` \| `#3d4dab` \| `#8f9be8` \| derived per theme \|/);
    assert.match(markdown, /\| `--r-accent` \| `#4a5cd0` \| `#4a5cd0` \| `\$accent-roles\.accent` -> `primary` \|/);
    assert.match(markdown, /\| `--r-surface` \| `#ffffff` \| `#181818` \| derived role \|/);
    assert.match(markdown, /\| `--r-global-width` \| `75rem` \| `75rem` \| token layer \|/);
    assert.match(markdown, /\| `--r-button-radius` \| `0\.5rem` \| `0\.5rem` \| `\$button-radius` \|/);
    assert.match(markdown, /\| `--r-button-shadow` \| .* \| token layer \|/);
    assert.match(markdown, /\| `--r-nav-link-color` \| `#1e2128` \| `#8f9be8` \| theme token \|/);
    assert.match(markdown, /\| `--_r-on-surface` \| `#000000` \| `#ffffff` \| internal \|/);
});

test('orders the sections and semantic groups as documented', () => {
    const sources = parseCssVariableSource(SOURCE);
    const { markdown } = renderTokenReference({ ...createSnapshot(), sources });
    const headings = [
        '## Palette primitives',
        '## Accent roles',
        '## Semantic tokens',
        '### Surface',
        '### Text',
        '### Border',
        '### Link',
        '### Global',
        '### Focus',
        '### Animation',
        '## Component tokens',
        '### Button',
        '### Nav',
        '## Internal tokens',
    ];
    let previous = -1;

    for (const heading of headings) {
        const index = markdown.indexOf(heading);

        assert.ok(index > previous, `${heading} is missing or out of order`);
        previous = index;
    }
});

test('escapes a pipe so a value cannot end a table cell', () => {
    const sources = parseCssVariableSource('$-theme-component-tokens: (\n    light: (),\n    dark: (),\n);\n');
    const snapshot = createSnapshot();

    addToken(snapshot, '--r-button-shadow', '0 0 1px red|blue');

    const { markdown } = renderTokenReference({ ...snapshot, sources });

    assert.ok(markdown.includes('| `0 0 1px red\\|blue` |'));
});

test('fails when a token has no section', () => {
    const sources = parseCssVariableSource('$-theme-component-tokens: (\n    light: (),\n    dark: (),\n);\n');
    const snapshot = createSnapshot();

    addToken(snapshot, '--legacy-token', '1px');

    assert.throws(() => renderTokenReference({ ...snapshot, sources }), /--legacy-token/);
});

test('fails when an accent role matches more than one palette slot', () => {
    const sources = parseCssVariableSource('$-theme-component-tokens: (\n    light: (),\n    dark: (),\n);\n');
    const snapshot = createSnapshot();

    addToken(snapshot, '--r-color-brand', '#4a5cd0');
    addToken(snapshot, '--r-color-brand-on', '#ffffff');
    addToken(snapshot, '--r-color-brand-text', '#3d4dab', '#8f9be8');

    assert.throws(
        () => renderTokenReference({ ...snapshot, sources }),
        /Accent role "accent" resolves exactly like palette slots brand, primary/,
    );
});

test('covers every token the framework resolves', () => {
    const { light, dark } = loadTokens();
    const { counts } = renderTokenReference({ light, dark, sources: readCssVariableSource() });
    const values = [...light.values(), ...dark.values()];

    assert.equal(counts.total, light.size);
    assert.equal(light.size, dark.size);
    assert.equal(counts.public + counts.internal, counts.total);
    assert.equal(
        values.some((value) => value.includes('var(')),
        false,
    );
});

test('keeps the generated token reference in sync with the framework', () => {
    const { light, dark } = loadTokens();
    const { markdown } = renderTokenReference({ light, dark, sources: readCssVariableSource() });

    assert.equal(readFileSync(new URL('../TOKENS.md', import.meta.url), 'utf8'), markdown);
});
