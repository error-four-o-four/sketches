export const filename = 'libs.json';

export const url = {
	base: 'https://cdnjs.cloudflare.com/ajax/libs',
	api: 'https://api.cdnjs.com/libraries',
} as const;

export const fields = {
	initial: ['name', 'version', 'filename', 'sri'],
	version: ['name', 'sri'],
} as const;
