import type { TileType } from "./types.js";

export const GRID = {
	SIZE: 24,

	// COL: 0
	// ROW: 0
};

// const CANVAS_SIZE = Math.min(window.innerWidth, window.innerHeight);
const CANVAS_SIZE = 640;

// const SIDE_LGTH = Math.floor(Math.min(window.innerWidth, window.innerHeight) / (0.5 * GRID.SIZE));
const SIDE_LGTH = Math.floor(CANVAS_SIZE / GRID.SIZE);

export const TILE = {
	SIDE_LGTH: SIDE_LGTH,
	HALF_SIDE_LGTH: 0.5 * SIDE_LGTH,
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

export const TILES: Record<TileType, ConfigProps> = {
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