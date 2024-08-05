import { resolve } from 'node:path';

export const favicon = 'favicon.svg';

export const outDir = resolve('./dist');
export const viewsDir = 'views';
export const assetsDir = 'static';

export const base = 'sketches';

// order matters
export const sketches = [
	// 'template'
	'2024-08-05-foo',
].map(toEntry);

function toEntry(folder: string) {
	const re = /^\d{4}-\d{1,2}-\d{1,2}/;
	const match = folder.match(re);

	if (match) {
		const date = match[0];
		const name = folder.replace(`${date}-`, '');

		return [
			resolve('./sketches', folder),
			name,
			date
		];
	}

	return [
		resolve('./sketches', folder),
		folder,
		''
	];
}

