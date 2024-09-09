import type { TileType } from "./types.js";

const wrapper = document.getElementById('wrapper')!;

export const CANVAS_SIZE = Math.min(wrapper.clientWidth, wrapper.clientHeight);
// export const CANVAS_SIZE = Math.min(window.innerWidth, window.innerHeight);
// export const CANVAS_SIZE = 720;

// amount per edge
export const TILES_AMOUNT = 16;
// COL: 0
// ROW: 0

export const MIN_LIFETIME = 180;
export const MAX_LIFETIME = 300;
export const FADE_TRANSITION_LGTH = 16;

const SIDE_LGTH = Math.floor(CANVAS_SIZE / TILES_AMOUNT);

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