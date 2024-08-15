import type {
	TilesMap,
	TileHash,
	NodeHash,
} from "../types";

import { TILES_AMOUNT, EDGES } from "../config";
import * as util from './utils.js';

export class NodesObserver {
	occupied: Set<NodeHash>;
	col: number;
	row: number;
	edge: number;
	done: boolean;

	constructor() {
		this.occupied = new Set();
		this.col = 0;
		this.row = 0;
		this.edge = 0;
		this.done = false;
	}

	private iterate() {
		this.edge += 1;
		this.edge %= EDGES.length;

		if (this.edge === 0) {
			this.col += 1;
			this.col %= TILES_AMOUNT;
		}

		if (this.edge === 0 && this.col === 0) {
			this.row += 1;
		}

		if (this.row === TILES_AMOUNT) {
			this.done = true;
		}
	}

	private getNextPossible(tiles: TilesMap) {
		const hash: TileHash = `${this.col}.${this.row}`;
		const props = tiles.get(hash);

		if (!props) {
			this.done = true;
			return;
		}

		const edge = util.getEdgeFromIndex(this.edge);
		const lane = util.getAssertedLane(props.lanes, edge);
		return util.getNodeHash(hash, edge, lane);
	}

	isOccupied(node: NodeHash) {
		return this.occupied.has(node);
	}

	/** @todo implement different methods e.g. randomize (?) */
	// use different genrators/iterators
	getNextUnoccupied(tiles: TilesMap): NodeHash | undefined {
		let node = this.getNextPossible(tiles);

		while (node && this.isOccupied(node)) {
			this.iterate();
			node = this.getNextPossible(tiles);
		}

		if (!node) {
			this.done = true;
		}

		return node;
	}

	setOccupied(value: NodeHash) {
		this.occupied.add(value);
	}
}

// export class NodeObserver {
// 	unoccupied: Set<NodeHash>;
// 	iterator: IterableIterator<NodeHash>;
// 	done: boolean;

// 	constructor(tiles: TilesMap) {
// 		this.unoccupied = new Set();
// 		for (const [hash, props] of tiles.entries()) {
// 			for (let i = 0; i <= EDGES.length; i += 1) {
// 				const edge = EDGES[i];
// 				const lane = util.getAssertedLane(props.lanes, edge);
// 				const node = util.getNodeHash(hash, edge, lane);
// 				this.unoccupied.add(node);
// 			}
// 		}
// 		this.iterator = this.unoccupied.values();
// 		this.done = false;
// 	}

// 	isOccupied(node: NodeHash) {
// 		return !this.unoccupied.has(node);
// 	}

// 	// isUnoccupied(node: NodeHash) {
// 	// 	return this.unoccupied.has(node);
// 	// }

// 	/** @todo implement different methods e.g. randomize (?) */
// 	// use different genrators/iterators
// 	getNextUnoccupied(): NodeHash | undefined {
// 		console.log(this.unoccupied.size);

// 		let value: NodeHash | undefined = this.iterator.next().value;

// 		while (value && this.isOccupied(value)) {
// 			value = this.iterator.next().value;

// 			if (!value) {
// 				break;
// 			}
// 		}

// 		if (value) {
// 			this.unoccupied.delete(value);
// 			return value;
// 		}

// 		this.done = true;
// 		return;
// 	}

// 	setOccupied(value: NodeHash) {
// 		this.unoccupied.delete(value);
// 	}
// }