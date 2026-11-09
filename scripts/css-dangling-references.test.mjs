import test from 'node:test';
import assert from 'node:assert/strict';

import { findDanglingReferences } from './css-dangling-references.mjs';

test('reports nothing when every reference is declared', () => {
    const dangling = findDanglingReferences(`
        :root {
            --r-surface: #ffffff;
            --r-text: #1e2128;
            --r-on-surface: var(--r-text);
        }

        .test {
            background: var(--r-surface);
            color: var(--r-on-surface);
        }
    `);

    assert.deepEqual(dangling, []);
});

test('reports a declaration that reads an undeclared custom property', () => {
    const dangling = findDanglingReferences(`
        .test-button {
            background: var(--r-gone);
        }
    `);

    assert.deepEqual(dangling, [{ selector: '.test-button', property: 'background', reference: '--r-gone' }]);
});

test('reports an undeclared reference inside a custom property value', () => {
    const dangling = findDanglingReferences(`
        :root {
            --r-known: #ffffff;
            --r-derived: color-mix(in srgb, var(--r-known), var(--r-gone) 10%);
        }
    `);

    assert.deepEqual(dangling, [{ selector: ':root', property: '--r-derived', reference: '--r-gone' }]);
});

test('reports the reference of a var() fallback form', () => {
    const dangling = findDanglingReferences(`
        :root {
            --r-border: var(--r-gone, 1px);
        }
    `);

    assert.deepEqual(dangling, [{ selector: ':root', property: '--r-border', reference: '--r-gone' }]);
});

test('finds a reference in a declaration nested in an at-rule', () => {
    const dangling = findDanglingReferences(`
        @font-face {
            font-family: var(--r-gone);
        }

        @media (min-width: 40rem) {
            .test-at-rule {
                border-color: var(--r-gone);
            }
        }
    `);

    assert.deepEqual(
        dangling.map(({ selector, property, reference }) => `${selector} ${property} ${reference}`).sort(),
        ['.test-at-rule border-color --r-gone', '@font-face font-family --r-gone'],
    );
});

test('reports a duplicate reference once', () => {
    const dangling = findDanglingReferences(`
        .test {
            color: var(--r-gone);
            border-color: var(--r-gone) var(--r-gone);
        }

        .test {
            color: var(--r-gone);
        }
    `);

    assert.deepEqual(dangling, [
        { selector: '.test', property: 'border-color', reference: '--r-gone' },
        { selector: '.test', property: 'color', reference: '--r-gone' },
    ]);
});
