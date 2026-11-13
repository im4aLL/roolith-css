/**
 * Regenerates docs/search-index.json from the built documentation pages.
 *
 * Usage (from the repository root):
 *   node docs/generate-search-index.mjs
 *
 * The script walks every .html file under docs, skipping docs/partials,
 * docs/examples, and any dot directory, and writes:
 *
 *   {
 *       "pages": [
 *           {
 *               "title": "Block grid",
 *               "url": "/blocks/block-grid.html",
 *               "group": "Blocks",
 *               "headings": [{ "text": "Basic usage", "anchor": "basic-usage" }]
 *           }
 *       ]
 *   }
 *
 * title is the page <h1>, url is the docs-relative path with a leading slash,
 * group is derived from the folder (Overview for docs/index.html and other root pages), and headings
 * are the h2 and h3 headings inside section.doc-section, ignoring demo and code
 * blocks so sample content does not pollute search. Each heading keeps its text
 * plus the anchor of its own id or the enclosing section id, so search results
 * can link to the matched section. A page whose headings resolve to the same
 * anchor twice fails the run instead of silently collapsing two headings onto one
 * target. The overview page uses its doc-section-block sections instead, because
 * its hero and call to action sections are not part of the documentation outline.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsDir = path.dirname(fileURLToPath(import.meta.url));
const outputFile = path.join(docsDir, 'search-index.json');

const ignoredDirectories = new Set(['partials', 'examples']);

const groupByFolder = new Map([
    ['', 'Overview'],
    ['getting-started', 'Getting started'],
    ['components', 'Components'],
    ['blocks', 'Blocks'],
]);

const groupOrder = ['Getting started', 'Components', 'Blocks', 'Overview'];

const overviewPage = 'index.html';

const htmlEntities = new Map([
    ['&amp;', '&'],
    ['&lt;', '<'],
    ['&gt;', '>'],
    ['&quot;', '"'],
    ['&#39;', "'"],
]);

const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
const titlePattern = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i;

/**
 * Lists every page below a directory, skipping ignored and dot directories.
 * @param {string} directory Absolute directory to walk.
 * @returns {string[]} Absolute paths of the HTML pages found, in directory order.
 */
function findPages(directory) {
    const pages = [];

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            if (entry.name.startsWith('.') || ignoredDirectories.has(entry.name)) {
                continue;
            }

            pages.push(...findPages(entryPath));
        } else if (entry.name.endsWith('.html')) {
            pages.push(entryPath);
        }
    }

    return pages.sort();
}

/**
 * Removes HTML comments so commented-out markup cannot affect the scan.
 * @param {string} html Raw page markup.
 * @returns {string} Markup without comments.
 */
function stripComments(html) {
    return html.replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * Reads one attribute from the raw attribute text of a start tag.
 * @param {string} attributes Attribute text between the tag name and ">".
 * @param {string} name Attribute name to read.
 * @returns {string | null} The attribute value, or null when it is absent.
 */
function readAttribute(attributes, name) {
    const attributePattern = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i');
    const match = attributePattern.exec(attributes);

    if (match === null) {
        return null;
    }

    return match[1] ?? match[2] ?? match[3] ?? null;
}

/**
 * Tests whether a start tag carries a class token.
 * @param {string} attributes Attribute text between the tag name and ">".
 * @param {string} token Class name to look for.
 * @returns {boolean} True when the class token is present.
 */
function hasClassToken(attributes, token) {
    const classValue = readAttribute(attributes, 'class');

    if (classValue === null) {
        return false;
    }

    return classValue.split(/\s+/).includes(token);
}

/**
 * Turns heading markup into the plain text used by the search index.
 * @param {string} text Inner markup of a heading element.
 * @returns {string} Decoded, whitespace-collapsed heading text.
 */
function cleanText(text) {
    const withoutTags = text.replace(/<[^>]*>/g, ' ');
    const decoded = withoutTags.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => htmlEntities.get(entity));

    return decoded.replace(/\s+/g, ' ').trim();
}

/**
 * Tests whether a start tag opens a subtree that search should ignore.
 * @param {string} tagName Lowercase tag name.
 * @param {string} attributes Attribute text between the tag name and ">".
 * @returns {boolean} True for code elements and demo or code block containers.
 */
function isExcludedContainer(tagName, attributes) {
    return tagName === 'code' || hasClassToken(attributes, 'doc-demo') || hasClassToken(attributes, 'doc-code');
}

/**
 * Reads the page title from the first h1 element.
 * @param {string} html Prepared page markup.
 * @param {string} relativePath Path used in the error message.
 * @returns {string} The page title.
 */
function readTitle(html, relativePath) {
    const match = titlePattern.exec(html);
    const title = match === null ? '' : cleanText(match[1]);

    if (title === '') {
        throw new Error(`no <h1> found in ${relativePath}`);
    }

    return title;
}

/**
 * Collects the headings of the matching page sections, skipping demo and code
 * blocks. Sections and excluded containers are matched by name, so the scan does
 * not need a full HTML tree. Each heading keeps its own id when present, falls
 * back to the enclosing section id, and otherwise carries an empty anchor.
 * @param {string} html Prepared page markup.
 * @param {{sectionClass: string, levels: number[]}} options Section class and heading levels to read.
 * @returns {Array<{text: string, anchor: string}>} Cleaned headings in document order.
 */
function collectHeadings(html, options) {
    const headings = [];
    const pattern = new RegExp(tagPattern);
    let insideSection = false;
    let sectionAnchor = '';
    let skip = null;
    let match;

    while ((match = pattern.exec(html)) !== null) {
        const isClosing = match[1] === '/';
        const tagName = match[2].toLowerCase();
        const attributes = match[3];

        if (skip !== null) {
            if (tagName === skip.tagName) {
                skip.depth += isClosing ? -1 : 1;

                if (skip.depth === 0) {
                    skip = null;
                }
            }

            continue;
        }

        if (isClosing) {
            if (tagName === 'section') {
                insideSection = false;
                sectionAnchor = '';
            }

            continue;
        }

        if (tagName === 'section') {
            insideSection = hasClassToken(attributes, options.sectionClass);
            sectionAnchor = insideSection ? (readAttribute(attributes, 'id') || '').trim() : '';
            continue;
        }

        if (!insideSection) {
            continue;
        }

        if (tagName === 'div' || tagName === 'code') {
            if (isExcludedContainer(tagName, attributes)) {
                skip = { tagName, depth: 1 };
            }

            continue;
        }

        const level = /^h[1-6]$/.test(tagName) ? Number(tagName.slice(1)) : 0;

        if (!options.levels.includes(level)) {
            continue;
        }

        const contentStart = pattern.lastIndex;
        const closingPattern = new RegExp(`</${tagName}\\s*>`, 'i');
        const closingMatch = closingPattern.exec(html.slice(contentStart));

        if (closingMatch === null) {
            throw new Error(`unclosed <${tagName}> in a ${options.sectionClass} section`);
        }

        // The heading's own id wins, so headings that already have an anchor
        // target keep pointing at themselves instead of the section start.
        const headingId = (readAttribute(attributes, 'id') || '').trim();
        const anchor = headingId || sectionAnchor;

        headings.push({
            text: cleanText(html.slice(contentStart, contentStart + closingMatch.index)),
            anchor,
        });
        pattern.lastIndex = contentStart + closingMatch.index + closingMatch[0].length;
    }

    return headings;
}

/**
 * Rejects an entry whose headings resolve to the same anchor twice, because two
 * headings that share an anchor would silently collapse onto one search target.
 * The error names both headings so the offending duplicate is easy to find.
 * Empty anchors are skipped, since those headings are not addressable anyway.
 * @param {{url: string, headings: Array<{text: string, anchor: string}>}} entry Search index entry to check.
 * @returns {void}
 */
function assertUniqueAnchors(entry) {
    const firstHeadingByAnchor = new Map();

    for (const heading of entry.headings) {
        if (heading.anchor === '') {
            continue;
        }

        const firstHeading = firstHeadingByAnchor.get(heading.anchor);

        if (firstHeading !== undefined) {
            throw new Error(
                `duplicate anchor "${heading.anchor}" on ${entry.url} between "${firstHeading}" and "${heading.text}", give the heading its own id`,
            );
        }

        firstHeadingByAnchor.set(heading.anchor, heading.text);
    }
}

/**
 * Builds one search index entry from a page file.
 * @param {string} pageFile Absolute path of the page.
 * @returns {{title: string, url: string, group: string, headings: Array<{text: string, anchor: string}>}} The search index entry.
 */
function describePage(pageFile) {
    const relativePath = path.relative(docsDir, pageFile).split(path.sep).join('/');
    const html = stripComments(fs.readFileSync(pageFile, 'utf8'));
    const title = readTitle(html, relativePath);
    const url = `/${relativePath}`;

    if (relativePath === overviewPage) {
        const entry = {
            title,
            url,
            group: 'Overview',
            headings: collectHeadings(html, { sectionClass: 'doc-section-block', levels: [2] }),
        };

        assertUniqueAnchors(entry);

        return entry;
    }

    const folder = relativePath.includes('/') ? relativePath.slice(0, relativePath.indexOf('/')) : '';
    const group = groupByFolder.get(folder);

    if (group === undefined) {
        throw new Error(`no search group for ${relativePath}, add "${folder}" to groupByFolder`);
    }

    const entry = {
        title,
        url,
        group,
        headings: collectHeadings(html, { sectionClass: 'doc-section', levels: [2, 3] }),
    };

    assertUniqueAnchors(entry);

    return entry;
}

/**
 * Regenerates the search index file and reports what it wrote.
 * @returns {void}
 */
function main() {
    const pages = findPages(docsDir).map(describePage);

    pages.sort((first, second) => {
        const groupDelta = groupOrder.indexOf(first.group) - groupOrder.indexOf(second.group);

        return groupDelta !== 0 ? groupDelta : first.title.localeCompare(second.title, 'en');
    });

    const output = `${JSON.stringify({ pages }, null, 4)}\n`;

    fs.writeFileSync(outputFile, output, 'utf8');

    console.log(`wrote: docs/${path.basename(outputFile)} (${pages.length} pages, ${output.length} bytes)`);
}

try {
    main();
} catch (error) {
    console.error(`generate-search-index: ${error.message}`);
    process.exitCode = 1;
}
