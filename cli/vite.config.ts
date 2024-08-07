import np from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin, type UserConfigFn } from 'vite';
import { nodeExternals } from 'rollup-plugin-node-externals';

const dirname = np.dirname(fileURLToPath(import.meta.url));
const entry = ['create.ts', 'fetch.ts'].map(file => np.resolve(dirname, 'src', file));

export default <UserConfigFn>function config({ mode }) {
	const minify = mode !== 'development';

	console.log(mode);

	return defineConfig({
		build: {
			minify,
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
};

function externals(): Plugin {
	return {
		...nodeExternals({}),
		name: 'node-externals',
		enforce: 'pre',
		apply: 'build',
	};
}