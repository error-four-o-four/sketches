#!/usr/bin/env node

import np from 'node:path';
import nfs from 'node:fs';
import { parseArgs } from 'node:util';
import { logError, parseJson, writeJson } from './utils/index.js';

const cdnBaseUrl = 'https://cdnjs.cloudflare.com/ajax/libs';
const cdnApiUrl = 'https://api.cdnjs.com/libraries';
const cdnInitialFields = ['name', 'version', 'filename', 'sri'] as const;
const cdnVersionFields = ['name', 'sri'] as const;

type JsonError = {
	error: true;
	status: number;
	message: string;
};

type InitialJson = {
	[K in (typeof cdnInitialFields)[number]]: K extends 'version'
	? Semver
	: string
};

type VersionJson = {
	[K in (typeof cdnVersionFields)[number]]: K extends 'sri'
	? Record<string, string>
	: string;
};

type InitialResponse = JsonError | InitialJson;
type VersionResponse = JsonError | VersionJson;

type LibraryData = {
	latest: Semver,
	versions: Record<Semver, LibraryDataItem>;
	filename: string;
	updatedAt: string;
};

type LibraryDataItem = {
	url: `https://${string}`;
	sri: string;
};

type Semver = `${number}.${number}.${number}`;

// #####

(async () => {
	const { positionals } = parseArgs({
		args: process.argv.slice(2),
		strict: false,
		allowPositionals: true,
	});

	let [name, version] = parseValues(positionals);

	if (!name) {
		console.log('Please provide a valid a library name');
		console.log("e.g. 'p5.js', 'p5.js@1.10.0' or p5.js 1.9.1");
		process.exit(1);
	}

	const path = np.resolve('./public/libs.json');
	const libs: Record<string, LibraryData> = (parseJson(path) ?? {});

	if (!Object.hasOwn(libs, name)) {
		const result = await createLibraryData(name);
		if (result) {
			libs[name] = result;
		}
	}

	if (version) {
		const result = await updateLibraryData(libs[name], name, version);
		if (result) {
			libs[name] = result;
		}
	}

	writeJson(path, libs);

	version = !!version ? version : libs[name].latest;

	await downloadLibrary(name, version, libs[name].filename, libs[name].versions[version]);

	console.log('✅ Done');
})();

function parseValues(args: string[]): [string | null, Semver | null] {
	if (args.length === 0 || !args[0]) {
		return [null, null];
	}

	if (args[0].includes('@')) {
		const [name, version] = args[0].split('@');
		return [name, validateVersion(version)];
	}

	const version = args[1] ? validateVersion(args[1]) : null;
	return [args[0], version];
}

function validateVersion(version: string) {
	/** @todo force fetch */
	// if (version === 'latest') return version

	const rx = /^\d+\.\d+\.\d+$/;

	if (rx.test(version)) return version as Semver;

	console.log('%o is an invalid version', version);
	return null;
}

async function fetchLibraryData<T>(name: string, version: string | null) {
	const base = version ? `${name}/${version}` : name;
	const fields = version ? cdnVersionFields : cdnInitialFields;
	const url = `${cdnApiUrl}/${base}?fields=${fields.join(',')}`;

	console.log('Fetching data from %o ...', url);

	const json = await fetchRequest<InitialResponse | VersionResponse>(url);

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

async function fetchRequest<T>(request: string) {
	try {
		const data = await fetch(request);
		return (await data.json()) as T;

	} catch (error) {
		logError(error);
	}

	return null;
}

async function createLibraryData(
	name: string
): Promise<LibraryData | null> {
	const fetched = await fetchLibraryData<InitialJson>(name, null);

	return {
		latest: fetched.version,
		filename: fetched.filename,
		versions: {
			[fetched.version]: parseFetchedData(fetched, fetched.version)
		},
		updatedAt: (new Date()).toISOString()
	};
}

async function updateLibraryData(
	data: LibraryData,
	name: string,
	version: Semver | null
): Promise<LibraryData | null> {
	const updatedAt = (new Date(data.updatedAt)).valueOf();
	const outdated = Date.now() - updatedAt > 1000 * 60 * 60 * 24 * 31;
	// const outdated = true;
	// console.log(updatedAt);
	// console.log(Date.now());
	// console.log(outdated);

	if (!version && !outdated && data.latest) {
		console.log('Latest version %o of %o has already been fetched', data.latest, name);
		return null;
	}

	if (!version && outdated) {
		const fetched = await fetchLibraryData<InitialJson>(name, null);

		if (
			fetched.version === data.latest &&
			fetched.version in data.versions
		) {
			console.log('Latest version %o of %o has already been fetched', data.latest, name);
			return null;
		}

		/** @todo test! */
		data.latest = fetched.version;
		data.versions[fetched.version] = parseFetchedData(fetched, fetched.version);
		data.updatedAt = (new Date()).toISOString();
		return data;
	}

	if (version) {
		const versions = Object.keys(data.versions);

		if (versions.includes(version)) {
			console.log('Version %o of %o has already been fetched', version, name);
			return null;
		}

		const fetched = await fetchLibraryData<VersionJson>(name, version);
		data.versions[version] = parseFetchedData(fetched, version, data.filename);;
		return data;
	}

	console.log('Something went wrong ...');
	process.exit(1);
}

function parseFetchedData(
	data: InitialJson | VersionJson,
	version: Semver,
	filename?: string
): LibraryDataItem {
	filename = 'filename' in data ? data.filename : filename;

	if (!filename) {
		throw new Error('Filename of %o is required!');
	}

	return {
		url: getCdnUrl(data.name, version, filename),
		sri: typeof data.sri === 'string' ? data.sri : data.sri[filename]
	};
}

function getCdnUrl(
	name: string,
	version: Semver,
	filename: string,
) {
	return `${cdnBaseUrl}/${name}/${version}/${filename}` as LibraryDataItem['url'];
}

async function downloadLibrary(
	name: string,
	version: Semver,
	filename: string,
	{ url }: LibraryDataItem
) {
	const path = np.resolve('./public', name, version);
	const file = np.resolve(path, filename);

	if (nfs.existsSync(file)) {
		console.log('Version %o of %o has already been downloaded', version, name);
		process.exit(0);
	}

	nfs.mkdirSync(path, { recursive: true });

	try {
		const data = await fetch(url);
		const lib = (await data.text());
		nfs.writeFileSync(file, lib, 'utf-8');
	} catch (error) {
		logError(error);
		process.exit(1);
	}
}