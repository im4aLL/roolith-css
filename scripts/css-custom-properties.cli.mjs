/**
 * Command-line surface for the custom property resolver.
 *
 * `--json` writes a stable, sorted token snapshot to stdout and keeps counts and
 * warnings on stderr. `--report` writes a human summary with light-only,
 * dark-only, and unresolved token lists to stdout.
 *
 * @module css-custom-properties.cli
 */

/**
 * Run the command-line surface.
 *
 * @param {string[]} argv Arguments after the script name.
 * @param {() => {light: Map<string, string>, dark: Map<string, string>, unresolved: Array<{token: string, themes: string[], reason: string}>}} load
 * Loader that compiles and resolves the token snapshot.
 * @returns {void}
 */
export function runCli(argv, load) {
    try {
        if (argv.includes('--json')) {
            emitJson(load);
            return;
        }

        if (argv.includes('--report')) {
            emitReport(load);
            return;
        }

        process.stderr.write('Usage: node scripts/css-custom-properties.mjs --json | --report\n');
        process.exitCode = 1;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        process.stderr.write(`${message}\n`);
        process.exitCode = 1;
    }
}

/**
 * Write the JSON snapshot to stdout and counts to stderr.
 *
 * @param {() => {light: Map<string, string>, dark: Map<string, string>, unresolved: Array<{token: string, themes: string[], reason: string}>}} load
 * Token loader.
 * @returns {void}
 */
function emitJson(load) {
    const { light, dark, unresolved } = load();
    const payload = { light: sortedObject(light), dark: sortedObject(dark) };

    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    process.stderr.write(`light=${light.size} dark=${dark.size} unresolved=${unresolved.length}\n`);
}

/**
 * Write the human summary to stdout.
 *
 * @param {() => {light: Map<string, string>, dark: Map<string, string>, unresolved: Array<{token: string, themes: string[], reason: string}>}} load
 * Token loader.
 * @returns {void}
 */
function emitReport(load) {
    const { light, dark, unresolved } = load();
    const lightOnly = sortedKeys(light).filter((token) => !dark.has(token));
    const darkOnly = sortedKeys(dark).filter((token) => !light.has(token));
    const lines = [
        'Custom property report',
        `Light tokens: ${light.size}`,
        `Dark tokens: ${dark.size}`,
        formatList('Light only', lightOnly),
        formatList('Dark only', darkOnly),
        formatList(
            'Unresolved',
            unresolved.map(({ token, themes, reason }) => `${token} [${themes.join(', ')}]: ${reason}`),
        ),
    ];

    process.stdout.write(`${lines.join('\n')}\n`);
}

/**
 * Format a titled list for the human summary.
 *
 * @param {string} title List title.
 * @param {string[]} entries Sorted entries.
 * @returns {string} Multi-line list block.
 */
function formatList(title, entries) {
    if (entries.length === 0) {
        return `${title} (0): none`;
    }

    return [`${title} (${entries.length}):`, ...entries.map((entry) => `  ${entry}`)].join('\n');
}

/**
 * Return the keys of a token map in stable order.
 *
 * @param {Map<string, string>} tokens Token map.
 * @returns {string[]} Sorted token names.
 */
function sortedKeys(tokens) {
    return [...tokens.keys()].sort((first, second) => first.localeCompare(second));
}

/**
 * Turn a token map into a plain object with sorted keys.
 *
 * @param {Map<string, string>} tokens Token map.
 * @returns {Record<string, string>} Sorted plain object.
 */
function sortedObject(tokens) {
    return Object.fromEntries(sortedKeys(tokens).map((token) => [token, tokens.get(token)]));
}
