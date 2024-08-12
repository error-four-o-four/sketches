export const log = createLogger();

export function createLogger() {
	let prev = Date.now();
	let delta = 0;

	const logger = (msg: string) => {
		const time = Date.now();
		delta = time - prev;
		prev = time;

		console.log(`${msg} +${delta}ms`);
	};

	logger.reset = () => prev = Date.now();

	return logger;
}