#!/usr/bin/env node

import np from 'node:path';
import fs, { promises as fp } from 'node:fs';
import { parseArgs, type ParseArgsConfig } from 'node:util';
import { rx, logError, parseJson, writeJson } from './utils/index.js';

const dirname = {
	sketches: 'sketches',
	templates: 'templates',
};


(async () => {
	const options: ParseArgsConfig['options'] = {
		name: {
			type: 'string',
			short: 'n'
		},
		source: {
			type: 'string',
		},
		src: {
			type: 'string',
			short: 's',
		}
	};

	const parsed = parseArgs({
		args: process.argv.slice(2),
		options,
		strict: false,
		allowPositionals: true,
	});

	const target = getTargetPath(parsed);
	const source = getSourcePath(parsed);

	await copySourceFiles(source, target);
	updatePackageJson(target);
})();


function getTargetPath({ values, positionals }: ReturnType<typeof parseArgs>) {
	const name = positionals[0] === process.argv[2] ? positionals[0] : values.name;

	if (!name) {
		console.log("Please submit a name to create a new project");
		console.log("e.g. 'npx create foo', 'npx create --name foo' or 'npx create --name=foo'");
		process.exit(1);
	}

	if (values.name && positionals[0] === process.argv[2]) {
		console.log('Too much arguments were passed. Using %o', name);
	}

	if (typeof name === 'string') {
		const target = rx.targetFolder.test(name)
			? name
			: `${new Date().toISOString().split('T')[0]}-${name}`;

		if (!getFolders(dirname.sketches).includes(target)) {
			return np.resolve('./', dirname.sketches, target);
		};

		console.log('project %o already exists', target);
		process.exit(1);
	}

	const arg = ['--name', '-n'].find(val => process.argv.includes(val)) ?? 'name';
	console.log('Invalid value for argument %o', arg);
	process.exit(1);
}

function getSourcePath({ values }: ReturnType<typeof parseArgs>) {
	const source = values.src ?? values.source;

	if (!source) return np.resolve('./', dirname.sketches, 'template');

	if (typeof source === 'string') {
		// const possible = [
		// 	...getFolders(dirname.sketches),
		// 	...getFolders(dirname.templates)
		// ];

		// if (possible.includes(source)) {
		// 	return source;
		// }

		if (getFolders(dirname.sketches).includes(source)) {
			return np.resolve('./', dirname.sketches, source);
		}

		console.log('Could not determine source project %o', source);
		process.exit(1);
	}

	const arg = ['--source', '--src', '-s'].find(val => process.argv.includes(val));
	console.log('Invalid value for argument %o', arg);
	process.exit(1);
}

function getFolders(dir: string) {
	try {
		return fs.readdirSync(np.resolve(dir), { withFileTypes: true })
			.filter(item => item.isDirectory())
			.map(item => item.name);
	} catch (error) {
		logError(error);
	}

	return [];
}

async function copySourceFiles(from: string, to: string) {
	console.log('Creating new sketch in %o', to);

	try {
		fs.mkdirSync(to);

		let source: string;
		let target: string;

		/** @todo get outDir from vite.config.ts if from.includes(dirname.sketches) */
		const promised = fs.readdirSync(from)
			.filter((item): item is string => typeof item === 'string')
			.filter(item => !/^node_module|^dist|^\.vite/.test(item))
			.map(item => {
				source = np.resolve(from, item);
				target = np.resolve(to, item);
				return fp.cp(source, target, { recursive: true });
			});

		await Promise.all(promised);

		console.log('✅ Done');
	} catch (error) {
		logError(error);
		console.log('❌ Failed');
	}
}

function updatePackageJson(absDirPath: string) {
	const path = np.join(absDirPath, 'package.json');
	const pkg = parseJson(path);

	let name = np.basename(absDirPath).replace(rx.isoDate, '').slice(1);

	/** @todo it could also be possible to get and set <root><package.json>.workspaces explicitely */
	if (getPackageNames().includes(name)) {
		const fallback = name + 'x';
		console.warn('Project name %o is already used. Renaming Project to %o', name, fallback);
		console.warn('Consider to rename the project manually');
		name = fallback;
	}

	const data = Object.assign(pkg, { name });

	writeJson(path, data);
}

function getPackageNames() {
	return getFolders(dirname.sketches)
		.map(dir => np.resolve('./', dirname.sketches, dir, 'package.json'))
		.filter(path => fs.existsSync(path))
		.map(path => parseJson(path).name);
}
