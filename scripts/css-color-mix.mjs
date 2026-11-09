/**
 * `color-mix()` evaluation for the custom property resolver.
 *
 * The module computes only the safe subset: two opaque sRGB colours, an `in srgb`
 * interpolation space, and one or two valid percentages. Anything outside that
 * subset is reported with a reason so callers can leave the original expression
 * in place instead of inventing a value.
 *
 * @module css-color-mix
 */

import { colourReason, mixColors, parseOpaqueColor } from './css-color-value.mjs';

const PERCENTAGE_PATTERN = /^(.*?)\s+([0-9]+(?:\.[0-9]+)?)%$/;

/**
 * Replace every computable `color-mix()` call in a value.
 *
 * Non-computable calls are left byte for byte intact so the caller can report
 * them. The function walks left to right and restarts after each replacement,
 * which also handles several calls in one value.
 *
 * @param {string} value CSS value that may contain `color-mix()` calls.
 * @returns {string} Value with computable calls replaced by lowercase hex.
 */
export function replaceColorMix(value) {
    let result = value;
    let searchFrom = 0;
    let call = findColorMix(result, searchFrom);

    while (call !== null) {
        const outcome = evaluateColorMix(call.inner);

        if ('value' in outcome) {
            result = result.slice(0, call.start) + outcome.value + result.slice(call.end);
            searchFrom = call.start + outcome.value.length;
        } else {
            searchFrom = call.end;
        }

        call = findColorMix(result, searchFrom);
    }

    return result;
}

/**
 * Explain why a value still contains a non-computable `color-mix()` call.
 *
 * @param {string} value CSS value that still contains `color-mix()`.
 * @returns {string | null} Reason for the first remaining call, or null when
 * the value has no `color-mix()`.
 */
export function explainColorMix(value) {
    const call = findColorMix(value);
    const outcome = call === null ? null : evaluateColorMix(call.inner);

    return outcome !== null && 'reason' in outcome ? outcome.reason : null;
}

/**
 * Evaluate the argument list of one `color-mix()` call.
 *
 * @param {string} inner Text between `color-mix(` and its closing parenthesis.
 * @returns {{value: string} | {reason: string}} Lowercase hex on success, or a
 * human readable reason when the mix is not safely computable.
 */
export function evaluateColorMix(inner) {
    const argumentsList = splitArguments(inner, ',');

    if (argumentsList.length !== 3) {
        return {
            reason: `color-mix has ${argumentsList.length} arguments, expected an interpolation space and two colours`,
        };
    }

    const interpolation = argumentsList[0].trim().replace(/\s+/g, ' ').toLowerCase();

    if (interpolation !== 'in srgb') {
        return { reason: `color-mix interpolation space "${argumentsList[0].trim()}" is not srgb` };
    }

    const first = parseMixArgument(argumentsList[1]);
    const second = parseMixArgument(argumentsList[2]);

    if ('reason' in first) {
        return first;
    }

    if ('reason' in second) {
        return second;
    }

    const percentages = mixPercentages(first.percentage, second.percentage);

    if ('reason' in percentages) {
        return percentages;
    }

    return { value: mixColors(first.colour, second.colour, percentages.first, percentages.second) };
}

/**
 * Parse one colour argument, including an optional trailing percentage.
 *
 * @param {string} text One comma-separated `color-mix()` colour argument.
 * @returns {{colour: {red: number, green: number, blue: number}, percentage: number | null} | {reason: string}}
 * Parsed colour, or a reason when the argument is not computable.
 */
function parseMixArgument(text) {
    const trimmed = text.trim();
    const percentageMatch = trimmed.match(PERCENTAGE_PATTERN);
    const colourText = percentageMatch === null ? trimmed : percentageMatch[1].trim();
    const percentage = percentageMatch === null ? null : Number(percentageMatch[2]);
    const colour = parseOpaqueColor(colourText);

    if (colour === null) {
        return { reason: colourReason(colourText) };
    }

    return { colour, percentage };
}

/**
 * Normalise the two optional percentages into weights that sum to 100.
 *
 * @param {number | null} firstPercentage Percentage written on the first colour.
 * @param {number | null} secondPercentage Percentage written on the second colour.
 * @returns {{first: number, second: number} | {reason: string}} Weights, or a
 * reason when the percentages are missing, out of range, or do not sum to 100.
 */
function mixPercentages(firstPercentage, secondPercentage) {
    if (firstPercentage === null && secondPercentage === null) {
        return { reason: 'color-mix has no percentage on either colour' };
    }

    for (const percentage of [firstPercentage, secondPercentage]) {
        if (percentage !== null && (percentage < 0 || percentage > 100)) {
            return { reason: `color-mix percentage ${percentage}% is outside 0% to 100%` };
        }
    }

    if (firstPercentage !== null && secondPercentage !== null) {
        if (Math.abs(firstPercentage + secondPercentage - 100) > 0.0001) {
            return {
                reason: `color-mix percentages ${firstPercentage}% and ${secondPercentage}% do not sum to 100%`,
            };
        }

        return { first: firstPercentage, second: secondPercentage };
    }

    if (firstPercentage !== null) {
        return { first: firstPercentage, second: 100 - firstPercentage };
    }

    return { first: 100 - secondPercentage, second: secondPercentage };
}

/**
 * Find the first `color-mix()` call at or after a starting index.
 *
 * @param {string} value CSS value to scan.
 * @param {number} [fromIndex] Index to start scanning from.
 * @returns {{start: number, end: number, inner: string} | null} Call bounds and
 * argument text, or null when no closed call remains.
 */
function findColorMix(value, fromIndex = 0) {
    let index = value.indexOf('color-mix(', fromIndex);

    while (index !== -1) {
        const previous = value[index - 1];
        const openIndex = index + 'color-mix'.length;
        const closeIndex = findMatchingParen(value, openIndex);

        if (closeIndex === -1) {
            return null;
        }

        if (previous === undefined || !/[A-Za-z0-9_-]/.test(previous)) {
            return { start: index, end: closeIndex + 1, inner: value.slice(openIndex + 1, closeIndex) };
        }

        index = value.indexOf('color-mix(', closeIndex + 1);
    }

    return null;
}

/**
 * Find the parenthesis that closes the one at a starting index.
 *
 * @param {string} value Text to scan.
 * @param {number} openIndex Index of an opening parenthesis.
 * @returns {number} Closing parenthesis index, or -1 when unbalanced.
 */
function findMatchingParen(value, openIndex) {
    let depth = 0;

    for (let index = openIndex; index < value.length; index += 1) {
        if (value[index] === '(') {
            depth += 1;
        } else if (value[index] === ')') {
            depth -= 1;

            if (depth === 0) {
                return index;
            }
        }
    }

    return -1;
}

/**
 * Split text on a separator that appears outside parentheses.
 *
 * @param {string} text Text to split.
 * @param {string} separator Single character separator.
 * @returns {string[]} Trimmed, non-empty parts.
 */
function splitArguments(text, separator) {
    const parts = [];
    let current = '';
    let depth = 0;

    for (const character of text) {
        if (character === '(') {
            depth += 1;
        } else if (character === ')') {
            depth = Math.max(0, depth - 1);
        }

        if (character === separator && depth === 0) {
            parts.push(current.trim());
            current = '';
            continue;
        }

        current += character;
    }

    parts.push(current.trim());

    return parts.filter((part) => part.length > 0);
}
