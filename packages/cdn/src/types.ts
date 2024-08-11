import { url, fields } from './config.js';

type JsonError = {
	error: true;
	status: number;
	message: string;
};

export type InitialJson = {
	[K in (typeof fields.initial)[number]]: string;
};

export type VersionJson = {
	[K in (typeof fields.version)[number]]: K extends 'sri'
		? Record<string, string>
		: string;
};

export type InitialResponse = JsonError | InitialJson;
export type VersionResponse = JsonError | VersionJson;

export type Libraries = Record<string, LibraryData>;

export type LibraryData = {
	latest: string;
	versions: Record<string, LibraryDataItem>;
	filename: string;
	updatedAt: string;
};

export type LibraryDataItem = {
	url: LibraryUrl;
	sri: string;
};

export type LibrarySrc = `/${string}/${string}/${string}`;
export type LibraryUrl = `${typeof url.base}${LibrarySrc}`;
