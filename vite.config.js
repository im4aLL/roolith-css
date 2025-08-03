import { defineConfig } from 'vite';
import pkg from './package.json';
import banner from 'vite-plugin-banner';
import { resolve } from 'path';

const bannerContent = `/**\n * Name: ${pkg.name}\n * Version: v${pkg.version}\n * Description: ${
    pkg.description
}\n * Author: ${pkg.author}\n * Generated on ${new Date()}\n */`;

export default defineConfig({
    plugins: [banner(bannerContent)],
    build: {
        rollupOptions: {
            input: {
                roolith: resolve(__dirname, 'src/sass/roolith.scss'),
            },
            output: {
                assetFileNames: `[name]-${pkg.version}[extname]`,
            },
        },
        outDir: 'dist',
        emptyOutDir: true,
    },
});
