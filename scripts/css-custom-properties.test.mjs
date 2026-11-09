import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveTokens } from './css-custom-properties.mjs';

test('classifies :root, theme classes, and the dark media query', () => {
    const { light, dark } = resolveTokens(`
        :root {
            --test-root: #111111;
        }

        .theme-light {
            --test-light: #222222;
        }

        .theme-dark {
            --test-dark: #333333;
        }

        @media (prefers-color-scheme: dark) {
            :root:not(.theme-light) {
                --test-media: #444444;
            }
        }
    `);

    assert.equal(light.get('--test-root'), '#111111');
    assert.equal(light.get('--test-light'), '#222222');
    assert.equal(light.has('--test-dark'), false);
    assert.equal(light.has('--test-media'), false);

    assert.equal(dark.get('--test-dark'), '#333333');
    assert.equal(dark.get('--test-media'), '#444444');
    assert.equal(dark.has('--test-light'), false);
    assert.equal(dark.get('--test-root'), '#111111');
});

test('applies a shared selector list to both themes', () => {
    const { light, dark } = resolveTokens(`
        :root,
        .theme-light,
        .theme-dark {
            --test-shared: #abcdef;
        }
    `);

    assert.equal(light.get('--test-shared'), '#abcdef');
    assert.equal(dark.get('--test-shared'), '#abcdef');
});

test('resolves a multi-hop var() chain to the literal value', () => {
    const { light, dark } = resolveTokens(`
        :root {
            --test-base: #123456;
            --test-middle: var(--test-base);
            --test-end: var(--test-middle);
        }
    `);

    assert.equal(light.get('--test-base'), '#123456');
    assert.equal(light.get('--test-middle'), '#123456');
    assert.equal(light.get('--test-end'), '#123456');
    assert.equal(dark.get('--test-end'), '#123456');
});

test('throws when var() references form a cycle and names the cycle', () => {
    assert.throws(
        () =>
            resolveTokens(`
                :root {
                    --test-first: var(--test-second);
                    --test-second: var(--test-first);
                }
            `),
        /Circular custom property reference: --test-first -> --test-second -> --test-first/,
    );
});

test('reports an undeclared var() reference and leaves it in the value', () => {
    const { light, unresolved } = resolveTokens(`
        :root {
            --test-known: #010203;
            --test-needs-missing: var(--test-unknown);
        }
    `);

    assert.equal(light.get('--test-needs-missing'), 'var(--test-unknown)');

    const failure = unresolved.find(({ token }) => token === '--test-needs-missing');

    assert.notEqual(failure, undefined);
    assert.deepEqual(failure.themes, ['light', 'dark']);
    assert.match(failure.reason, /undeclared --test-unknown/);
});

test('resolves color-mix() with two opaque colours and reports a transparent argument', () => {
    const { light, unresolved } = resolveTokens(`
        :root {
            --test-mix: color-mix(in srgb, #000000, #ffffff 50%);
            --test-transparent-mix: color-mix(in srgb, #000000, transparent);
        }
    `);

    assert.equal(light.get('--test-mix'), '#808080');
    assert.equal(light.get('--test-transparent-mix'), 'color-mix(in srgb, #000000, transparent)');

    const failure = unresolved.find(({ token }) => token === '--test-transparent-mix');

    assert.notEqual(failure, undefined);
    assert.deepEqual(failure.themes, ['light', 'dark']);
    assert.match(failure.reason, /transparent/);
    assert.equal(
        unresolved.some(({ token }) => token === '--test-mix'),
        false,
    );
});
