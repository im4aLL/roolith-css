import { defineConfig } from 'vite';
import pkg from './package.json';
import banner from 'vite-plugin-banner';
import { copyFile } from 'fs/promises';
import { resolve } from 'path';

const outDir = 'dist';
const cssFileName = `roolith-${pkg.version}.min.css`;

const bannerContent = `/**\n * Name: ${pkg.name}\n * Version: v${pkg.version}\n * Description: ${
    pkg.description
}\n * Author: ${pkg.author}\n * Generated on ${new Date()}\n */`;

/**
 * Copies the built stylesheet into `docs/` so the documentation pages serve the exact shipped CSS.
 *
 * @returns {import('vite').Plugin}
 */
const copyCssToDocs = () => ({
    name: 'copy-css-to-docs',
    apply: 'build',
    closeBundle: async () => {
        const from = resolve(__dirname, outDir, cssFileName);
        const to = resolve(__dirname, 'docs', cssFileName);

        await copyFile(from, to);
        console.log(`copied ${cssFileName} to docs/`);
    },
});

export default defineConfig({
    plugins: [banner(bannerContent), copyCssToDocs()],
    build: {
        rollupOptions: {
            input: {
                roolith: resolve(__dirname, 'src/sass/roolith.scss'),
            },
            output: {
                assetFileNames: `[name]-${pkg.version}.min[extname]`,
            },
        },
        outDir,
        emptyOutDir: true,
    },
});
