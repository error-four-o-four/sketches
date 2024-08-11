import np from 'node:path';
import nfp from 'node:fs/promises';

import { build, createLogger } from 'vite';
import type { Plugin } from 'vite';

import { build as esbuild } from 'esbuild';

import { parse } from 'node-html-parser';
import type { HTMLElement } from 'node-html-parser';

import { LibHandler } from '@internal/cdn';
import type { LibraryData } from '@internal/cdn';

export const customLogger = createLogger();

const logInfo = customLogger.info.bind(customLogger);

customLogger.info = (msg, opts) => {
	if (msg.includes('production')) return;

	logInfo(msg, opts);
};

export type SketchData = {
	root: string;
	name: string;
	date: string;
	outDir: string;
};

export type TransformOptions = {
	data: SketchData[];
	base: string;
	subDir: string;
};

export function transformIndexHtml({
	data,
	base,
	subDir,
}: TransformOptions): Plugin {
	const content =
		data.reduce((output, input) => {
			const { name, date } = input;
			const href = `/${base}/${subDir}/${name}/`;
			const alt = `Link to ${name}`;
			const title = name.charAt(0).toLocaleUpperCase() + name.slice(1);
			const span = !!date ? `<span>(${date})</span>` : '';
			return `${output}\n\t\t\t\t\t<li><a href="${href}" alt="${alt}">${title}</a>${span}</li>`;
		}, '') + '\n\t\t\t\t';

	return {
		name: 'transform-index-html',
		transformIndexHtml: {
			order: 'pre',
			handler(html) {
				const root = parse(html);
				const list = root.querySelector('ul#sketches');

				if (!list) {
					return html;
				}

				list.set_content('');
				list.insertAdjacentHTML('afterbegin', content);

				return root.toString();
			},
		},
	};
}

export type StaticAssetsOptions = {
	srcPath: string;
	outPath: string;
};

export function copyStaticAssets({
	srcPath,
	outPath,
}: StaticAssetsOptions): Plugin {
	return {
		name: 'copy-static assets',
		async closeBundle() {
			const options: Parameters<typeof nfp.readdir>[1] = {
				recursive: true,
				withFileTypes: true,
			};

			const folders = (await nfp.readdir(srcPath, options))
				.filter((item) => item.isDirectory())
				.map((item) => {
					const path = np.join(outPath, item.name);
					return nfp.mkdir(path, { recursive: true });
				});

			await Promise.all(folders);

			const files = (await nfp.readdir(srcPath, options))
				.filter((item) => item.isFile())
				.map((item) => np.join(item.path, item.name));

			await esbuild({
				entryPoints: files,
				outdir: outPath,
				minify: true,
				loader: {
					// '.png': 'dataurl',
					'.svg': 'copy',
				},
				logLevel: 'info',
			});
		},
	};
}

export type BuildSketchesOptions = {
	outPath: string;
	publicPath: string;
	subDirStatic: string;
	subDirViews: string;
	base: string;
	sketches: SketchData[];
	libs: Record<string, LibraryData>;
};

export function buildSketches(options: BuildSketchesOptions): Plugin {
	const transformSketch = createTransformPlugin(options);

	const buildSketch = async (data: SketchData) => {
		const { root, outDir } = data;

		return build({
			root,
			build: {
				outDir,
				assetsDir: '',
				copyPublicDir: false,
				minify: true,
			},
			plugins: [transformSketch(data)],
			customLogger,
		});
	};

	return {
		name: 'build-sketches',
		async closeBundle() {
			await nfp.mkdir(options.outPath);

			const sketches = options.sketches.map((sketch) => buildSketch(sketch));

			await Promise.all(sketches);
		},
	};
}

function createTransformPlugin(
	options: BuildSketchesOptions
): (sketch: SketchData) => Plugin {
	const libs = new LibHandler(options.publicPath);

	return (sketch): Plugin => {
		return {
			name: 'transform-sketch-post',
			enforce: 'pre',
			transformIndexHtml: {
				// order: 'pre',
				handler(html) {
					// console.log('\nTransforming %o ...', sketch.name);

					const root = parse(html);
					updateTitle(root, sketch);

					const scripts = root
						.querySelectorAll('script')
						.filter((script) => script.attributes.src.startsWith('/'));

					for (const script of scripts) {
						const lib = libs.get(script.attributes.src);

						if (!lib) continue;

						updateLibrary(script, lib);
					}

					updateAssets(root, options, sketch);

					return root.toString();
				},
			},
		};
	};
}

function updateTitle(root: HTMLElement, data: SketchData) {
	const title = root.querySelector('title');
	const { name } = data;

	if (!title) return;

	title.set_content(name.charAt(0).toLocaleUpperCase() + name.slice(1));
}

function updateLibrary(script: HTMLElement, lib: LibraryData) {
	const { url, sri } = lib;

	script.setAttribute('src', url);
	script.setAttribute('integrity', sri);
	script.setAttribute('crossorigin', 'anonymous');
	script.setAttribute('referrerpolicy', 'no-referrer');

	// <script
	// 	src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js"
	// 	integrity="sha512-d6sc8kbZEtA2LwB9m/ck0FhvyUwVfdmvTeyJRprmj7Wg9wRFtHDIpr6qk4g/y3Ix3O9I6KHIv6SGu9f7RaP1Gw=="
	// 	crossorigin="anonymous"
	// 	referrerpolicy="no-referrer"
	// ></script>
}

function updateAssets(
	root: HTMLElement,
	options: BuildSketchesOptions,
	data: SketchData
) {
	const { base, subDirStatic, subDirViews } = options;
	const selector = `[href], [src]`;
	const assets = root.querySelectorAll(selector);
	for (const asset of assets) {
		const attr = 'href' in asset.attributes ? 'href' : 'src';
		const val = asset.attributes[attr];

		if (!val) {
			console.log('\n@todo');
			console.log(asset.tagName, asset.attributes);
			continue;
		}

		if (val.startsWith('https')) {
			continue;
		}

		if (val.startsWith(`/${subDirStatic}`)) {
			asset.setAttribute(attr, `/${base}${val}`);
			// console.log(asset.attributes);
			continue;
		}

		asset.setAttribute(attr, `/${base}/${subDirViews}/${data.name}${val}`);
		// console.log(asset.attributes);
	}
}
