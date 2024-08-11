import { fields, url } from './config.js';
import { fetchRequest } from './utils.js';

import type {
	Libraries,
	LibraryData,
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

export async function createLibraryData(
	name: string
): Promise<LibraryData | null> {
	const fetched = await fetchLibraryData<InitialJson>(name, null);

	return {
		latest: fetched.version,
		filename: fetched.filename,
		versions: {
			[fetched.version]: parseFetchedData(fetched, fetched.version),
		},
		updatedAt: new Date().toISOString(),
	};
}

export async function updateLibraryData(
	data: LibraryData,
	name: string,
	version: string | null
): Promise<LibraryData | null> {
	const updatedAt = new Date(data.updatedAt).valueOf();
	const outdated = Date.now() - updatedAt > 1000 * 60 * 60 * 24 * 31;
	// const outdated = true;
	// console.log(updatedAt);
	// console.log(Date.now());
	// console.log(outdated);

	if (!version && !outdated && data.latest) {
		console.log(
			'Latest version %o of %o has already been fetched',
			data.latest,
			name
		);
		return null;
	}

	if (!version && outdated) {
		const fetched = await fetchLibraryData<InitialJson>(name, null);

		if (fetched.version === data.latest && fetched.version in data.versions) {
			console.log(
				'Latest version %o of %o has already been fetched',
				data.latest,
				name
			);
			return null;
		}

		/** @todo test! */
		data.latest = fetched.version;
		data.versions[fetched.version] = parseFetchedData(fetched, fetched.version);
		data.updatedAt = new Date().toISOString();
		return data;
	}

	if (version) {
		const versions = Object.keys(data.versions);

		if (versions.includes(version)) {
			console.log('Version %o of %o has already been fetched', version, name);
			return null;
		}

		const fetched = await fetchLibraryData<VersionJson>(name, version);
		data.versions[version] = parseFetchedData(fetched, version, data.filename);
		return data;
	}

	console.log('Something went wrong ...');
	process.exit(1);
}

async function fetchLibraryData<T>(name: string, version: string | null) {
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

function parseFetchedData(
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
