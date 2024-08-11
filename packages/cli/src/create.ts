#!/usr/bin/env node

import np from 'node:path';
import nfs, { promises as nfp } from 'node:fs';
import { parseArgs, type ParseArgsConfig } from 'node:util';
import { logError, parseJson, writeJson } from '@internal/cdn';

const dirname = {
	sketches: 'sketches',
	templates: 'templates',
} as const;

const regex = {
	isoDate: /^\d{4}-\d{1,2}-\d{1,2}/,
	targetFolder: /^\d{4}-\d{1,2}-\d{1,2}-\w+/,
};

(async () => {
	const options: ParseArgsConfig['options'] = {
		name: {
			type: 'string',
			short: 'n',
		},
		tmpl: {
			type: 'string',
			short: 't',
		},
		source: {
			type: 'string',
		},
		src: {
			type: 'string',
			short: 's',
		},
	};

	const parsed = parseArgs({
		args: process.argv.slice(2),
		options,
		strict: false,
		allowPositionals: true,
	});

	const target = getTargetPath(parsed);

	const sourceValue = parsed.values.src ?? parsed.values.source;
	const source = sourceValue
		? getSourcePath(sourceValue)
		: getTemplatePath(parsed);

	await copySourceFiles(source, target);
	updatePackageJson(target);

	console.log('✅ Done');
})();

function getTargetPath({ values, positionals }: ReturnType<typeof parseArgs>) {
	const name =
		positionals[0] === process.argv[2] ? positionals[0] : values.name;

	if (!name) {
		console.log('Please provide a name to create a new project');
		console.log(
			'e.g. %o, %o or %o',
			'npx create foo',
			'npx create --name foo',
			'npx create --name=foo'
		);
		process.exit(1);
	}

	if (values.name && positionals[0] === process.argv[2]) {
		console.log('Too much arguments were passed. Using %o', name);
	}

	if (typeof name === 'string') {
		const target = regex.targetFolder.test(name)
			? name
			: `${new Date().toISOString().split('T')[0]}-${name}`;

		if (!getFolders(dirname.sketches).includes(target)) {
			return np.resolve('./', dirname.sketches, target);
		}

		console.log('project %o already exists', target);
		process.exit(1);
	}

	const arg =
		['--name', '-n'].find((val) => process.argv.includes(val)) ?? 'name';
	console.log('Invalid value for argument %o', arg);
	process.exit(1);
}

function getTemplatePath({ values }: ReturnType<typeof parseArgs>) {
	const source = values.tmpl;

	if (!source) return np.resolve('./', dirname.templates, 'instance');

	const possible = getFolders(dirname.templates);

	if (typeof source === 'string') {
		if (possible.includes(source)) {
			return np.resolve('./', dirname.templates, source);
		}

		console.log('Could not determine template project %o', source);
		console.log(getFoldersMessage(possible), ...possible);
		process.exit(1);
	}

	const arg = ['--tmpl', '-t'].find((val) => process.argv.includes(val));
	console.log('Invalid value for argument %o', arg);
	console.log(getFoldersMessage(possible), ...possible);
	process.exit(1);
}

function getSourcePath(source: string | boolean) {
	const possible = getFolders(dirname.sketches);

	if (typeof source === 'string') {
		if (possible.includes(source)) {
			return np.resolve('./', dirname.sketches, source);
		}

		console.log('Could not determine source project %o', source);
		console.log(getFoldersMessage(possible), ...possible);
		process.exit(1);
	}

	const arg = ['--source', '--src', '-s'].find((val) =>
		process.argv.includes(val)
	);
	console.log('Invalid value for argument %o', arg);
	console.log(getFoldersMessage(possible), ...possible);
	process.exit(1);
}

function getFoldersMessage(values: string[]) {
	return `Use one of these ${Array.from({ length: values.length }, () => '%o').join(', ')}`;
}

async function copySourceFiles(from: string, to: string) {
	console.log('Creating new sketch in %o', to);

	try {
		nfs.mkdirSync(to);

		let source: string;
		let target: string;

		/** @todo get outDir from vite.config.ts if from.includes(dirname.sketches) */
		const promised = nfs
			.readdirSync(from)
			.filter((item): item is string => typeof item === 'string')
			.filter((item) => !/^node_module|^dist|^\.vite/.test(item))
			.map((item) => {
				source = np.resolve(from, item);
				target = np.resolve(to, item);
				return nfp.cp(source, target, { recursive: true });
			});

		await Promise.all(promised);
	} catch (error) {
		logError(error);
		process.exit(1);
	}
}

function updatePackageJson(absDirPath: string) {
	const path = np.join(absDirPath, 'package.json');
	const pkg = parseJson(path);

	const names = getPackageNames();
	let name = np.basename(absDirPath).replace(regex.isoDate, '').slice(1);

	/** @todo it could also be possible to get and set <root><package.json>.workspaces explicitely */
	if (names.includes(name)) {
		let i = 1;
		let fallback = `${name}${i}`;

		while (names.includes(fallback)) {
			i += 1;
			fallback = `${name}${i}`;
		}

		console.warn(
			'Project name %o is already in use. Renaming Project to %o',
			name,
			fallback
		);
		console.warn('Consider to rename the project manually');
		name = fallback;
	}

	const data = Object.assign(pkg, { name });

	writeJson(path, data);
}

function getPackageNames() {
	return getFolders(dirname.sketches)
		.map((dir) => np.resolve('./', dirname.sketches, dir, 'package.json'))
		.filter((path) => nfs.existsSync(path))
		.map((path) => parseJson(path).name);
}

type ReadOptions = Parameters<typeof nfp.readdir>[1];

function getFolders(directory: string, customOptions?: ReadOptions) {
	const options: ReadOptions = {
		...{
			recursive: false,
			withFileTypes: true,
		},
		...customOptions,
	};

	try {
		return nfs
			.readdirSync(np.resolve(directory), options)
			.filter((item) => item.isDirectory())
			.map((item) => item.name);
	} catch (error) {
		logError(error);
	}

	return [];
}
