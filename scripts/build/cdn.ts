import fs from 'node:fs';
import { fileURLToPath } from "node:url";

import { isObject, createLogger } from "../util.js";
import { resolve } from 'node:path';

const log = createLogger();
const dir = fileURLToPath(new URL('.', import.meta.url));
const path = resolve(dir, './cache.json');

export const file = 'p5.min.js';
export const latest = '1.10.0';
const field = 'sri';

let cache: ScriptTagCache;

export const cdn = {
	async get(version: string) {
		cache = cache ?? loadCache();

		if (version in cache) {
			return cache[version];
		}

		log('Calling %o api ...', 'cdnjs');

		const data = await fetchScriptData(version);

		if ('src' in data && field in data) {
			return cache[version] = data;
		}

		if ('error' in data) {
			console.log(data.error.message);
		}

		return null;
	},
	save() {
		const data = JSON.stringify(cache, null, 2);
		fs.writeFileSync(path, data, 'utf-8');
	},
};

function loadCache(): ScriptTagCache {
	if (!fs.existsSync(path)) {
		return {};
	}

	try {
		const data = fs.readFileSync(path, 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		log(error);
	}

	return {};
}

async function fetchScriptData(version: string): Promise<ScriptTagData | ScriptTagError> {
	const request = `https://api.cdnjs.com/libraries/p5.js/${version}?fields=${field}`;

	try {
		const res = await fetch(request);
		const data = (await res.json());

		if (isSuccess(data)) {
			const src = `https://cdnjs.cloudflare.com/ajax/libs/p5.js/${version}/${file}`;
			const sri = data.sri[file];

			return {
				src,
				sri
			};
		}

		if (isError(data)) {
			throw new Error(data.message);
		}

	} catch (error) {
		if (error instanceof Error) {
			return {
				error,
			};
		}
	}

	return {
		error: new Error(`Unable to fetch data from '${request}'`),
	};
}

function isSuccess(
	input: unknown
): input is JsonResponseSuccess {
	if (!isObject(input)) {
		return false;
	}

	return field in input && isObject(input[field]);
}

function isError(
	input: unknown
): input is JsonResponseError {
	if (!isObject(input)) return false;

	return 'error' in input;
}

type JsonResponseError = {
	error: true;
	status: number;
	message: string;
};

type JsonResponseSuccess = {
	[field]: Record<string, string>;
};

type ScriptTagData = {
	src: string,
	[field]: string;
};

type ScriptTagError = {
	error: Error;
};

type ScriptTagCache = Record<string, ScriptTagData>;

function createScriptTag(src: string, sri: string) {
	return `<script src="${src}" integrity="${sri}" crossorigin="anonymous" referrerpolicy="no-referrer"></script>`;
}