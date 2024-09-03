export function sanitizeFilename(name: string) {
	return name.replace(/[^a-z0-9]/gi, '_').slice(0, 64);
}

export function assertNotNull(value: unknown): asserts value is NonNullable<typeof value> {
	if (value === null) throw new Error('Something went wrong ...');
}

export function isInstanceOf<T>(elt: unknown, expected: new () => T): elt is T {
	return !!elt && elt instanceof expected;
}

export function assertInstanceOf<T>(element: unknown, expected: new () => T): asserts element is T {
	if (!element || !(element instanceof expected)) {
		const received = !element ? 'null' : element.constructor.name;
		throw new Error(`Expected element to be a ${expected.name}, but was ${received}`);
	}
}

export async function delay(ms: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
