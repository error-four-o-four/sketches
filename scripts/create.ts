import fs, { promises as fp } from 'node:fs';
import { resolve } from 'node:path';

import { createLogger, getFlagValue } from './util.js';

const log = createLogger();
const { name, dir } = parseFlags();

log('Creating new sketch in %o', dir.target);

try {
	fs.mkdirSync(dir.target);
	fs.mkdirSync(dir.main);

	let source: string;
	let target: string;

	const promised = fs.readdirSync(dir.source)
		.filter((item): item is string => typeof item === 'string')
		.filter(item => !/^node_module|^dist|^\.vite/.test(item))
		.map(item => {
			source = resolve(dir.source, item);
			target = resolve(dir.target, item);
			return fp.cp(source, target, { recursive: true });
		});

	await Promise.all(promised);

	updateSketchPkgJson(dir.target);

	log('✅ Done');
} catch (error) {
	log('❌ Failed \n%o', error);
}

function parseFlags() {
	const flags = getAllFlags();

	if (!flags.target) {
		// npm 7+, extra double-dash is needed !!!
		log("Please submit a name to create a new sketch. E.g. '-- foo' or '-- --name foo'");
		process.exit(1);
	}

	const target = resolve(`sketches/${new Date().toISOString().split('T')[0]}-${flags.target}`);

	if (fs.existsSync(target)) {
		log('Sketch %o already exists %o', flags.target, target);
		process.exit(1);
	}

	/** @todo parse & doublecheck workspace pkg names */

	const source = flags.source
		? resolve(`sketches/${flags.source}`)
		: resolve(`sketches/template`);

	if (!fs.existsSync(source)) {
		log('Could not find any source files in %o', source);
		process.exit(1);
	}

	const main = resolve(target, 'src');

	return {
		name: flags.target,
		dir: {
			source,
			target,
			main
		}
	};
}

function getAllFlags() {
	const target = !process.argv[2].startsWith('--') ? process.argv[2] : getFlagValue('--name');
	const source = getFlagValue('--from');

	return {
		target,
		source
	};
}

function updateSketchPkgJson(dir: string) {
	const path = resolve(dir, 'package.json');
	const input = parseJson(path);
	input.name = name;

	// sort by order
	const output = [
		'name',
		'type',
		'version',
		'author',
		'license',
		'scripts'
	].reduce((all, key) => ({
		...all,
		[key]: input[key]
	}), {});

	writeJson(path, output);
}

function parseJson(path: string) {
	try {
		const file = fs.readFileSync(path, 'utf-8');
		return JSON.parse(file);
	} catch (error) {
		log('Failed to read %o', path);
	}

	return null;
}

function writeJson(path: string, data: unknown) {
	fs.writeFileSync(path, JSON.stringify(data, null, 2));
}