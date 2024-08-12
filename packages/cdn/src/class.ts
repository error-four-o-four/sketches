import np from 'node:path';
import nfs from 'node:fs';

import { parseJson, writeJson, logError } from '@internal/utils';

import { filename } from './config.js';

import {
	createLibraryKeys,
	fetchLibraryData,
	parseFetchedData,
} from './helpers.js';

import type {
	Libraries,
	LibrarySrc,
	InitialJson,
	VersionJson,
} from './types.js';

export class LibHandler {
	private path: string;
	private file: string;
	private data: Libraries;
	private keys: Set<LibrarySrc>;

	constructor(path: string) {
		this.path = path;
		this.file = np.join(path, filename);
		this.data = parseJson(this.file) ?? {};
		this.keys = createLibraryKeys(this.data);
	}

	private async createLibraryData(name: string) {
		const fetched = await fetchLibraryData<InitialJson>(name, null);

		this.data[name] = {
			latest: fetched.version,
			filename: fetched.filename,
			versions: {
				[fetched.version]: parseFetchedData(fetched, fetched.version),
			},
			updatedAt: new Date().toISOString(),
		};
	}

	private async updateLibraryData(name: string, version: string | null) {
		const lib = this.data[name];
		const updatedAt = new Date(lib.updatedAt).valueOf();
		const outdated = Date.now() - updatedAt > 1000 * 60 * 60 * 24 * 31;

		if (!version && !outdated && lib.latest) {
			console.log(
				'Latest version %o of %o has already been fetched',
				lib.latest,
				name
			);
			process.exit(0);
		}

		if (!version && outdated) {
			const fetched = await fetchLibraryData<InitialJson>(name, null);

			if (fetched.version === lib.latest && fetched.version in lib.versions) {
				console.log(
					'Latest version %o of %o has already been fetched',
					lib.latest,
					name
				);
				process.exit(0);
			}

			/** @todo test! */
			lib.latest = fetched.version;
			lib.versions[fetched.version] = parseFetchedData(
				fetched,
				fetched.version
			);
			lib.updatedAt = new Date().toISOString();
			this.data[name] = lib;
			return;
		}

		if (version) {
			const versions = Object.keys(lib.versions);

			if (versions.includes(version)) {
				console.log('Version %o of %o has already been fetched', version, name);
				process.exit(0);
			}

			const fetched = await fetchLibraryData<VersionJson>(name, version);
			this.data[name].versions[version] = parseFetchedData(
				fetched,
				version,
				lib.filename
			);
			return;
		}

		console.log('Something went wrong ...');
		process.exit(1);
	}

	private async download(name: string, version: string, filename: string) {
		const path = np.join(this.path, name, version);
		const file = np.resolve(path, filename);

		if (nfs.existsSync(file)) {
			console.log(
				'Version %o of %o has already been downloaded',
				version,
				name
			);
			process.exit(0);
		}

		nfs.mkdirSync(path, { recursive: true });

		try {
			const url = this.data[name].versions[version].url;
			const data = await fetch(url);
			const lib = await data.text();
			nfs.writeFileSync(file, lib, 'utf-8');
		} catch (error) {
			logError(error);
			process.exit(1);
		}
	}

	public async fetch(name: string, version: string | null) {
		if (!Object.hasOwn(this.data, name)) {
			await this.createLibraryData(name);
		}

		if (version) {
			await this.updateLibraryData(name, version);
		}

		writeJson(this.file, this.data);

		version = !!version ? version : this.data[name].latest;

		await this.download(name, version, this.data[name].filename);

		console.log('✅ Done');
	}

	public has(src: string) {
		return this.keys.has(src as LibrarySrc);
	}

	public get(src: string) {
		if (!this.keys.has(src as LibrarySrc)) return null;

		const [lib, version] = src.slice(1).split('/');

		const data = lib in this.data ? this.data[lib] : null;

		if (!data) return null;

		return data.versions[version] ?? null;
	}
}
