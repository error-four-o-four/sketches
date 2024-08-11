import { defineConfig, type UserConfigFn } from 'vite';

import {
	customLogger,
	root,
	base,
	outDirPath,
	publicDirPath,
	transformOptions,
	bundleOptions,
	assetsOptions,
} from './vite.options.js';

import {
	buildSketches,
	copyStaticAssets,
	transformIndexHtml,
} from './vite.plugin.js';

export default <UserConfigFn>function ({ mode, command }) {
	// vite dev
	if (mode === 'development') {
		return defineConfig({
			root,
			publicDir: publicDirPath,
			plugins: [transformIndexHtml(transformOptions)],
			server: {
				open: true,
			},
		});
	}

	// vite build
	if (command === 'build') {
		return defineConfig({
			root,
			base: `/${base}/`,
			publicDir: publicDirPath,
			build: {
				outDir: outDirPath,
				assetsDir: '',
				emptyOutDir: true,
				copyPublicDir: false,
				minify: true,
			},
			plugins: [
				transformIndexHtml(transformOptions),
				buildSketches(bundleOptions),
				copyStaticAssets(assetsOptions),
			],
			customLogger,
		});
	}

	// vite preview
	if (mode === 'production' && command === 'serve') {
		return defineConfig({
			// base: "./",
			server: {
				open: true,
				proxy: {
					[`/${base}`]: {
						target: 'http://localhost:4173',
						changeOrigin: true,
						rewrite: (path) => path.replace(new RegExp('^/' + base), ''),
					},
				},
			},
		});
	}

	return defineConfig({});
};
