/**
 * Adds a content hash to the local CSS and JS references of the documentation pages,
 * as `file.css?v=<hash>`, so a changed asset is always fetched fresh.
 *
 * Usage (from the repository root):
 *   node scripts/version-docs-assets.mjs
 *   node scripts/version-docs-assets.mjs --check
 *
 * The docs site is plain HTML deployed over FTP, so no server can send cache
 * busting headers. The hash is derived from the file content, which means the
 * query string changes exactly when the file changes, and a browser only serves
 * a cached copy while the asset is unchanged. The prebuilt framework stylesheet is
 * skipped, because its file name already carries the framework version.
 *
 * Only `link` and `script` references are touched; navigation links, images,
 * external URLs, and the code samples inside `<pre>` blocks stay as written.
 * `--check` reports pages with stale hashes and exits non-zero, without writing.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = path.join(projectRoot, 'docs');

/** Web root of the docs site, used to resolve root relative references. */
const webRoot = docsDir;

/** File extensions whose references get a content hash. */
const VERSIONED_EXTENSIONS = new Set(['.css', '.js']);

/** Asset names that already carry a version, so they need no content hash. */
const SELF_VERSIONED_PATTERN = /^roolith-\d+\.\d+\.\d+\.min\.css$/;

/** Matches the href or src attribute of a link or script start tag. */
const ASSET_REFERENCE_PATTERN = /<(?:link|script)\b[^>]*?\s(?:href|src)=(["'])([^"']+)\1/gi;

/**
 * Splits a reference into its path, query, and fragment parts.
 * @param {string} reference The attribute value as written in the HTML.
 * @returns {{ pathname: string, query: string, fragment: string }} The parts.
 */
function splitReference(reference) {
    const queryIndex = reference.indexOf('?');
    const fragmentIndex = reference.indexOf('#');
    const hasQuery = queryIndex !== -1 && (fragmentIndex === -1 || queryIndex < fragmentIndex);

    if (hasQuery) {
        const fragmentInQuery = reference.indexOf('#', queryIndex);

        return {
            pathname: reference.slice(0, queryIndex),
            query:
                fragmentInQuery === -1
                    ? reference.slice(queryIndex + 1)
                    : reference.slice(queryIndex + 1, fragmentInQuery),
            fragment: fragmentInQuery === -1 ? '' : reference.slice(fragmentInQuery),
        };
    }

    if (fragmentIndex !== -1) {
        return { pathname: reference.slice(0, fragmentIndex), query: '', fragment: reference.slice(fragmentIndex) };
    }

    return { pathname: reference, query: '', fragment: '' };
}

/**
 * Resolves the file a reference points at, relative to the docs web root.
 * @param {string} pathname Reference path, without query and fragment.
 * @param {string} pageFile Absolute path of the HTML file holding the reference.
 * @returns {string | null} The resolved file path, or null when it escapes the web root.
 */
function resolveReferenceFile(pathname, pageFile) {
    const absolute = pathname.startsWith('/')
        ? path.join(webRoot, decodeURIComponent(pathname))
        : path.resolve(path.dirname(pageFile), decodeURIComponent(pathname));
    const relative = path.relative(webRoot, absolute);

    return relative.startsWith('..') || path.isAbsolute(relative) ? null : absolute;
}

/**
 * Computes the short content hash used in the version query parameter.
 * @param {string} filePath File to hash.
 * @returns {string} The first eight hex characters of the SHA-256 digest.
 */
function contentHash(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex').slice(0, 8);
}

/**
 * Returns the versioned form of a reference, or null when it should stay as is.
 * External URLs, non CSS/JS references, and references to missing files are left
 * untouched. An existing version parameter is replaced rather than duplicated, and
 * removed from assets that are versioned by their file name.
 * @param {string} reference The attribute value as written in the HTML.
 * @param {string} pageFile Absolute path of the HTML file holding the reference.
 * @returns {string | null} The versioned reference, or null to keep the original.
 */
function versionReference(reference, pageFile) {
    if (reference.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(reference)) {
        return null;
    }

    const { pathname, query, fragment } = splitReference(reference);

    if (!VERSIONED_EXTENSIONS.has(path.extname(pathname).toLowerCase())) {
        return null;
    }

    const filePath = resolveReferenceFile(pathname, pageFile);

    if (!filePath || !fs.existsSync(filePath)) {
        return null;
    }

    const params = new URLSearchParams(query);

    if (SELF_VERSIONED_PATTERN.test(path.basename(pathname))) {
        params.delete('v');
    } else {
        params.set('v', contentHash(filePath));
    }

    const search = params.toString();

    return `${pathname}${search ? `?${search}` : ''}${fragment}`;
}

/**
 * Rewrites the versioned local CSS and JS references of one docs page.
 * @param {string} html Document source.
 * @param {string} pageFile Absolute path of the HTML file.
 * @returns {string} The document with current hashes.
 */
export function stampHtml(html, pageFile) {
    return html.replace(ASSET_REFERENCE_PATTERN, (match, quote, reference) => {
        const versioned = versionReference(reference, pageFile);

        return versioned ? match.replace(`${quote}${reference}${quote}`, `${quote}${versioned}${quote}`) : match;
    });
}

/**
 * Lists every HTML file under the docs directory.
 * @returns {string[]} Absolute file paths in a stable order.
 */
function listDocsPages() {
    const pages = [];
    const queue = [docsDir];

    while (queue.length > 0) {
        const current = queue.pop();

        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const entryPath = path.join(current, entry.name);

            if (entry.isDirectory()) {
                queue.push(entryPath);
            } else if (entry.name.endsWith('.html')) {
                pages.push(entryPath);
            }
        }
    }

    return pages.sort();
}

/**
 * Stamps every docs page, or verifies that the committed pages are current.
 * @param {{ check?: boolean }} [options] Options.
 * @param {boolean} [options.check] Report drift instead of writing files.
 * @returns {{ scanned: number, updated: string[] }} Scanned page count and changed (or stale) pages.
 */
export function stampDocs({ check = false } = {}) {
    const updated = [];
    let scanned = 0;

    for (const pageFile of listDocsPages()) {
        scanned += 1;

        const original = fs.readFileSync(pageFile, 'utf8');
        const stamped = stampHtml(original, pageFile);

        if (stamped === original) {
            continue;
        }

        updated.push(path.relative(projectRoot, pageFile));

        if (!check) {
            fs.writeFileSync(pageFile, stamped, 'utf8');
        }
    }

    return { scanned, updated };
}

/**
 * Runs the command line entry point.
 * @returns {void}
 */
function main() {
    const check = process.argv.includes('--check');
    const { scanned, updated } = stampDocs({ check });

    if (check) {
        if (updated.length === 0) {
            console.log(`docs asset hashes are up to date across ${scanned} pages`);

            return;
        }

        console.error(`stale asset hashes in ${updated.length} of ${scanned} docs pages:`);
        updated.forEach((page) => console.error(`  ${page}`));
        console.error('run `node scripts/version-docs-assets.mjs` to update them');
        process.exitCode = 1;

        return;
    }

    if (updated.length === 0) {
        console.log(`docs asset hashes already current across ${scanned} pages`);

        return;
    }

    console.log(`stamped asset hashes in ${updated.length} of ${scanned} docs pages:`);
    updated.forEach((page) => console.log(`  ${page}`));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main();
}
