import { resolve } from "node:path";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

export const rx = {
	isoDate: /^\d{4}-\d{1,2}-\d{1,2}/,
	targetFolder: /^\d{4}-\d{1,2}-\d{1,2}-\w+/
};

export function logError(error: unknown) {
	if (error instanceof Error) {
		console.log(error.message);
	}
}

export function parseJson(path: string) {
	try {
		const file = readFileSync(path, 'utf-8');
		return JSON.parse(file);
	} catch (error) {
		logError(error);
	}

	return null;
}

export function writeJson(path: string, data: unknown) {
	writeFileSync(path, JSON.stringify(data, null, 2));
}


export function getFolders(dir: string) {
	try {
		return readdirSync(resolve(dir), { withFileTypes: true })
			.filter(item => item.isDirectory())
			.map(item => item.name);
	} catch (error) {
		logError(error);
	}

	return [];
}
