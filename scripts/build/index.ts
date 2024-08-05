import { rm } from 'node:fs/promises';
import { resolve } from "node:path";
import { build } from 'vite';

import { createLogger, customLogger, hasFlag } from "../util.js";

import { base, outDir, viewsDir, sketches } from './config.js';
import { copyFavicon, copyCssFiles } from "./copy.js";
import { cdn } from './cdn.js';

import { postTransformSketch, preTransformSketch, transformMain } from './transform.js';

const log = createLogger();

(async () => {
	await emptyOutDir();

	log('Building for production ...');

	await Promise.all([
		promiseMain(),
		copyFavicon(),
		copyCssFiles(),
		...sketches.map(promiseSketch),
	]);

	cdn.save();

	log('✅ Done');
})();


async function emptyOutDir() {
	const clean = hasFlag('--clean');

	if (!clean) return;

	await rm(resolve('./dist'), { recursive: true, force: true });

	log('Cleaned target directory ...');
}

function promiseSketch([root, name]: string[]) {
	const main = resolve(root, 'index.html');
	const dir = resolve(outDir, viewsDir, name);

	return build({
		customLogger,
		root,
		build: {
			outDir: dir,
			assetsDir: '',
			minify: true,
			emptyOutDir: true,
			copyPublicDir: false,
			rollupOptions: {
				input: {
					main
				},
				output: {
					dir
				}
			}
		},
		plugins: [
			preTransformSketch(name),
			postTransformSketch(name),
		]
	});
}

function promiseMain() {
	// add an empty line
	console.log();

	return build({
		base: `/${base}/`,
		customLogger,
		build: {
			outDir,
			assetsDir: '',
			minify: true,
			emptyOutDir: false,
			copyPublicDir: false,
		},
		plugins: [
			transformMain(sketches)
		]
	});
}


