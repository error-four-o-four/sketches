import { defineConfig } from 'vite';
import type { BuildOptions, UserConfigFn } from 'vite';

import { publicDirPath } from './vite.options.js';

export default <UserConfigFn>function ({ mode }) {
	const rollupOptions: BuildOptions['rollupOptions'] =
		mode !== 'development'
			? {
					output: {
						format: 'iife',
					},
				}
			: {};

	return defineConfig({
		publicDir: publicDirPath,
		build: {
			emptyOutDir: true,
			copyPublicDir: false,
			minify: false,
			rollupOptions,
		},
		server: {
			open: true,
		},
	});
};
