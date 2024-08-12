import type {
	Coords,
	Edge,
	Lane,
	TileHash,
	CheckedNodeHash,
	ProcessedNodeHash,
	TileProps,
} from "../types.js";

import { log } from "../logger.js";
import { EDGES, SEP, TILES } from "../config.js";
import { createTileProps } from "../tile/index.js";
import { Colors } from "../colors.js";

import * as util from './utils.js';

export class Grid {
	size: number;
	tiles: Map<TileHash, TileProps>;

	maxDepth: number;
	graphs: ProcessedNodeHash[][];

	parsed: ReturnType<typeof processNodes>['parsed'];
	colors: ReturnType<typeof processNodes>['colors'];

	constructor(s: number) {
		this.size = s;
		this.maxDepth = s * s * 4;
		this.tiles = createTiles(this);
		log('Created Grid');

		this.graphs = createNodes(this);
		log('Processed Grid');

		const { parsed, colors } = processNodes(this);
		this.parsed = parsed;
		this.colors = colors;
	}
}

function createTiles({ size }: Grid) {
	const tiles: Grid['tiles'] = new Map();

	let hash: TileHash;

	for (let row = 0; row < size; row += 1) {
		for (let col = 0; col < size; col += 1) {
			hash = `${col}.${row}`;
			tiles.set(hash, createTileProps(col, row));
		}
	}

	return tiles;
}

function createNodes({ tiles, maxDepth }: Grid): ProcessedNodeHash[][] {
	const checked: Set<CheckedNodeHash> = new Set();
	const pending: Map<CheckedNodeHash, ProcessedNodeHash[]> = new Map();
	const solved: ProcessedNodeHash[][] = [];

	for (const [tile, props] of tiles.entries()) {
		for (const edge of EDGES) {
			let hash: ProcessedNodeHash = util.createHash(
				tile,
				edge,
				util.getLaneType(props.lanes, edge)
			);

			if (checked.has(hash)) {
				continue;
			}

			let nodes: ProcessedNodeHash[] = [hash];
			let node: ProcessedNodeHash | undefined;
			let depth = 0;

			while (depth < maxDepth) {
				node = getNextNode(tiles, nodes, checked);

				if (!node) {
					break;
				}

				nodes.push(node);
				depth += 1;
			}

			if (depth === maxDepth) {
				console.warn('Hit max depth!');
			}

			const head = util.getHash(nodes[0]);
			const tail = util.getNextHash(nodes[nodes.length - 1]);

			if (head === tail) {
				solved.push(nodes);
				continue;
			}

			// const [col, row] = tile.split('.').map(val => parseInt(val));

			// if (
			// 	!tail.next && (
			// 		(edge === 'N' && row === 0) ||
			// 		(edge === 'E' && col === SIZE - 1) ||
			// 		(edge === 'S' && row === SIZE - 1) ||
			// 		(edge === 'W' && col === 0)
			// 	)
			// ) {
			// 	solved.push(nodes);
			// 	continue;
			// }

			if (!tail) {
				pending.set(head, nodes);
				continue;
			}

			if (pending.has(tail)) {
				nodes = [...nodes, ...(pending.get(tail) ?? [])];
				pending.delete(tail);
				pending.set(head, nodes);
				continue;
			}
		}
	}

	return [...solved, ...pending.values()];
}

function getNextNode(
	tiles: Grid['tiles'],
	nodes: ProcessedNodeHash[],
	checked: Set<CheckedNodeHash>,
): CheckedNodeHash | undefined {
	const node = nodes.at(-1);

	if (!node) {
		console.warn('Something went wrong');
		return;
	}

	const nodeHash = util.getHash(node);
	checked.add(nodeHash);

	const [tile, edge, lane] = util.parseHash(nodeHash);

	const nextEdge = util.getNextEdge(edge, lane);
	const nextTileHash = util.getNextTileHash(tile, nextEdge);

	if (!nextTileHash) {
		return;
	}

	const nextTile = tiles.get(nextTileHash);

	if (!nextTile) {
		return;
	}

	const nextLane = util.getLaneType(nextTile.lanes, nextEdge);
	const nextNodeHash = util.createHash(nextTileHash, nextEdge, nextLane);
	nodes[nodes.length - 1] = `${nodeHash}${SEP}${nextNodeHash}`;

	if (nextNodeHash === nodes[0].split(SEP)[0]) {
		return;
	}

	if (checked.has(nextNodeHash)) {
		return;
	}

	return nextNodeHash;
}

type ParsedEdgeData = {
	lane: Lane;
	color: string;
};

type BaseTileData = {
	coords: Coords;
	hasIntersections: boolean;
};

type PartialTileData = BaseTileData & {
	edges: Partial<Record<Edge, ParsedEdgeData>>;
};

type ParsedTileData = BaseTileData & {
	edges: Record<Edge, ParsedEdgeData>;
};

function processNodes({ tiles, graphs }: Grid) {
	// parse lanes with colors for each tile
	// const output: Map<TileHash, ParsedTileData> = new Map();

	const pending: Map<TileHash, PartialTileData> = new Map();
	const parsed: Map<TileHash, ParsedTileData> = new Map();
	const colors = new Colors(graphs);

	graphs.forEach((nodes, i) => {
		// they will be instantiated in setup
		const color = colors.process(nodes);

		for (const node of nodes) {
			const [hash, edge, lane] = util.parseHash(node);
			const tile = tiles.get(hash);

			if (!tile) {
				console.warn('Could not get tile %o', hash);
				continue;
			}

			const data: PartialTileData = pending.get(hash) ?? {
				coords: tile.center,
				edges: {},
				hasIntersections: TILES[tile.type].hasIntersections
			};

			if (edge in data.edges) {
				console.warn('Möhp');
			}

			data.edges[edge] = { lane, color };

			const edges = Object.keys(data.edges) as Edge[];

			if (
				edges.length === 4 &&
				EDGES.every(edge => edges.includes(edge))
			) {
				parsed.set(hash, data as ParsedTileData);
				pending.delete(hash);
				continue;
			}

			pending.set(hash, data);
		}
	});

	return { parsed, colors: colors.data };
}