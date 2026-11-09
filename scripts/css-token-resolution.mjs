/**
 * Resolve custom property values inside one theme scope.
 *
 * References are substituted until the map stops changing, computable
 * `color-mix()` calls are evaluated on every pass, cycles are rejected before
 * substitution starts, and tokens that still contain expressions are reported
 * with a reason.
 *
 * @module css-token-resolution
 */

import { explainColorMix, replaceColorMix } from './css-color-mix.mjs';

const MAX_RESOLUTION_PASSES = 20;
const VAR_REFERENCE_SOURCE = 'var\\(\\s*(--[A-Za-z0-9_-]+)\\s*\\)';

/**
 * Resolve var() chains and computable color-mix() calls in one theme map.
 *
 * @param {Map<string, string>} rawTokens Raw declarations for one theme.
 * @returns {{tokens: Map<string, string>, unresolved: Array<{token: string, reason: string}>}} Resolved tokens and per-token failures.
 * @throws {Error} When a var() cycle is found or resolution does not converge.
 */
export function resolveTokenMap(rawTokens) {
    assertNoCycles(rawTokens);

    const tokens = new Map(rawTokens);
    let converged = false;

    for (let pass = 0; pass < MAX_RESOLUTION_PASSES; pass += 1) {
        let changed = false;

        for (const [name, value] of tokens) {
            const next = replaceColorMix(substituteReferences(value, tokens));

            if (next !== value) {
                tokens.set(name, next);
                changed = true;
            }
        }

        if (!changed) {
            converged = true;
            break;
        }
    }

    if (!converged) {
        const stillChanging = [...tokens].some(([, value]) => {
            return replaceColorMix(substituteReferences(value, tokens)) !== value;
        });

        if (stillChanging) {
            throw new Error(`Custom property resolution did not converge after ${MAX_RESOLUTION_PASSES} passes.`);
        }
    }

    const declared = new Set(rawTokens.keys());
    const unresolved = [];

    for (const [name, value] of tokens) {
        const failure = describeUnresolved(name, value, declared);

        if (failure !== null) {
            unresolved.push(failure);
        }
    }

    return { tokens, unresolved };
}

/**
 * Throw when declared tokens reference each other in a cycle.
 *
 * @param {Map<string, string>} rawTokens Raw declarations for one theme.
 * @returns {void}
 * @throws {Error} Naming the cycle chain, for example `--a -> --b -> --a`.
 */
function assertNoCycles(rawTokens) {
    const declared = new Set(rawTokens.keys());
    const states = new Map();
    const path = [];

    /**
     * Depth-first walk from one token, tracking the active path for cycle reporting.
     *
     * @param {string} name Token name to visit.
     * @returns {void}
     */
    const visit = (name) => {
        states.set(name, 'visiting');
        path.push(name);

        for (const reference of collectVarReferences(rawTokens.get(name))) {
            if (!declared.has(reference)) {
                continue;
            }

            if (states.get(reference) === 'visiting') {
                const start = path.indexOf(reference);
                const cycle = [...path.slice(start), reference].join(' -> ');

                throw new Error(`Circular custom property reference: ${cycle}`);
            }

            if (states.get(reference) !== 'visited') {
                visit(reference);
            }
        }

        path.pop();
        states.set(name, 'visited');
    };

    for (const name of rawTokens.keys()) {
        if (states.get(name) !== 'visited') {
            visit(name);
        }
    }
}

/**
 * Replace declared var() references with their current values.
 *
 * Undeclared references and `var()` fallbacks are left untouched so they stay
 * visible in the unresolved report.
 *
 * @param {string} value CSS value.
 * @param {Map<string, string>} tokens Current token values.
 * @returns {string} Value with known references substituted.
 */
function substituteReferences(value, tokens) {
    return value.replace(new RegExp(VAR_REFERENCE_SOURCE, 'g'), (match, name) => {
        return tokens.has(name) ? tokens.get(name) : match;
    });
}

/**
 * Collect the distinct token names referenced by a value.
 *
 * @param {string} value CSS value.
 * @returns {Set<string>} Referenced names, including undeclared ones.
 */
function collectVarReferences(value) {
    const references = new Set();
    const pattern = new RegExp(VAR_REFERENCE_SOURCE, 'g');
    let match = pattern.exec(value);

    while (match !== null) {
        references.add(match[1]);
        match = pattern.exec(value);
    }

    return references;
}

/**
 * Explain why a resolved token still contains an expression.
 *
 * @param {string} name Token name.
 * @param {string} value Final token value.
 * @param {Set<string>} declared Names declared in this theme.
 * @returns {{token: string, reason: string} | null} Failure entry, or null when the token resolved.
 */
function describeUnresolved(name, value, declared) {
    const missing = [...collectVarReferences(value)].filter((reference) => !declared.has(reference)).sort();
    const reasons = [];

    if (missing.length > 0) {
        reasons.push(`undeclared ${missing.join(', ')}`);
    }

    if (value.includes('color-mix(')) {
        const mixReason = explainColorMix(value);

        if (mixReason !== null) {
            reasons.push(mixReason);
        }
    }

    return reasons.length === 0 ? null : { token: name, reason: reasons.join('; ') };
}

/**
 * Merge per-theme failures into one token-keyed report.
 *
 * @param {Array<{token: string, reason: string}>} lightFailures Light failures.
 * @param {Array<{token: string, reason: string}>} darkFailures Dark failures.
 * @returns {Array<{token: string, themes: string[], reason: string}>} Sorted failures with their themes.
 */
export function mergeUnresolved(lightFailures, darkFailures) {
    const merged = new Map();

    for (const [theme, failures] of [
        ['light', lightFailures],
        ['dark', darkFailures],
    ]) {
        for (const failure of failures) {
            const current = merged.get(failure.token) ?? { token: failure.token, themes: [], reasons: new Set() };

            current.themes.push(theme);
            current.reasons.add(failure.reason);
            merged.set(failure.token, current);
        }
    }

    return [...merged.values()]
        .map(({ token, themes, reasons }) => ({
            token,
            themes: [...new Set(themes)],
            reason: [...reasons].sort().join('; '),
        }))
        .sort((first, second) => first.token.localeCompare(second.token));
}
