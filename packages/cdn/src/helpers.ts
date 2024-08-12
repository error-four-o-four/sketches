import { logError } from '@internal/utils';

import { fields, url } from './config.js';

import type {
	Libraries,
	LibraryDataItem,
	InitialResponse,
	InitialJson,
	VersionResponse,
	VersionJson,
	LibrarySrc,
} from './types.js';

export function createLibraryKeys(data: Libraries) {
	const libs = Object.entries(data);
	const keys = new Set<LibrarySrc>();

	libs.forEach(([key, lib]) => {
		const { filename } = lib;
		const versions = Object.keys(lib.versions);

		for (const version of versions) {
			const src: LibrarySrc = `/${key}/${version}/${filename}`;
			keys.add(src);
		}
	});

	return keys;
}

export async function fetchLibraryData<T>(
	name: string,
	version: string | null
) {
	const base = version ? `${name}/${version}` : name;
	const query = version ? fields.version : fields.initial;
	const request = `${url.api}/${base}?fields=${query.join(',')}`;

	console.log('Fetching data from %o ...', request);

	const json = await fetchRequest<InitialResponse | VersionResponse>(request);

	if (!json) {
		console.log('Could not fetch library data!');
		process.exit(1);
	}

	if ('error' in json) {
		console.log(json.status, json.message);
		process.exit(1);
	}

	return json as T;
}

export async function fetchRequest<T>(request: string) {
	try {
		const data = await fetch(request);
		return (await data.json()) as T;
	} catch (error) {
		logError(error);
	}

	return null;
}

export function parseFetchedData(
	data: InitialJson | VersionJson,
	version: string,
	filename?: string
): LibraryDataItem {
	filename = 'filename' in data ? data.filename : filename;

	if (!filename) {
		throw new Error('Filename of %o is required!');
	}

	return {
		url: `${url.base}/${data.name}/${version}/${filename}`,
		sri: typeof data.sri === 'string' ? data.sri : data.sri[filename],
	};
}
