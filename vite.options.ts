import np from 'node:path';
import nfs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { createLogger } from 'vite';

import type {
	SketchData,
	TransformOptions,
	BuildSketchesOptions,
	StaticAssetsOptions,
} from './vite.plugins.js';

const input = [
	'2024-08-12-fusilli-animata',
	'2024-07-23-fusilli',
	'2022-07-12-emoji-pack'
] as const;

const project = fileURLToPath(new URL('./', import.meta.url));

const base = 'sketches';
const root = np.join(project, base);

const dirnameOut = 'dist';
const dirnamePublic = 'public';

const subDirnameStatic = 'static';
const subDirnameViews = 'views';

const outDirPath = np.join(project, dirnameOut);
const outSubDirPath = np.join(outDirPath, subDirnameViews);
const publicDirPath = np.join(project, dirnamePublic);

const customLogger = createLogger();
const logInfo = customLogger.info.bind(customLogger);

customLogger.info = (msg, opts) => {
	if (msg.includes('production')) return;

	logInfo(msg, opts);
};

export { base, root, outDirPath, publicDirPath, customLogger };

const data = createData();

export const transformOptions: TransformOptions = {
	base,
	subDir: subDirnameViews,
	data,
};

export const bundleOptions: BuildSketchesOptions = {
	outPath: outSubDirPath,
	publicPath: publicDirPath,
	subDirStatic: subDirnameStatic,
	subDirViews: subDirnameViews,
	base,
	data,
};

export const assetsOptions: StaticAssetsOptions = {
	srcPath: np.join(publicDirPath, subDirnameStatic),
	outPath: np.join(outDirPath, subDirnameStatic),
};

function createData(): BuildSketchesOptions['data'] {
	return input.map((folder) => toData(folder)).sort((a, b) => sortData(a, b));
}

function toData(folder: string): SketchData {
	const match = folder.match(/^\d{4}-\d{1,2}-\d{1,2}/);
	const entry = np.join(root, folder);

	let name: string;
	let date: string;

	if (match) {
		date = match[0];
		name = folder.replace(`${date}-`, '');
	} else {
		const stat = nfs.existsSync(entry) ? nfs.lstatSync(entry) : null;
		date = stat ? new Date(stat.birthtime).toISOString().split('T')[0] : '';
		name = folder;
	}

	const outDir = np.join(outSubDirPath, name);

	return {
		root: entry,
		outDir,
		name,
		date,
	};
}

function sortData(a: SketchData, b: SketchData) {
	const dateA = !!a.date ? new Date(a.date).valueOf() : 0;
	const dateB = !!b.date ? new Date(b.date).valueOf() : 0;

	return dateB - dateA;
}
