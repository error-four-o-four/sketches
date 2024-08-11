#!/usr/bin/env node

import np from 'node:path';
import { parseArgs } from 'node:util';

import { LibHandler } from '@internal/cdn';

const path = np.resolve('./public');
const libs = new LibHandler(path);

(async () => {
	const { positionals } = parseArgs({
		args: process.argv.slice(2),
		strict: false,
		allowPositionals: true,
	});

	let [name, version] = parseValues(positionals);

	if (!name) {
		console.log('Please provide a valid library name');
		console.log('e.g. %o, %o or %o', 'p5.js', 'p5.js@1.10.0', 'p5.js 1.9.1');
		process.exit(1);
	}

	libs.fetch(name, version);

	console.log('✅ Done');
})();

function parseValues(args: string[]): [string | null, string | null] {
	if (args.length === 0 || !args[0]) {
		return [null, null];
	}

	if (args[0].includes('@')) {
		const [name, version] = args[0].split('@');
		return [name, validateVersion(version)];
	}

	const version = args[1] ? validateVersion(args[1]) : null;
	return [args[0], version];
}

function validateVersion(version: string) {
	/** @todo force fetch */
	// if (version === 'latest') return version

	const rx = /^\d+\.\d+\.\d+$/;

	// if (rx.test(version)) return version as Semver;
	if (rx.test(version)) return version;

	console.log('%o is not a valid version', version);
	return null;
}
