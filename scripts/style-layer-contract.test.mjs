import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';

const STYLE_LAYER_DIRECTORIES = ['src/sass/modules', 'src/sass/blocks'];
const STYLE_LAYER_FILES = ['src/sass/_base.scss', 'src/sass/_typography.scss', 'src/sass/_reset.scss'];
const STYLE_LAYER_SENTINEL = 'src/sass/modules/_button.scss';
const FUNCTION_DIRECTORY = 'src/sass/function';
const MIXIN_DIRECTORY = 'src/sass/mixin';

const STATEMENT_PATTERN = /^\s*@(use|forward|import)\s*(?:url\()?['"]([^'"]+)['"]/;
const STYLE_LAYER_USE_TARGETS = new Set(['../function', './function', '../mixin', './mixin']);
const STYLE_LAYER_FILE_FLOOR = 50;

/**
 * Per-file @use exceptions in the mixin layer. `../settings` is the
 * configuration `breakpoint()` needs at compile time and `./transition` is the
 * sibling `button-base()` composes itself out of, so each target is allowed
 * only in the file that cannot avoid it.
 */
const MIXIN_USE_EXCEPTIONS = new Map([
    ['src/sass/mixin/_breakpoint.scss', new Set(['../settings'])],
    ['src/sass/mixin/_button-pattern.scss', new Set(['./transition'])],
]);

/**
 * Statement floors sit at least one statement below the current count, and
 * roughly ten percent below it in the larger layers. They are floors, not
 * exact numbers, so the guard fails loudly when the parser or the scanned
 * paths regress instead of quietly passing on an empty statement list, while a
 * legitimate reduction still clears the floor.
 */
const STATEMENT_FLOORS = {
    style: { use: 90, forward: 48 },
    function: { use: 3, forward: 3 },
    mixin: { use: 6, forward: 13 },
};

/**
 * Whether a target is a Sass core module.
 *
 * @param {string} target Import target from an @use statement.
 * @returns {boolean} True for `sass:*` targets.
 */
function isSassCore(target) {
    return target.startsWith('sass:');
}

/**
 * Whether a target is a sibling partial in the same directory. A forward lets
 * a layer's `index.scss` re-export a sibling, but it may not reach
 * configuration from another directory.
 *
 * @param {string} target Import target from an @forward statement.
 * @returns {boolean} True for `./<name>` targets.
 */
function isSiblingPartial(target) {
    return /^\.\/[^/]+$/.test(target);
}

/**
 * Whether a statement kind is always a violation. The statement is ignored
 * because every target of this kind is rejected.
 *
 * @returns {boolean} Always false.
 */
function isNeverAllowed() {
    return false;
}

/**
 * Rules that keep the style layer dependent on functions, mixins and Sass
 * core. Configuration is a mixin argument, never an import.
 *
 * `@use` carries the dependency, so it may only reach the two helper layers
 * and Sass core. `@forward` only re-exports siblings for the layer's
 * `index.scss` files. `@import` predates the module system and can pull any
 * global configuration in, so it is always a violation, including a CSS
 * `url('...')` import. Only quoted targets are parsed. `meta.load-css()` would
 * load a module at runtime and is deliberately out of scope: no source uses
 * it.
 */
const STYLE_LAYER_RULE = {
    label: 'style layer',
    floor: STATEMENT_FLOORS.style,
    isAllowed: {
        use: ({ target }) => isSassCore(target) || STYLE_LAYER_USE_TARGETS.has(target),
        forward: ({ target }) => isSiblingPartial(target),
        import: isNeverAllowed,
    },
};

/**
 * Rules that keep the function layer dependency-free apart from Sass core.
 * `@forward` only re-exports siblings; `@import` is always a violation.
 */
const FUNCTION_RULE = {
    label: 'function layer',
    floor: STATEMENT_FLOORS.function,
    isAllowed: {
        use: ({ target }) => isSassCore(target),
        forward: ({ target }) => isSiblingPartial(target),
        import: isNeverAllowed,
    },
};

/**
 * Rules for the mixin layer: `@use` may reach Sass core and the function
 * helpers in every file, plus the extras listed for that file alone in
 * `MIXIN_USE_EXCEPTIONS`, which records why each exception exists. `@forward`
 * only re-exports siblings; `@import` is always a violation.
 */
const MIXIN_RULE = {
    label: 'mixin layer',
    floor: STATEMENT_FLOORS.mixin,
    isAllowed: {
        use: ({ file, target }) =>
            isSassCore(target) ||
            target === '../function' ||
            (MIXIN_USE_EXCEPTIONS.get(file)?.has(target) ?? false),
        forward: ({ target }) => isSiblingPartial(target),
        import: isNeverAllowed,
    },
};

/**
 * List every Sass partial below a directory, recursively.
 *
 * Paths are normalised to forward slashes so they match the POSIX keys in the
 * layer rules on every platform.
 *
 * @param {string} directory Repo-relative directory to scan.
 * @returns {string[]} Repo-relative partial paths with forward slashes, sorted.
 */
function listSassFiles(directory) {
    const files = [];

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name).split(sep).join('/');

        if (entry.isDirectory()) {
            files.push(...listSassFiles(path));
        } else if (entry.name.endsWith('.scss')) {
            files.push(path);
        }
    }

    return files.sort();
}

/**
 * Collect every @use, @forward and @import statement in one Sass source.
 *
 * @param {string} file Repo-relative file path used in violation messages.
 * @param {string} content Sass source text.
 * @returns {Array<{file: string, kind: string, line: number, target: string}>} Statements in file order.
 */
function parseStatements(file, content) {
    const statements = [];

    content.split(/\r?\n/).forEach((text, index) => {
        const match = text.match(STATEMENT_PATTERN);

        if (match) {
            statements.push({ file, kind: match[1], line: index + 1, target: match[2] });
        }
    });

    return statements;
}

/**
 * Read and parse every dependency statement in the given files.
 *
 * @param {string[]} files Repo-relative Sass file paths.
 * @returns {Array<{file: string, kind: string, line: number, target: string}>} Statements.
 */
function readStatements(files) {
    return files.flatMap((file) => parseStatements(file, readFileSync(file, 'utf8')));
}

/**
 * Count parsed statements per kind.
 *
 * @param {Array<{kind: string}>} statements Parsed statements.
 * @returns {{use: number, forward: number, import: number}} Statement count per kind.
 */
function countStatements(statements) {
    const counts = { use: 0, forward: 0, import: 0 };

    for (const { kind } of statements) {
        counts[kind] += 1;
    }

    return counts;
}

/**
 * Assert that the scan parsed at least the layer's statement floor, so a
 * broken pattern or a wrong path cannot pass as an empty violation list.
 *
 * @param {Array<{kind: string}>} statements Parsed statements for the layer.
 * @param {{label: string, floor: {use: number, forward: number}}} rule Layer rule with its statement floor.
 * @returns {void}
 */
function assertStatementFloors(statements, rule) {
    const counts = countStatements(statements);

    for (const kind of ['use', 'forward']) {
        const floor = rule.floor[kind];

        assert.ok(
            counts[kind] >= floor,
            `The ${rule.label} scan parsed ${counts[kind]} @${kind} statements, below the floor of ${floor}. ` +
                'Raise the floor when adding partials, or confirm the reduction was intentional.',
        );
    }
}

/**
 * Describe every statement that a layer rule does not allow.
 *
 * Every violation is returned, not only the first, so a single run reports the
 * whole boundary break.
 *
 * @param {Array<{file: string, kind: string, line: number, target: string}>} statements Parsed statements.
 * @param {{label: string, isAllowed: Record<string, (statement: {file: string, kind: string, line: number, target: string}) => boolean>}} rule Layer rule to apply.
 * @returns {string[]} One `file:line - @kind target` line per violation.
 */
function findViolations(statements, rule) {
    return statements
        .filter((statement) => !rule.isAllowed[statement.kind](statement))
        .map(({ file, kind, line, target }) => `${file}:${line} - @${kind} ${target}`);
}

test('keeps the style layer on functions, mixins and Sass core only', () => {
    const files = [...STYLE_LAYER_DIRECTORIES.flatMap(listSassFiles), ...STYLE_LAYER_FILES];

    assert.ok(
        files.length >= STYLE_LAYER_FILE_FLOOR,
        `The style layer scan found ${files.length} files, below the floor of ${STYLE_LAYER_FILE_FLOOR}. ` +
            'Raise the floor when adding partials, or confirm the reduction was intentional.',
    );
    assert.ok(files.includes(STYLE_LAYER_SENTINEL), `The style layer scan did not include ${STYLE_LAYER_SENTINEL}.`);

    const statements = readStatements(files);

    assertStatementFloors(statements, STYLE_LAYER_RULE);

    assert.deepEqual(findViolations(statements, STYLE_LAYER_RULE), []);
});

test('keeps the function layer on Sass core only', () => {
    const files = listSassFiles(FUNCTION_DIRECTORY);

    assert.ok(files.length > 0, 'The function layer scan found no files.');

    const statements = readStatements(files);

    assertStatementFloors(statements, FUNCTION_RULE);

    assert.deepEqual(findViolations(statements, FUNCTION_RULE), []);
});

test('keeps the mixin layer on Sass core, functions and settings', () => {
    const files = listSassFiles(MIXIN_DIRECTORY);

    assert.ok(files.length > 0, 'The mixin layer scan found no files.');

    const statements = readStatements(files);

    assertStatementFloors(statements, MIXIN_RULE);

    assert.deepEqual(findViolations(statements, MIXIN_RULE), []);
});

test('accepts Sass core, allowed siblings and sibling forwards', () => {
    const statements = parseStatements(
        'src/sass/modules/_example.scss',
        "@use 'sass:map';\n@use '../function' as *;\n@use '../mixin';\n@forward './button';\n",
    );

    assert.equal(statements.length, 4);
    assert.deepEqual(findViolations(statements, STYLE_LAYER_RULE), []);

    const mixinStatements = [
        ...parseStatements('src/sass/mixin/_breakpoint.scss', "@use 'sass:map';\n@use '../settings' as *;\n"),
        ...parseStatements(
            'src/sass/mixin/_button-pattern.scss',
            "@use '../function' as *;\n@use './transition' as *;\n@forward './transition';\n",
        ),
    ];

    assert.equal(mixinStatements.length, 5);
    assert.deepEqual(findViolations(mixinStatements, MIXIN_RULE), []);
});

test('counts parsed statements per kind', () => {
    const statements = parseStatements(
        'src/sass/modules/_example.scss',
        "@use 'sass:map';\n@use '../function' as *;\n@forward './button';\n@forward './card';\n@import 'legacy';\n",
    );

    assert.deepEqual(countStatements(statements), { use: 2, forward: 2, import: 1 });
});

test('fails when the scan parses fewer statements than the floor', () => {
    assert.throws(() => assertStatementFloors([], STYLE_LAYER_RULE), /@use statements/);
});

test('fails on the forward floor when only @use statements are parsed', () => {
    assert.throws(
        () => assertStatementFloors(Array(STYLE_LAYER_RULE.floor.use).fill({ kind: 'use' }), STYLE_LAYER_RULE),
        /@forward statements/,
    );
});

test('reports every style layer file that imports configuration', () => {
    const statements = parseStatements(
        'src/sass/modules/_example.scss',
        "@use '../function' as *;\n@use '../settings';\n@use '../resolved';\n@use '../function' as *;\n",
    );

    assert.deepEqual(findViolations(statements, STYLE_LAYER_RULE), [
        'src/sass/modules/_example.scss:2 - @use ../settings',
        'src/sass/modules/_example.scss:3 - @use ../resolved',
    ]);
});

test('reports a style layer forward or import that reaches configuration', () => {
    const statements = parseStatements(
        'src/sass/modules/_example.scss',
        "@forward '../settings';\n@import '../settings';\n@import '../resolved';\n",
    );

    assert.deepEqual(findViolations(statements, STYLE_LAYER_RULE), [
        'src/sass/modules/_example.scss:1 - @forward ../settings',
        'src/sass/modules/_example.scss:2 - @import ../settings',
        'src/sass/modules/_example.scss:3 - @import ../resolved',
    ]);
});

test('reports a function layer file that imports a sibling module', () => {
    const statements = parseStatements(
        'src/sass/function/_example.scss',
        "@use 'sass:math';\n@use '../settings';\n@forward '../settings';\n@import '../settings';\n",
    );

    assert.deepEqual(findViolations(statements, FUNCTION_RULE), [
        'src/sass/function/_example.scss:2 - @use ../settings',
        'src/sass/function/_example.scss:3 - @forward ../settings',
        'src/sass/function/_example.scss:4 - @import ../settings',
    ]);
});

test('reports a CSS url() import and a no-whitespace @use statement', () => {
    const statements = parseStatements(
        'src/sass/modules/_example.scss',
        "@import url('https://example.com/legacy.css');\n@use'../settings';\n",
    );

    assert.equal(statements.length, 2);
    assert.deepEqual(findViolations(statements, STYLE_LAYER_RULE), [
        'src/sass/modules/_example.scss:1 - @import https://example.com/legacy.css',
        'src/sass/modules/_example.scss:2 - @use ../settings',
    ]);
});

test('reports a mixin layer file that imports a derived or token module', () => {
    const statements = parseStatements(
        'src/sass/mixin/_example.scss',
        "@use 'sass:map';\n@use '../resolved';\n@use '../token-registry';\n",
    );

    assert.deepEqual(findViolations(statements, MIXIN_RULE), [
        'src/sass/mixin/_example.scss:2 - @use ../resolved',
        'src/sass/mixin/_example.scss:3 - @use ../token-registry',
    ]);
});

test('allows a mixin exception only in the file that owns it', () => {
    const statements = parseStatements(
        'src/sass/mixin/_button-pattern.scss',
        "@use '../settings' as *;\n@use '../function' as *;\n@use './transition' as *;\n",
    );

    assert.deepEqual(findViolations(statements, MIXIN_RULE), [
        'src/sass/mixin/_button-pattern.scss:1 - @use ../settings',
    ]);
});
