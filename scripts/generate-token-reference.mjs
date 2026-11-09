/**
 * Generate `TOKENS.md` from the compiled framework.
 *
 * The command compiles the Sass entry point, resolves every custom property for
 * both themes, reads the token wiring that only the SCSS source carries, and
 * writes the reference document. It is wired to `npm run tokens` and runs before
 * `vite build`.
 *
 * @module generate-token-reference
 */

import { writeFileSync } from 'node:fs';
import { loadTokens } from './css-custom-properties.mjs';
import { readCssVariableSource } from './css-variable-source.mjs';
import { renderTokenReference } from './token-reference.mjs';

const OUTPUT_FILE = 'TOKENS.md';

/**
 * Write the generated token reference and report the totals.
 *
 * A value may keep a non-computable `color-mix()` expression, because that is
 * what the browser receives and the resolver refuses to invent a colour. A value
 * that still contains `var()` means a reference the theme never declares, so the
 * document would be wrong and the command stops instead.
 *
 * @returns {void}
 * @throws {Error} When a token references an undeclared custom property or does not fit a section.
 */
function generateTokenReference() {
    const { light, dark } = loadTokens();
    const dangling = [...new Set([...light.keys(), ...dark.keys()])].filter((token) => {
        return (light.get(token) ?? '').includes('var(') || (dark.get(token) ?? '').includes('var(');
    });

    if (dangling.length > 0) {
        throw new Error(
            `Cannot generate ${OUTPUT_FILE}, ${dangling.length} token(s) reference an undeclared custom property: ${dangling.join(', ')}`,
        );
    }

    const sources = readCssVariableSource();
    const { markdown, counts } = renderTokenReference({ light, dark, sources });

    writeFileSync(OUTPUT_FILE, markdown);
    process.stdout.write(
        `wrote ${OUTPUT_FILE}: ${counts.total} tokens (${counts.public} public, ${counts.internal} internal)\n`,
    );
}

try {
    generateTokenReference();
} catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
}
