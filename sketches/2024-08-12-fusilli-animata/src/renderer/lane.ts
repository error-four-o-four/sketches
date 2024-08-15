import type { Coords, Lane, P5 } from "../types.js";
import { TILE, LANES } from "../config.js";

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


// these apply to a lane which is not rotated
// and starts at the northern edge of a tile

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

// precalculate coords for each type of lane
// and rotation

const COORDS = Object.fromEntries(
	(Object.keys(BASE_COORDS) as Lane[]).map(
		type => [type, laneCoordsToCoordsArray(BASE_COORDS[type])]
	)
) as Record<Lane, Coords[][]>;

const ANGLES = Object.fromEntries(
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

// access precalculated coords

export const LaneRenderer: Record<
	Lane,
	(
		p: P5,
		// center of tile
		cx: number,
		cy: number,
		// index of the edge from which the lane originates
		rotation: number
	) => void
> = {
	B(p, x, y, rotation) {
		const type: (typeof LANES)[number] = 'B';
		const coords = getCoords(type, x, y, rotation);
		const angles = ANGLES[type][rotation];

		p.line(...coords[0], ...coords[1]);
		p.arc(...coords[2], LANE.RADIUS_SMALL, LANE.RADIUS_SMALL, angles[0], angles[1]);
		p.line(...coords[3], ...coords[4]);
		p.arc(...coords[5], LANE.RADIUS_SMALL, LANE.RADIUS_SMALL, angles[2], angles[3]);
		p.line(...coords[6], ...coords[7]);
	},
	L(p, x, y, rotation) {
		const type: (typeof LANES)[number] = 'L';
		const coords = getCoords(type, x, y, rotation);
		const angles = ANGLES[type][rotation];

		p.line(...coords[0], ...coords[1]);
		p.arc(...coords[2], LANE.RADIUS_BIG, LANE.RADIUS_BIG, angles[0], angles[1]);
		p.line(...coords[3], ...coords[4]);
		p.arc(...coords[5], LANE.RADIUS_BIG, LANE.RADIUS_BIG, angles[2], angles[3]);
		p.line(...coords[6], ...coords[7]);
	},
	F(p, x, y, rotation) {
		const type: (typeof LANES)[number] = 'F';
		const coords = getCoords(type, x, y, rotation);
		p.line(...coords[0], ...coords[1]);
	},
	R(p, x, y, rotation) {
		const type: (typeof LANES)[number] = 'R';
		const coords = getCoords(type, x, y, rotation);
		const angles = ANGLES[type][rotation];

		p.line(...coords[0], ...coords[1]);
		p.arc(...coords[2], LANE.RADIUS_SMALL, LANE.RADIUS_SMALL, angles[0], angles[1]);
		p.line(...coords[3], ...coords[4]);
		p.arc(...coords[5], LANE.RADIUS_SMALL, LANE.RADIUS_SMALL, angles[2], angles[3]);
		p.line(...coords[6], ...coords[7]);
	},
};

function getCoords(
	type: (typeof LANES)[number],
	x: number,
	y: number,
	rotation: number,
) {
	return COORDS[type][rotation].map(values => [x + values[0], y + values[1]] as [number, number]);
}