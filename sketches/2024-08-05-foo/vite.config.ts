import { defineConfig } from 'vite';
import type { UserConfigFn, BuildOptions } from 'vite';

const config: UserConfigFn = ({ mode }) => {
	const isDevelopment = mode === 'development';
	const rollupOptions: BuildOptions['rollupOptions'] = !isDevelopment
		? {
			output: {
				format: 'iife',
			}
		}
		: {};


	return defineConfig({
		publicDir: '../../public',
		build: {
			target: 'esnext',
			assetsDir: '',
			emptyOutDir: true,
			copyPublicDir: false,
			minify: false,
			rollupOptions,
		}
	});
};

export default config;