import { defineConfig } from 'vite';
import type { UserConfigFn, BuildOptions } from 'vite';

const config: UserConfigFn = ({ mode, command }) => {
	if (mode === 'production' && command === 'serve') {
		return defineConfig({
			// base: "./",
			server: {
				open: true,
				proxy: {
					"/sketches": {
						target: "http://localhost:4173",
						changeOrigin: true,
						rewrite: (path) => path.replace(/^\/sketches/, ""),
					},
				},
			},
		});
	}

	return defineConfig({});
};

export default config;