import type {
	Edge,
	Lane,
	Lanes,
	TilesMap,
	TileEntry,
	TileHash,
	NodeHash,
	TileProps,
} from "../types.js";

import {
	TILES_AMOUNT,
	EDGES,
	LANES
} from "../config.js";

export function getIndexOfEdge(edge: Edge) {
	return EDGES.indexOf(edge);
}

export function getEdgeFromIndex(index: number) {
	return EDGES[index];
}

// const [N, E, S, W] = EDGES;

// function assertEdge(value: string): asserts value is Edge {
// 	if (
// 		value === N ||
// 		value === E ||
// 		value === S ||
// 		value === W
// 	) {
// 		return;
// 	}

// 	throw new Error('Nope');
// }

// export function getAssertedEdgeFromIndex(index: number) {

// }

export function getNextEdge(
	edge: Edge,
	lane: Lane
): Edge {
	if (lane === 'F') {
		return edge;
	}

	// order matters!
	// add index of type to edge index
	const steps: Lane[] = ['F', 'R', 'B', 'L'];
	const index = (EDGES.indexOf(edge) + steps.indexOf(lane)) % EDGES.length;
	return EDGES[index];
}

// ####

const [B, L, F, R] = LANES;

export function assertLane(value: string): asserts value is Lane {
	if (
		value === B ||
		value === L ||
		value === F ||
		value === R
	) {
		return;
	}

	throw new Error('Nope');
}

export function isLane(value: string): value is Lane {
	if (
		value === B ||
		value === L ||
		value === F ||
		value === R
	) {
		return true;
	}

	return false;
}

export function getLane(lanes: Lanes, edge: Edge) {
	return lanes.charAt(getIndexOfEdge(edge)) as Lane;
}

export function getAssertedLane(lanes: Lanes, edge: Edge | number) {
	const lane = lanes.charAt(
		typeof edge === 'string'
			? getIndexOfEdge(edge)
			: edge
	);

	assertLane(lane);

	return lane;
}

// ##### NodeHash

export function getNodeHash(
	hash: TileHash,
	edge: Edge,
	lane: Lane
): NodeHash {
	return `${hash}${edge}${lane}`;
}

export function parseNodeHash(
	node: NodeHash
) {
	const tile = node.slice(0, -2);
	return [
		tile,
		...tile.split('.').map(val => parseInt(val)),
		...node.slice(-2).split('')
	] as [
			TileHash,
			number,
			number,
			Edge,
			Lane
		];
}

export function assertAndParseNodeHash(
	node: NodeHash | undefined
) {
	assertNonNullable(node);

	const tile = node.slice(0, -2);
	return [
		tile,
		...tile.split('.').map(val => parseInt(val)),
		...node.slice(-2).split('')
	] as [
			TileHash,
			number,
			number,
			Edge,
			Lane
		];
}

export function assertNonNullable(
	value: unknown,
	expected: string = 'value',
): asserts value is NonNullable<typeof value> {
	if (value === null || value === undefined) {
		throw new Error(`Expected ${expected} - Received ${value}`);
	}
}

// #####


export function getNextTile(
	tiles: TilesMap,
	col: number,
	row: number,
	nextEdge: Edge,
): TileEntry | undefined {
	const matrix = [
		[0, 1],
		[-1, 0],
		[0, -1],
		[1, 0]
	];

	const index = EDGES.indexOf(nextEdge);

	// unecessary ??
	if (index < 0) return;

	col += matrix[index][0];
	row += matrix[index][1];

	if (isOutOfBounds(col, row)) return;

	const nextHash: TileHash = `${col}.${row}`;
	const nextProps = tiles.get(nextHash);

	return !nextProps ? undefined : [nextHash, nextProps];
}



export function getPrevTile(
	tiles: TilesMap,
	col: number,
	row: number,
	edge: Edge
): TileEntry | undefined {
	const matrix = [
		[0, -1],
		[1, 0],
		[0, 1],
		[-1, 0]
	];

	const index = EDGES.indexOf(edge);

	if (index < 0) return;

	col += matrix[index][0];
	row += matrix[index][1];

	if (isOutOfBounds(col, row)) return;

	const prevHash: TileHash = `${col}.${row}`;
	const prevProps = tiles.get(prevHash);

	return !prevProps ? undefined : [prevHash, prevProps];
}

function isOutOfBounds(col: number, row: number) {
	return col < 0 || row < 0 || col >= TILES_AMOUNT || row >= TILES_AMOUNT;
}

// #####

export function getPrevProps(
	tile: TileProps,
	nextEdge: Edge
): [Edge, Lane] {
	const lanes = tile.lanes.split('') as Lane[];

	let edge: Edge;
	let lane: Lane;

	for (let i = 0; i < lanes.length; i += 1) {
		edge = EDGES[i];
		lane = lanes[i];

		const tileEdge = getNextEdge(edge, lanes[i]);
		if (tileEdge === nextEdge) {
			return [edge, lane];
		}
	}

	throw new Error('Nope!');

	// return null;
}