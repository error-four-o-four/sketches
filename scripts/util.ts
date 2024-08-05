import { createLogger as createViteLogger } from 'vite';

export const customLogger = createViteLogger();

customLogger.info = (msg) => {
	if (msg.includes('building for production')) return;

	if (msg.includes('built in')) {
		console.log();
		return;
	};

	console.log(msg);
};

export function createLogger() {
	let prev = Date.now();
	let delta = 0;

	return (arg: string | unknown, ...args: unknown[]) => {
		const time = Date.now();
		delta = time - prev;
		prev = time;

		if (typeof arg === 'string') {
			console.log(`${arg} +${delta}ms`, ...args);
			return;
		}

		if (arg instanceof Error) {
			console.log(`${arg.message} +${delta}ms`);
			return;
		}

		console.log(arg, ...args, `+${delta}ms`);
	};
}

export function hasFlag(alias: string) {
	const index = process.argv.findIndex(flag => flag.startsWith(alias));

	return index !== -1;
}

export function getFlagValue(alias: string) {
	const index = process.argv.findIndex(flag => flag.startsWith(alias));

	if (index < 0) return null;

	const flag = process.argv[index];

	if (!flag) return null;

	const val = flag.includes('=') ? flag.split('=')[1] : process.argv[index + 1];

	return val.startsWith('--') ? null : val;
}

export function isObject(input: unknown): input is Record<string, unknown> {
	return !!input && typeof input === 'object' && !Array.isArray(input);
}