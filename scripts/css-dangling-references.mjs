/**
 * Find custom property references that the stylesheet never declares.
 *
 * The check is compile-agnostic: it works on expanded CSS text and only needs
 * PostCSS, so it can run against the compiled framework, a partial stylesheet,
 * or a fixture. It exists because a removed or renamed token now fails silently
 * at runtime, where the browser drops the declaration and the component renders
 * with an inherited or initial value instead of the intended one.
 *
 * A reference that supplies a fallback, `var(--x, 1px)`, is still reported,
 * because the intent is to notice any token the stylesheet no longer declares
 * rather than to rely on the browser fallback.
 *
 * The declared set is collected across the whole stylesheet regardless of theme
 * scope, which is sufficient here because the theme scopes are validated to emit
 * identical key sets, but it would not catch a token declared in only one theme.
 *
 * @module css-dangling-references
 */

import postcss from 'postcss';

const VAR_REFERENCE_PATTERN = /var\(\s*(--[A-Za-z0-9_-]+)/g;

/**
 * Collect every custom property name the stylesheet declares.
 *
 * @param {import('postcss').Root} root Parsed stylesheet.
 * @returns {Set<string>} Declared custom property names.
 */
function collectDeclarations(root) {
    const declarations = new Set();

    root.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
            declarations.add(decl.prop);
        }
    });

    return declarations;
}

/**
 * Collect every var() reference read by a declaration value.
 *
 * Custom property values are inspected as well, because a token that points at
 * a missing token fails exactly like a component declaration does. Identical
 * selector, property, and reference triples collapse into one entry.
 *
 * @param {import('postcss').Root} root Parsed stylesheet.
 * @returns {Array<{selector: string, property: string, reference: string}>} References in stylesheet order.
 */
function collectReferences(root) {
    const references = [];
    const seen = new Set();

    root.walkDecls((decl) => {
        const selector = referenceSelector(decl);

        for (const match of decl.value.matchAll(VAR_REFERENCE_PATTERN)) {
            const reference = match[1];
            const key = `${selector}|${decl.prop}|${reference}`;

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);
            references.push({ selector, property: decl.prop, reference });
        }
    });

    return references;
}

/**
 * Name the scope a declaration belongs to.
 *
 * A declaration inside a rule reports the rule selector, one inside any other
 * at-rule reports the at-rule name prefixed with `@`, and a declaration directly
 * inside the stylesheet root falls back to `:root`.
 *
 * @param {import('postcss').Declaration} decl Declaration to inspect.
 * @returns {string} Selector, at-rule name, or the root fallback.
 */
function referenceSelector(decl) {
    const { parent } = decl;

    if (parent?.type === 'rule') {
        return parent.selector;
    }

    if (parent?.type === 'atrule') {
        return '@' + parent.name;
    }

    return ':root';
}

/**
 * Report every var() reference the stylesheet does not declare.
 *
 * @param {string} css Expanded CSS text.
 * @returns {Array<{selector: string, property: string, reference: string}>} Dangling references sorted by selector, property, and reference.
 * @throws {Error} When PostCSS cannot parse the CSS.
 */
export function findDanglingReferences(css) {
    const root = postcss.parse(css);
    const declarations = collectDeclarations(root);

    return collectReferences(root)
        .filter(({ reference }) => !declarations.has(reference))
        .sort(compareReferences);
}

/**
 * Order two dangling references by selector, then property, then reference.
 *
 * @param {{selector: string, property: string, reference: string}} first First reference.
 * @param {{selector: string, property: string, reference: string}} second Second reference.
 * @returns {number} Negative, zero, or positive sort result.
 */
function compareReferences(first, second) {
    return (
        first.selector.localeCompare(second.selector) ||
        first.property.localeCompare(second.property) ||
        first.reference.localeCompare(second.reference)
    );
}
