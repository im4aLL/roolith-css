/**
 * Derive palette slots and accent role aliases from resolved token values.
 *
 * The compiled CSS does not say which palette slot a value came from, and the
 * Sass maps that know are private to their module, so both facts are recovered
 * from the resolved snapshot instead. A palette slot owns a fill, a foreground
 * pair, and a text pair, and an accent role resolves exactly like the slot it
 * aliases, which is enough to tell them apart without repeating the mapping.
 *
 * @module token-palette
 */

/** Prefix shared by the palette primitives, their foreground pairs, and their text pairs. */
export const PALETTE_PREFIX = '--r-color-';

const PUBLIC_PREFIX = '--r-';
const SIGNATURE_SEPARATOR = '\u0000';

/**
 * List the palette slots that own a primitive, a foreground pair, and a text pair.
 *
 * A slot is recognised by its `--r-color-{slot}-on` and `--r-color-{slot}-text`
 * siblings, so a slot whose own name ends in `-on` is not mistaken for a pair.
 *
 * @param {Map<string, string>} light Resolved light tokens.
 * @returns {string[]} Slot names in default sort order.
 */
export function readPaletteSlots(light) {
    const slots = [];

    for (const token of light.keys()) {
        if (!token.startsWith(PALETTE_PREFIX)) {
            continue;
        }

        if (!light.has(`${token}-on`) || !light.has(`${token}-text`)) {
            continue;
        }

        slots.push(token.slice(PALETTE_PREFIX.length));
    }

    return slots.sort();
}

/**
 * Find the palette slot a palette token belongs to.
 *
 * @param {string} token Token name starting with `--r-color-`.
 * @param {string[]} slots Known palette slots.
 * @returns {string | null} Slot name, or null when the token is not a palette primitive, pair, or text pair.
 */
export function readPaletteSlot(token, slots) {
    for (const slot of slots) {
        const base = `${PALETTE_PREFIX}${slot}`;

        if (token === base || token === `${base}-on` || token === `${base}-text`) {
            return slot;
        }
    }

    return null;
}

/**
 * Map every accent role to the palette slot it aliases.
 *
 * Roles are found by shape rather than by name: a role owns `--r-{role}`,
 * `--r-{role}-on`, and `--r-{role}-text`, and its resolved values match one
 * palette slot exactly. A family that matches no slot is not a role and is left
 * to another section.
 *
 * @param {{light: Map<string, string>, dark: Map<string, string>, slots: string[]}} input Resolved maps and palette slots.
 * @returns {Map<string, string>} Role name to slot name.
 * @throws {Error} When one role matches more than one slot.
 */
export function readAccentRoles({ light, dark, slots }) {
    const slotsBySignature = new Map();

    for (const slot of slots) {
        const base = `${PALETTE_PREFIX}${slot}`;
        const signature = signatureOf([
            light.get(base),
            dark.get(base),
            light.get(`${base}-on`),
            light.get(`${base}-text`),
            dark.get(`${base}-text`),
        ]);

        slotsBySignature.set(signature, [...(slotsBySignature.get(signature) ?? []), slot]);
    }

    const accentRoles = new Map();

    for (const token of light.keys()) {
        if (!token.startsWith(PUBLIC_PREFIX) || token.startsWith(PALETTE_PREFIX)) {
            continue;
        }

        if (!light.has(`${token}-on`) || !light.has(`${token}-text`)) {
            continue;
        }

        const role = token.slice(PUBLIC_PREFIX.length);
        const signature = signatureOf([
            light.get(token),
            dark.get(token),
            light.get(`${token}-on`),
            light.get(`${token}-text`),
            dark.get(`${token}-text`),
        ]);
        const matches = slotsBySignature.get(signature);

        if (matches === undefined) {
            continue;
        }

        if (matches.length > 1) {
            throw new Error(
                `Accent role "${role}" resolves exactly like palette slots ${matches.join(', ')}, so its slot cannot be named. Give the slots distinct values or drop the role.`,
            );
        }

        accentRoles.set(role, matches[0]);
    }

    return accentRoles;
}

/**
 * Find the accent role a token belongs to.
 *
 * @param {string} token Custom property name.
 * @param {Map<string, string>} accentRoles Role name to slot name.
 * @returns {{role: string, slot: string} | null} Owning role, or null when the token is not a role, pair, or text pair.
 */
export function readAccentRole(token, accentRoles) {
    for (const [role, slot] of accentRoles) {
        const base = `${PUBLIC_PREFIX}${role}`;

        if (token === base || token === `${base}-on` || token === `${base}-text`) {
            return { role, slot };
        }
    }

    return null;
}

/**
 * Join resolved values into a comparable signature.
 *
 * @param {Array<string | undefined>} values Resolved values in a fixed order.
 * @returns {string} Signature that only matches identical value sets.
 */
function signatureOf(values) {
    return values.map((value) => value ?? '').join(SIGNATURE_SEPARATOR);
}
