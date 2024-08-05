import type { Plugin } from "vite";
import { type HTMLElement, parse } from "node-html-parser";

import { assetsDir, base, viewsDir } from "./config.js";
import { cdn, file, latest } from "./cdn.js";

export function preTransformSketch(name: string): Plugin {
	console.log('Transforming %o ...', name);

	return {
		name: 'transform-sketch-pre',
		transformIndexHtml: {
			order: 'pre',
			async handler(html) {
				const root = parse(html);
				transformTitle(root, name);

				const scripts = root.querySelectorAll('script');
				await transformP5Script(scripts);

				return root.toString();
			}
		}
	};
}

function transformTitle(root: HTMLElement, name: string) {
	const title = root.querySelector('title');

	if (title) {
		title.set_content(name.charAt(0).toLocaleUpperCase() + name.slice(1));
	}
}

async function transformP5Script(elts: HTMLElement[]) {
	const elt = elts.filter(elt => elt.getAttribute('src')?.endsWith(file))[0];

	if (!elt) {
		console.log('Could not find %o', file);
		return;
	}

	// src has leading '/' !
	const version = elt.getAttribute('src')?.split('/')[1] ?? latest;
	const data = await cdn.get(version);

	if (!data) {
		return;
	}

	// <script
	// 	src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js"
	// 	integrity="sha512-d6sc8kbZEtA2LwB9m/ck0FhvyUwVfdmvTeyJRprmj7Wg9wRFtHDIpr6qk4g/y3Ix3O9I6KHIv6SGu9f7RaP1Gw=="
	// 	crossorigin="anonymous"
	// 	referrerpolicy="no-referrer"
	// ></script>

	elt.setAttribute('src', data.src);
	elt.setAttribute('integrity', data.sri);
	elt.setAttribute('crossorigin', 'anonymous');
	elt.setAttribute('referrerpolicy', 'no-referrer');
}

export function postTransformSketch(name: string): Plugin {
	return {
		name: 'transform-sketch-post',
		transformIndexHtml: {
			order: 'post',
			async handler(html) {
				const root = parse(html);
				const links = root.querySelectorAll('link');
				const scripts = root.querySelectorAll('script');

				for (const elt of [...scripts, ...links]) {
					transformAssetUrl(elt, name);
				}

				return root.toString();
			}
		}
	};
}

function transformAssetUrl(asset: HTMLElement, name: string) {
	let attr = asset.rawTagName === 'script' ? 'src' : 'href';
	let val = asset.getAttribute(attr);

	if (!val) return;

	if (asset.rawTagName === 'script' && val.startsWith('https')) return;

	val = val.startsWith(`/${assetsDir}`)
		? `/${base}${val}`
		: `/${base}/${viewsDir}/${name}${val}`;

	asset.setAttribute(attr, val);
	// console.log(asset.attributes);
}

export function transformMain(entries: string[][]): Plugin {
	const names = entries.map(([name]) => name);

	return {
		name: 'transform-main',
		transformIndexHtml: {
			order: 'post',
			async handler(html) {
				const root = parse(html);
				const list = root.getElementById('sketches');

				if (!list) {
					return html;
				}

				const items = entries.reduce((output, entry) => {
					const [, name, date] = entry;
					const href = `./${viewsDir}/${name}/`;
					const alt = `Link to ${name}`;
					const title = name.charAt(0).toLocaleUpperCase() + name.slice(1);
					const span = !!date ? `<span>(${date})</span>` : '';
					return `${output}\n\t\t\t\t\t<li><a href="${href}" alt="${alt}">${title}</a>${span}</li>`;
				}, '');

				list.set_content('');
				list.insertAdjacentHTML('afterbegin', items);

				return root.toString();
			}
		}
	};
}