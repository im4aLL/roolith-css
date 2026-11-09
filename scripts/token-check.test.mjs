import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compile } from 'sass-embedded';

const SOURCE_DIRECTORY = 'src/sass';
const REGISTRY_FILE = '_token-registry.scss';
const CSS_VARIABLE_FILE = '_css-variable.scss';
const RESOLVED_FILE = '_resolved.scss';

/**
 * Compile a temporary copy of the Sass sources with one or more files rewritten.
 *
 * The token invariants are load-time side effects of importing the check module,
 * so only a real compile can exercise them. Mutating a copy keeps the checked-in
 * sources intact.
 *
 * @param {Array<{file: string, mutate: (scss: string) => string}>} mutations Files to rewrite inside the copy.
 * @returns {{compiled: boolean, message: string}} Whether the compile succeeded and the error message when it did not.
 */
function compileMutated(mutations) {
    const directory = mkdtempSync(join(tmpdir(), 'roolith-token-check-'));
    const sassDirectory = join(directory, 'sass');

    cpSync(SOURCE_DIRECTORY, sassDirectory, { recursive: true });

    try {
        for (const { file, mutate } of mutations) {
            const target = join(sassDirectory, file);
            const original = readFileSync(target, 'utf8');
            const mutated = mutate(original);

            assert.notEqual(mutated, original, `The mutation of ${file} did not apply.`);
            writeFileSync(target, mutated);
        }

        compile(join(sassDirectory, 'roolith.scss'), { loadPaths: [sassDirectory], style: 'expanded' });

        return { compiled: true, message: '' };
    } catch (error) {
        if (error instanceof assert.AssertionError) {
            throw error;
        }

        return { compiled: false, message: error instanceof Error ? error.message : String(error) };
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
}

/**
 * Delete one component token entry from the light or dark map of the registry.
 *
 * @param {'light' | 'dark'} theme Map to delete from.
 * @param {string} name Component token key.
 * @returns {(scss: string) => string} Mutation that removes that entry.
 */
function dropComponentToken(theme, name) {
    return (scss) => {
        const anchor = `    ${theme}: (`;
        const start = scss.indexOf(anchor);

        assert.notEqual(start, -1, `The ${theme} component token map is missing.`);

        const pattern = new RegExp(`\\n[ ]+${name}: [^\\n]+,`);
        const head = scss.slice(0, start);
        const tail = scss.slice(start);

        assert.ok(pattern.test(tail), `The ${theme} ${name} entry is missing.`);

        return head + tail.replace(pattern, '');
    };
}

test('fails when a component token is missing from the dark map', () => {
    const result = compileMutated([
        { file: REGISTRY_FILE, mutate: dropComponentToken('light', 'badge-surface') },
    ]);

    assert.equal(result.compiled, false);
    assert.match(result.message, /Component token "badge-surface" is defined for dark but missing from light/);
});

test('fails when a component token is missing from the light map', () => {
    const result = compileMutated([
        { file: REGISTRY_FILE, mutate: dropComponentToken('dark', 'badge-surface') },
    ]);

    assert.equal(result.compiled, false);
    assert.match(result.message, /Component token "badge-surface" is defined for light but missing from dark/);
});

test('fails when a derived theme role is not registered', () => {
    const result = compileMutated([
        {
            file: RESOLVED_FILE,
            mutate: (scss) =>
                scss.replace(
                    '$colors-text-light: ();',
                    '$theme-light: map.merge($theme-light, (bogus: red));\n\n$colors-text-light: ();',
                ),
        },
    ]);

    assert.equal(result.compiled, false);
    assert.match(result.message, /Theme role "bogus" from the light theme is not classified by a token registry/);
});

test('fails when a registered role has no derived value', () => {
    const result = compileMutated([
        {
            file: REGISTRY_FILE,
            mutate: (scss) => scss.replace("    link: '--r-link',\n", "    link: '--r-link',\n    bogus: '--r-bogus',\n"),
        },
    ]);

    assert.equal(result.compiled, false);
    assert.match(result.message, /Token registry entry "bogus" \(--r-bogus\) has no derived value in the light theme/);
});

test('runs the token checks because the token layer imports them', () => {
    const result = compileMutated([
        { file: REGISTRY_FILE, mutate: dropComponentToken('dark', 'badge-surface') },
        { file: CSS_VARIABLE_FILE, mutate: (scss) => scss.replace("@use './token-check';\n", '') },
    ]);

    assert.equal(result.compiled, true, 'The check module must be the only reason the guards run.');
});
