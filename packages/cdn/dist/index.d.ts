declare const url: {
    readonly base: "https://cdnjs.cloudflare.com/ajax/libs";
    readonly api: "https://api.cdnjs.com/libraries";
};

type Libraries = Record<string, LibraryData>;
type LibraryData = {
    latest: string;
    versions: Record<string, LibraryDataItem>;
    filename: string;
    updatedAt: string;
};
type LibraryDataItem = {
    url: LibraryUrl;
    sri: string;
};
type LibrarySrc = `/${string}/${string}/${string}`;
type LibraryUrl = `${typeof url.base}${LibrarySrc}`;

declare class LibHandler {
    private path;
    private file;
    private data;
    private keys;
    constructor(path: string);
    private createLibraryData;
    private updateLibraryData;
    private download;
    fetch(name: string, version: string | null): Promise<void>;
    has(src: string): boolean;
    get(src: string): LibraryDataItem | null;
}

declare function parseJson(path: string): any;
declare function writeJson(path: string, data: unknown): void;
declare function logError(error: unknown): void;

export { LibHandler, type Libraries, type LibraryDataItem as LibraryData, logError, parseJson, writeJson };
