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
	LibraryData,
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

	private async createLibraryData(name: string, version: string | null): Promise<LibraryData> {
		const initialData = await fetchLibraryData<InitialJson>(name, null);
		const versions: LibraryData['versions'] = {};

		if (version && version !== initialData.version) {
			const versionData = await fetchLibraryData<VersionJson>(name, version);
			versions[version] = parseFetchedData(versionData, version, initialData.filename);
		} else {
			versions[initialData.version] = parseFetchedData(initialData, initialData.version);
		}

		return {
			latest: initialData.version,
			filename: initialData.filename,
			versions,
			updatedAt: new Date().toISOString(),
		};
	}

	private saveLibraryData(name: string, data: LibraryData) {
		this.data[name] = data;
		this.keys = createLibraryKeys(this.data);
		writeJson(this.file, this.data);
	}

	private isOutdated(data: LibraryData) {
		const updatedAt = new Date(data.updatedAt).valueOf();
		return Date.now() - updatedAt > 1000 * 60 * 60 * 24 * 31;
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
			// lib hasn't been fetched yet
			// fetch initial data, download and return
			const lib = await this.createLibraryData(name, version);

			if (!!version && version !== lib.latest) {
				console.log('New version is available %o => %o', version, lib.latest);
			}

			this.saveLibraryData(name, lib);
			await this.download(name, version ?? lib.latest, lib.filename);
			return;
		}

		const lib = this.data[name];
		const isOutdated = this.isOutdated(lib);

		if (!version && isOutdated) {
			const fetched = await fetchLibraryData<InitialJson>(name, null);

			if (fetched.version !== lib.latest) {
				console.log('Downloading new version: %o => %o', lib.latest, fetched.version);

				lib.latest = fetched.version;
				lib.updatedAt = new Date().toISOString();
				lib.versions[fetched.version] = parseFetchedData(fetched, fetched.version);
				this.saveLibraryData(name, lib);
				await this.download(name, lib.latest, lib.filename);
				return;
			}
		}

		if (!version) {
			console.log('Version %o of %o has already been fetched', lib.latest, name);
			return;
		}

		if (version in lib.versions) {
			console.log('Version %o of %o has already been fetched', version, name);
			return;
		}

		const fetched = await fetchLibraryData<VersionJson>(name, version);
		lib.versions[version] = parseFetchedData(fetched, version, lib.filename);
		this.saveLibraryData(name, lib);
		await this.download(name, version, lib.filename);
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
