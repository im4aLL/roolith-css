/**
 * Emits a CSS file that lists the custom properties (CSS variables) defined by
 * the framework, so the tokens can be inspected without reading the Sass.
 *
 * Usage:
 *   node scripts/generate-css-variables.mjs [--all] [--out <path>]
 *
 * --all  include every custom property the framework sets, including the ones
 *        scoped to component rules (for example --grid-span), instead of only
 *        the theme tokens declared on :root, .theme-light and .theme-dark.
 * --out  write to <path> instead of dist/roolith-variables.css.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import { compileString } from 'sass-embedded';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sassDir = path.join(projectRoot, 'src', 'sass');
const defaultOutFile = path.join(projectRoot, 'dist', 'roolith-variables.css');

const themeEntry = "@use 'css-var';\n@include css-var.css-variable();\n";
const everythingEntry = "@use 'roolith';\n";

const referencePattern = /var\(\s*(--[A-Za-z0-9_-]+)/g;

/**
 * Reads the command line arguments into a resolved run configuration.
 * @param {string[]} argv Process arguments without the node and script entries.
 * @returns {{includeAll: boolean, outFile: string}} The parsed options.
 */
function parseArgs(argv) {
    const options = { includeAll: false, outFile: defaultOutFile };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];

        if (arg === '--all') {
            options.includeAll = true;
        } else if (arg === '--out') {
            const value = argv[index + 1];
            index += 1;

            if (!value) {
                throw new Error('--out requires a file path');
            }

            options.outFile = path.resolve(process.cwd(), value);
        } else if (arg.startsWith('--out=')) {
            options.outFile = path.resolve(process.cwd(), arg.slice('--out='.length));
        } else {
            throw new Error(`unknown argument: ${arg}`);
        }
    }

    if (path.extname(options.outFile) !== '.css') {
        throw new Error(`--out must point to a .css file, got ${options.outFile}`);
    }

    return options;
}

/**
 * Compiles a Sass entry against the framework sources.
 * @param {string} source Sass source to compile.
 * @returns {string} The compiled CSS.
 */
function compileCss(source) {
    const result = compileString(source, {
        loadPaths: [sassDir],
        style: 'expanded',
    });

    return result.css;
}

/**
 * Tests whether a declaration defines a CSS custom property.
 * @param {import('postcss').Node} node Node to test.
 * @returns {boolean} True when the node is a custom property declaration.
 */
function isCustomProperty(node) {
    return node.type === 'decl' && node.prop.startsWith('--');
}

/**
 * Removes every declaration that is not a custom property, then drops the rules
 * and at-rules left empty. Editing in place keeps the compiler formatting.
 * @param {import('postcss').Root} root Parsed stylesheet to edit.
 * @returns {import('postcss').Root} The same root with only custom properties.
 */
function stripEverythingElse(root) {
    root.walkComments((comment) => comment.remove());
    root.walkAtRules('charset', (atRule) => atRule.remove());

    root.walkDecls((declaration) => {
        if (!isCustomProperty(declaration)) {
            declaration.remove();
        }
    });

    let removedSomething = true;

    while (removedSomething) {
        removedSomething = false;

        root.walk((node) => {
            if ((node.type === 'rule' || node.type === 'atrule') && node.nodes && node.nodes.length === 0) {
                node.remove();
                removedSomething = true;
            }
        });
    }

    return root;
}

/**
 * Collects the names of every custom property the stylesheet defines and references.
 * @param {import('postcss').Root} root Stylesheet to inspect.
 * @returns {{defined: Set<string>, referenced: Set<string>, declarations: number}} Collected names.
 */
function collectNames(root) {
    const defined = new Set();
    const referenced = new Set();
    let declarations = 0;

    root.walkDecls((declaration) => {
        if (isCustomProperty(declaration)) {
            defined.add(declaration.prop);
            declarations += 1;
        }

        for (const match of declaration.value.matchAll(referencePattern)) {
            referenced.add(match[1]);
        }
    });

    return { defined, referenced, declarations };
}

/**
 * Generates the variables stylesheet and writes it, reporting what it found.
 * @param {{includeAll: boolean, outFile: string}} options Run configuration.
 * @returns {Promise<void>} Resolves once the file is written.
 */
async function main(options) {
    const css = compileCss(options.includeAll ? everythingEntry : themeEntry);
    const root = stripEverythingElse(postcss.parse(css));

    if (root.nodes.length === 0) {
        throw new Error('no custom properties were found, the Sass entry changed');
    }

    const { defined, referenced, declarations } = collectNames(root);
    const undefinedRefs = [...referenced].filter((name) => !defined.has(name)).sort();
    const output = `${root.toString()}\n`;

    await fs.mkdir(path.dirname(options.outFile), { recursive: true });
    await fs.writeFile(options.outFile, output, 'utf8');

    const scopes = root.nodes.map((node) => (node.type === 'rule' ? node.selector : `@${node.name} ${node.params}`));
    const relativeOutFile = path.relative(projectRoot, options.outFile);

    console.log(`scope: ${options.includeAll ? 'all custom properties' : 'theme tokens'}`);
    console.log(`blocks: ${scopes.length}`);
    scopes.forEach((scope) => console.log(`  ${scope}`));
    console.log(`variables: ${defined.size}`);
    console.log(`declarations: ${declarations}`);

    if (undefinedRefs.length > 0) {
        console.warn(`referenced but never defined here: ${undefinedRefs.join(', ')}`);
    }

    console.log(
        `wrote: ${relativeOutFile.startsWith('..') ? options.outFile : relativeOutFile} (${output.length} bytes)`,
    );
}

try {
    await main(parseArgs(process.argv.slice(2)));
} catch (error) {
    console.error(`generate-css-variables: ${error.message}`);
    process.exitCode = 1;
}
