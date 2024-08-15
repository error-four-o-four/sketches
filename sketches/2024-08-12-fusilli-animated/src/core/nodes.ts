import type {
	TilesMap,
	NodeHash,
} from "../types.js";

import type { NodesObserver } from "./observer.js";

import * as util from './utils.js';

export function createNodes(
	tiles: TilesMap,
	start: NodeHash,
	observer: NodesObserver,
) {
	const nodes: NodeHash[] = [start];
	const maxDepth = tiles.size * 4; // observer.unoccupied.size

	let depth = 0;
	let node: NodeHash | undefined = nodes[0];

	observer.setOccupied(node);

	while (depth < maxDepth) {
		node = getNextNode(tiles, nodes[nodes.length - 1]);

		if (!node || observer.isOccupied(node)) {
			break;
		}

		observer.setOccupied(node);
		nodes.push(node);

		if (start === node) {
			nodes.pop();
			return nodes;
		}

		depth += 1;

		if (depth === maxDepth) {
			console.warn('Hit max depth!');
		}
	}

	// walk backwards
	depth = 0;
	while (depth < maxDepth) {
		node = getPrevNode(tiles, nodes[0]);

		if (!node || observer.isOccupied(node)) {
			break;
		}

		observer.setOccupied(node);
		nodes.unshift(node);
		depth += 1;

		if (depth === maxDepth) {
			console.warn('Hit max depth!');
		}
	}

	return nodes;
}

// function getNodes(
// 	tiles: TilesMap,
// 	observer: NodeObserver,
// ) {
// 	const maxDepth = tiles.size * 4; // observer.unoccupied.size

// 	let nodes: NodeHash[] = [start];
// 	let node: NodeHash | undefined;
// 	let depth = 0;

// 	observer.setOccupied(start);

// 	// walk forwards
// 	while (depth < maxDepth) {
// 		node = getNextNode(tiles, nodes);

// 		if (!node || observer.isOccupied(node)) {
// 			break;
// 		}

// 		observer.setOccupied(start);
// 		nodes.push(node);

// 		if (start === node) {
// 			return nodes;
// 		}

// 		depth += 1;

// 		if (depth === maxDepth) {
// 			console.warn('Hit max depth!');
// 		}
// 	}

// 	// walk backwards
// 	depth = 0;
// 	while (depth < maxDepth) {
// 		node = getPrevNode(tiles, nodes, data.checked);

// 		if (!node || data.checked.has(node)) {
// 			break;
// 		}

// 		data.checked.add(node);
// 		nodes.unshift(node);
// 		depth += 1;

// 		if (depth === maxDepth) {
// 			console.warn('Hit max depth!');
// 		}
// 	}

// 	return nodes;
// }


function getNextNode(
	tiles: TilesMap,
	node: NodeHash,
): NodeHash | undefined {
	const [, col, row, edge, lane] = util.parseNodeHash(node);

	const nextEdge = util.getNextEdge(edge, lane);
	const [nextTileHash, nextTileProps] = util.getNextTile(tiles, col, row, nextEdge) ?? [];

	if (!nextTileHash || !nextTileProps) {
		return;
	}

	const nextLane = util.getLane(nextTileProps.lanes, nextEdge);
	return util.getNodeHash(nextTileHash, nextEdge, nextLane);
}

function getPrevNode(
	tiles: TilesMap,
	node: NodeHash,
) {
	const [, col, row, edge] = util.parseNodeHash(node);
	const [prevTileHash, prevTileProps] = util.getPrevTile(tiles, col, row, edge) ?? [];

	if (!prevTileHash || !prevTileProps) {
		return;
	}

	const [prevEdge, prevLane] = util.getPrevProps(prevTileProps, edge) ?? [];
	return util.getNodeHash(prevTileHash, prevEdge, prevLane);
}