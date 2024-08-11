import np from 'node:path';
import nfs from 'node:fs';

import { filename } from './config.js';

import { parseJson, writeJson, logError } from './utils.js';

import {
	createLibraryData,
	createLibraryKeys,
	updateLibraryData,
} from './helpers.js';

import type { Libraries, LibrarySrc } from './types.js';

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
			const result = await createLibraryData(name);
			if (result) {
				this.data[name] = result;
			}
		}

		if (version) {
			const result = await updateLibraryData(this.data[name], name, version);
			if (result) {
				this.data[name] = result;
			}
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
