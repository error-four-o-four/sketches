import fp from 'node:fs/promises';
import { resolve } from 'node:path';

import { build } from 'esbuild';
import { favicon, assetsDir } from './config.js';


export function copyFavicon() {
	const source = resolve('./public', assetsDir, favicon);
	const target = resolve('./dist', assetsDir, favicon);

	return fp.cp(source, target);
}

export async function copyCssFiles() {
	const source = resolve('./public', assetsDir);
	const target = resolve('./dist', assetsDir);
	const files = await fp.readdir(source, { recursive: true });

	return files
		.filter(file => file.endsWith('.css')).map(file => {
			return build({
				entryPoints: [resolve(source, file)],
				outdir: target,
				minify: true,
			});
		});
}