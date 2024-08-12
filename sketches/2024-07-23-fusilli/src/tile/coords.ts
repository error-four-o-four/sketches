import { GRID } from "../config.js";
import type { Coords, Lane } from "../types.js";

const elt = document.getElementById('wrapper');

const w = elt?.clientHeight ?? window.innerHeight;
const h = elt?.clientWidth ?? window.innerWidth;

export const SIDE_LGTH = Math.floor(Math.min(w, h) / GRID.SIZE);

// const SIDE_LGTH = Math.floor(Math.min(window.innerWidth, window.innerHeight) / (0.5 * GRID.SIZE));
// export const SIDE_LGTH = 0.9 * Math.floor(Math.min(window.innerWidth, window.innerHeight) / GRID.SIZE);

export const TILE = {
	SIDE_LGTH: SIDE_LGTH,
	HALF_SIDE_LGTH: 0.5 * SIDE_LGTH,
};

export const LANE = {
	OFFSET: 0.3 * TILE.HALF_SIDE_LGTH,
	PADDING: 0.05 * TILE.HALF_SIDE_LGTH,
	RADIUS_SMALL: 0.325 * TILE.HALF_SIDE_LGTH,
	RADIUS_BIG: 0.5 * TILE.HALF_SIDE_LGTH,
	WEIGHT_THICK: Math.max(1.5, 0.35 * TILE.HALF_SIDE_LGTH),
	WEIGHT_THIN: Math.max(1, 0.175 * TILE.HALF_SIDE_LGTH)
};

const MATRIX: [number, number][] = [
	[1, 0],
	[0, 1],
	[-1, 0],
	[0, -1],
];

const BASE_COORDS = {
	// back
	B: [
		[
			-LANE.OFFSET,
			-TILE.HALF_SIDE_LGTH
		],
		[
			-LANE.OFFSET,
			-TILE.HALF_SIDE_LGTH + LANE.PADDING
		],
		[
			-LANE.OFFSET + LANE.RADIUS_SMALL,
			-TILE.HALF_SIDE_LGTH + LANE.PADDING
		],
		[
			-LANE.OFFSET + LANE.RADIUS_SMALL,
			-TILE.HALF_SIDE_LGTH + LANE.PADDING + LANE.RADIUS_SMALL
		],
		[
			LANE.OFFSET - LANE.RADIUS_SMALL,
			-TILE.HALF_SIDE_LGTH + LANE.PADDING + LANE.RADIUS_SMALL
		],
		[
			LANE.OFFSET - LANE.RADIUS_SMALL,
			-TILE.HALF_SIDE_LGTH + LANE.PADDING
		],
		[
			LANE.OFFSET,
			-TILE.HALF_SIDE_LGTH + LANE.PADDING
		],
		[
			LANE.OFFSET,
			-TILE.HALF_SIDE_LGTH
		],
	],
	// left
	L: [
		[
			-LANE.OFFSET,
			-TILE.HALF_SIDE_LGTH
		],
		[
			-LANE.OFFSET,
			-TILE.HALF_SIDE_LGTH + LANE.PADDING
		],
		[
			-LANE.OFFSET + LANE.RADIUS_BIG,
			-TILE.HALF_SIDE_LGTH + LANE.PADDING
		],
		[
			-LANE.OFFSET + LANE.RADIUS_BIG + Math.cos(0.75 * Math.PI) * LANE.RADIUS_BIG,
			-TILE.HALF_SIDE_LGTH + LANE.PADDING + Math.sin(0.75 * Math.PI) * LANE.RADIUS_BIG
		],
		[
			TILE.HALF_SIDE_LGTH - LANE.PADDING + Math.cos(0.75 * Math.PI) * LANE.RADIUS_BIG,
			LANE.OFFSET - LANE.RADIUS_BIG + Math.sin(0.75 * Math.PI) * LANE.RADIUS_BIG
		],
		[
			TILE.HALF_SIDE_LGTH - LANE.PADDING,
			LANE.OFFSET - LANE.RADIUS_BIG
		],
		[
			TILE.HALF_SIDE_LGTH - LANE.PADDING,
			LANE.OFFSET
		],
		[
			TILE.HALF_SIDE_LGTH,
			LANE.OFFSET
		],
	],
	// forward
	F: [
		[
			-LANE.OFFSET,
			-TILE.HALF_SIDE_LGTH
		],
		[
			-LANE.OFFSET,
			TILE.HALF_SIDE_LGTH
		],
	],
	// right
	R: [
		[
			-LANE.OFFSET,
			-TILE.HALF_SIDE_LGTH
		],
		[
			-LANE.OFFSET,
			-TILE.HALF_SIDE_LGTH + LANE.PADDING
		],
		[
			-LANE.OFFSET - LANE.RADIUS_SMALL,
			-TILE.HALF_SIDE_LGTH + LANE.PADDING
		],
		[
			-LANE.OFFSET - LANE.RADIUS_SMALL + Math.cos(0.25 * Math.PI) * LANE.RADIUS_SMALL,
			-TILE.HALF_SIDE_LGTH + LANE.PADDING + Math.sin(0.25 * Math.PI) * LANE.RADIUS_SMALL
		],
		[
			-TILE.HALF_SIDE_LGTH + LANE.PADDING + Math.cos(0.25 * Math.PI) * LANE.RADIUS_SMALL,
			-LANE.OFFSET - LANE.RADIUS_SMALL + Math.sin(0.25 * Math.PI) * LANE.RADIUS_SMALL
		],
		[
			-TILE.HALF_SIDE_LGTH + LANE.PADDING,
			-LANE.OFFSET - LANE.RADIUS_SMALL
		],
		[
			-TILE.HALF_SIDE_LGTH + LANE.PADDING,
			-LANE.OFFSET
		],
		[
			-TILE.HALF_SIDE_LGTH,
			-LANE.OFFSET
		],
	],
} as Record<Lane, Coords[]>;

const BASE_ANGLES = {
	B: [0.5 * Math.PI, Math.PI, 0, 0.5 * Math.PI],
	L: [0.75 * Math.PI, Math.PI, 0.5 * Math.PI, 0.75 * Math.PI],
	F: [0, 0, 0, 0],
	R: [0, 0.25 * Math.PI, 0.25 * Math.PI, 0.5 * Math.PI],
} as Record<Lane, [number, number, number, number]>;

export const COORDS = Object.fromEntries(
	(Object.keys(BASE_COORDS) as Lane[]).map(
		type => [type, laneCoordsToCoordsArray(BASE_COORDS[type])]
	)
) as Record<Lane, Coords[][]>;

export const ANGLES = Object.fromEntries(
	(Object.keys(BASE_COORDS) as Lane[]).map(
		type => [type, laneAnglesToAnglesArray(BASE_ANGLES[type])]
	)
) as Record<Lane, [number, number, number, number][]>;

function rotate(x: number, y: number, rotation: number): Coords {
	const matrix = MATRIX[rotation];
	return [
		x * matrix[0] - y * matrix[1],
		x * matrix[1] + y * matrix[0]
	];
}

function laneCoordsToCoordsArray(array: Coords[]) {
	return Array.from(
		{ length: 4 },
		(_, i) => array.map(coords => rotate(...coords, i))
	);
}

function laneAnglesToAnglesArray(array: [number, number, number, number]) {
	return Array.from(
		{ length: 4 },
		(_, i) => array.map(angle => angle + i * 0.5 * Math.PI)
	);
}

export function getPositionCoords(
	col: number,
	row: number
): [number, number] {
	return [
		col * TILE.SIDE_LGTH,
		row * TILE.SIDE_LGTH,
	];
}

export function getCenterCoords(
	col: number,
	row: number
): [number, number] {
	return [
		col * TILE.SIDE_LGTH + TILE.HALF_SIDE_LGTH,
		row * TILE.SIDE_LGTH + TILE.HALF_SIDE_LGTH,
	];
}

// export function getLaneStartCoords(
// 	edge: Edge,
// 	tile: TileProps
// ): Coords {
// 	const [x, y] = tile.position;

// 	if (edge === 'N') {
// 		return [
// 			x + LANE.OFFSET_LEFT,
// 			y
// 		];
// 	}

// 	if (edge === 'E') {
// 		return [
// 			x + TILE.SIDE_LGTH,
// 			y + LANE.OFFSET_LEFT
// 		];
// 	}

// 	if (edge === 'S') {
// 		return [
// 			x + LANE.OFFSET_RIGHT,
// 			y + TILE.SIDE_LGTH
// 		];
// 	}

// 	return [
// 		x,
// 		y + LANE.OFFSET_RIGHT,
// 	];
// }

// export function getLaneEndCoords(
// 	edge: Edge,
// 	type: Lane,
// 	tile: TileProps,
// ): [number, number] {
// 	const [x, y] = tile.position;

// 	const steps: Lane[] = ['B', 'L', 'F', 'R'];
// 	const index = (EDGES.indexOf(edge) + steps.indexOf(type)) % EDGES.length;
// 	const next = EDGES[index];

// 	if (next === 'N') {
// 		return [
// 			x + LANE.OFFSET_RIGHT,
// 			y,
// 		];
// 	}

// 	if (next === 'E') {
// 		return [
// 			x + TILE.SIDE_LGTH,
// 			y + LANE.OFFSET_RIGHT
// 		];
// 	}

// 	if (next === 'S') {
// 		return [
// 			x + LANE.OFFSET_LEFT,
// 			y + TILE.SIDE_LGTH
// 		];
// 	}

// 	return [
// 		x,
// 		y + LANE.OFFSET_LEFT,
// 	];
// }