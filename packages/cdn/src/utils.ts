import { readFileSync, writeFileSync } from 'node:fs';

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

export async function fetchRequest<T>(request: string) {
	try {
		const data = await fetch(request);
		return (await data.json()) as T;
	} catch (error) {
		logError(error);
	}

	return null;
}

export function logError(error: unknown) {
	if (error instanceof Error) {
		console.log(error.message);
	}
}
