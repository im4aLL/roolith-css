/**
 * Opaque sRGB colour values for the custom property resolver.
 *
 * Parses the colour forms the framework emits into channels, mixes channels by
 * weight, and serialises the result as lowercase hex. Colours with alpha, named
 * colours other than white and black, and unsupported syntax return null so the
 * caller can report them instead of inventing a value.
 *
 * @module css-color-value
 */

const CHANNEL_PATTERN = /^([0-9]+(?:\.[0-9]+)?)(%?)$/;
const SHORT_HEX_PATTERN = /^[0-9a-f]{3}$/;
const LONG_HEX_PATTERN = /^[0-9a-f]{6}$/;
const RGB_FUNCTION_PATTERN = /^rgba?\(([^)]*)\)$/;
const OPAQUE_ALPHA_PATTERN = /^1(?:\.0+)?$/;

/**
 * Parse an opaque colour in the forms the framework emits.
 *
 * @param {string} text Colour text.
 * @returns {{red: number, green: number, blue: number} | null} Parsed colour, or
 * null for transparent, alpha colours, and unsupported syntax.
 */
export function parseOpaqueColor(text) {
    const value = text.trim().toLowerCase();

    if (value === 'white') {
        return { red: 255, green: 255, blue: 255 };
    }

    if (value === 'black') {
        return { red: 0, green: 0, blue: 0 };
    }

    if (value.startsWith('#')) {
        return parseHexColor(value);
    }

    if (value.startsWith('rgb')) {
        return parseRgbColor(value);
    }

    return null;
}

/**
 * Describe why a colour argument is not a supported opaque colour.
 *
 * @param {string} text Colour argument text.
 * @returns {string} Reason for the unsupported argument.
 */
export function colourReason(text) {
    const value = text.trim().toLowerCase();

    if (value === 'transparent') {
        return 'color-mix uses transparent, which has no opaque sRGB value';
    }

    if (value.startsWith('rgba') || value.includes('/')) {
        return 'color-mix argument has alpha';
    }

    if (value.includes('var(')) {
        return 'color-mix argument still contains var()';
    }

    return `color-mix argument "${text.trim()}" is not a supported opaque colour`;
}

/**
 * Mix two opaque colours by weight and serialise the result as lowercase hex.
 *
 * @param {{red: number, green: number, blue: number}} first First colour channels.
 * @param {{red: number, green: number, blue: number}} second Second colour channels.
 * @param {number} firstWeight First colour weight.
 * @param {number} secondWeight Second colour weight.
 * @returns {string} Lowercase `#rrggbb` value.
 */
export function mixColors(first, second, firstWeight, secondWeight) {
    return toHex({
        red: mixChannel(first.red, second.red, firstWeight, secondWeight),
        green: mixChannel(first.green, second.green, firstWeight, secondWeight),
        blue: mixChannel(first.blue, second.blue, firstWeight, secondWeight),
    });
}

/**
 * Compute one weighted sRGB channel.
 *
 * @param {number} first First channel value.
 * @param {number} second Second channel value.
 * @param {number} firstPercentage First colour weight.
 * @param {number} secondPercentage Second colour weight.
 * @returns {number} Weighted channel value.
 */
function mixChannel(first, second, firstPercentage, secondPercentage) {
    return (first * firstPercentage + second * secondPercentage) / 100;
}

/**
 * Format an sRGB colour as lowercase hex.
 *
 * @param {{red: number, green: number, blue: number}} colour Colour channels.
 * @returns {string} Lowercase `#rrggbb` value.
 */
function toHex(colour) {
    const channels = [colour.red, colour.green, colour.blue].map((channel) => {
        const rounded = Math.round(Math.min(255, Math.max(0, channel)));

        return rounded.toString(16).padStart(2, '0');
    });

    return `#${channels.join('')}`;
}

/**
 * Parse a three or six digit hex colour.
 *
 * @param {string} value Hex colour including the leading hash.
 * @returns {{red: number, green: number, blue: number} | null} Parsed colour.
 */
function parseHexColor(value) {
    const hex = value.slice(1);

    if (SHORT_HEX_PATTERN.test(hex)) {
        return {
            red: Number.parseInt(hex[0] + hex[0], 16),
            green: Number.parseInt(hex[1] + hex[1], 16),
            blue: Number.parseInt(hex[2] + hex[2], 16),
        };
    }

    if (LONG_HEX_PATTERN.test(hex)) {
        return {
            red: Number.parseInt(hex.slice(0, 2), 16),
            green: Number.parseInt(hex.slice(2, 4), 16),
            blue: Number.parseInt(hex.slice(4, 6), 16),
        };
    }

    return null;
}

/**
 * Parse `rgb()` and `rgba()` colours that have an opaque alpha.
 *
 * @param {string} value Function text.
 * @returns {{red: number, green: number, blue: number} | null} Parsed colour, or
 * null for alpha colours and unsupported syntax.
 */
function parseRgbColor(value) {
    const match = value.match(RGB_FUNCTION_PATTERN);

    if (match === null) {
        return null;
    }

    const body = match[1].trim();
    let channels;
    let alpha = null;

    if (body.includes(',')) {
        const parts = body.split(',').map((part) => part.trim());

        if (parts.length === 4) {
            channels = parts.slice(0, 3);
            alpha = parts[3];
        } else if (parts.length === 3) {
            channels = parts;
        } else {
            return null;
        }
    } else {
        const parts = body.split('/');

        if (parts.length > 2) {
            return null;
        }

        channels = parts[0].trim().split(/\s+/);

        if (channels.length !== 3) {
            return null;
        }

        if (parts.length === 2) {
            alpha = parts[1].trim();
        }
    }

    if (alpha !== null && !isOpaqueAlpha(alpha)) {
        return null;
    }

    const values = channels.map(parseChannel);

    if (values.some((channel) => channel === null)) {
        return null;
    }

    return { red: values[0], green: values[1], blue: values[2] };
}

/**
 * Parse one rgb channel as a number or a percentage of 255.
 *
 * @param {string} text Channel text.
 * @returns {number | null} Channel in the 0 to 255 range.
 */
function parseChannel(text) {
    const match = text.trim().match(CHANNEL_PATTERN);

    if (match === null) {
        return null;
    }

    const amount = Number(match[1]);
    const channel = match[2] === '%' ? (amount * 255) / 100 : amount;

    return channel >= 0 && channel <= 255 ? channel : null;
}

/**
 * Check whether an alpha value represents a fully opaque colour.
 *
 * @param {string} text Alpha text.
 * @returns {boolean} True for `1`, `1.0`, and `100%`.
 */
function isOpaqueAlpha(text) {
    return OPAQUE_ALPHA_PATTERN.test(text) || text === '100%';
}
