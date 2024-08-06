import np from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import { nodeExternals } from 'rollup-plugin-node-externals';

const dirname = np.dirname(fileURLToPath(import.meta.url));
const entry = ['create.ts'].map(file => np.resolve(dirname, 'src', file));

export default defineConfig({
	build: {
		minify: true,
		emptyOutDir: true,
		lib: {
			entry,
			formats: ['cjs'],
			fileName(format, name) {
				return (format === 'cjs') ? `${name}.cjs` : `${name}.${format}`;
			},
		},
	},
	plugins: [
		externals()
	]
});

function externals(): Plugin {
	return {
		...nodeExternals({}),
		name: 'node-externals',
		enforce: 'pre',
		apply: 'build',
	};
}