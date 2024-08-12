import { GRID, EDGES, SEP } from "../config.js";
import type {
	Edge,
	Lane,
	Lanes,
	TileHash,
	CheckedNodeHash,
	ProcessedNodeHash,
} from "../types.js";

export function createHash(
	hash: TileHash,
	edge: Edge,
	lane: Lane
): CheckedNodeHash {
	return `${hash}${edge}${lane}`;
}

export function parseHash(
	input: ProcessedNodeHash
) {
	const hash = getHash(input);
	const tile = hash.slice(0, -2);
	return [
		tile,
		...hash.slice(-2).split('')
	] as [
			TileHash,
			Edge,
			Lane
		];
}

export function getHash(hash: ProcessedNodeHash) {
	return (hash.includes(SEP) ? hash.split(SEP)[0] : hash) as CheckedNodeHash;
}

export function getNextHash(hash: ProcessedNodeHash) {
	return hash.split(SEP)[1] as CheckedNodeHash ?? null;
}

export function getLaneType(
	type: Lanes,
	edge: Edge,
): Lane {
	const laneTypeIndex = EDGES.indexOf(edge);
	return type.charAt(laneTypeIndex) as Lane;
}

export function getNextEdge(
	current: Edge,
	type: Lane
): Edge {
	if (type === 'F') {
		return current;
	}

	// order matters!
	// add index of type to edge index
	const steps: Lane[] = ['F', 'R', 'B', 'L'];
	const index = (EDGES.indexOf(current) + steps.indexOf(type)) % EDGES.length;
	return EDGES[index];
}

export function getNextTileHash(
	tile: TileHash,
	next: Edge
): TileHash | undefined {
	let [col, row] = tile.split('.').map(val => parseInt(val));

	// next edge is relative to current tile
	switch (next) {
		case 'N':
			row += 1;
			break;

		case 'E':
			col -= 1;
			break;

		case 'S':
			row -= 1;
			break;

		case 'W':
			col += 1;
			break;

		default:
			break;
	}

	if (col < 0 || row < 0 || col >= GRID.SIZE || row >= GRID.SIZE) {
		// console.log(col, row, col * row, TILE.AMOUNT ** 2);
		return;
	}
	return `${col}.${row}`;
}

export function map(n: number, a1: number, b1: number, a2: number, b2: number, withinBounds?: boolean) {
	const val = (n - a1) / (b1 - a1) * (b2 - a2) + a2;

	if (!withinBounds) {
		return val;
	}

	return (a2 < b2)
		? constrain(val, a2, b2)
		: constrain(val, b2, a2);
};

export function constrain(n: number, low: number, high: number) {
	return Math.max(Math.min(n, high), low);
};