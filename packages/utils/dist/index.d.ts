declare const rxIsoDate: RegExp;
declare function parseJson(path: string): any;
declare function writeJson(path: string, data: unknown): void;
declare function logError(error: unknown): void;

export { logError, parseJson, rxIsoDate, writeJson };
