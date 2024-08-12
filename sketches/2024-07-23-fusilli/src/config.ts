import type { Tile } from "./types.js";

export const SEP = '#';

export const GRID = {
	SIZE: 32,

	// COL: 0
	// ROW: 0
};

export const EDGES = [
	'N',
	'E',
	'S',
	'W'
] as const;

export const LANES = [
	'B', // 'loop back',
	'L', // 'left',
	'F', // 'forward line',
	'R', // 'right'
] as const;

export const TILES: Record<Tile, ConfigProps> = {
	FFFF: {
		weight: 4,
		hasIntersections: true,
	},
	LLLL: {
		weight: 2,
		hasIntersections: true,
	},
	BBBB: {
		weight: 2,
		hasIntersections: false,
	},
	RRRR: {
		weight: 2,
		hasIntersections: false,
	},
	BFBF: {
		weight: 4,
		hasIntersections: false,
	},
	LRLR: {
		weight: 6,
		hasIntersections: false,
	},
	LFBL: {
		weight: 8,
		hasIntersections: true,
	},
	BFRR: {
		weight: 8,
		hasIntersections: false,
	},
	BLRB: {
		weight: 8,
		hasIntersections: false,
	},
	FFRL: {
		weight: 8,
		hasIntersections: true,
	}
} as const;

const re = new RegExp(`[${LANES.join('')}]{4,}`);

Object.keys(TILES).forEach((key) => {
	if (!re.test(key)) {
		throw new TypeError('Nope');
	}
});

type ConfigProps = {
	weight: number;
	hasIntersections: boolean;
};