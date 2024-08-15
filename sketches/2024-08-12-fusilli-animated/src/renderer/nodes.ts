import type { Color } from "p5";

import type {
	Edge,
	Lane,
	TilesMap,
	TileHash,
	TileProps,
	NodeHash,
	P5,
} from "../types.js";

import { getIndexOfEdge, parseNodeHash } from "../core/utils.js";

import { LANE, laneRenderer } from "./lane.js";

const { WEIGHT_THICK, WEIGHT_THIN } = LANE;


type RendererProps = {
	lane: Lane,
	x: number,
	y: number,
	rotation: number;
};


export class NodesRenderer {
	parsed: RendererProps[];
	step: number;
	done: boolean;

	constructor(tiles: TilesMap, nodes: NodeHash[]) {
		this.parsed = [];
		this.step = 1;
		this.done = false;

		let hash: TileHash;
		let props: TileProps | undefined;
		let edge: Edge;
		let lane: Lane;
		let x: number;
		let y: number;
		let rotation: number;

		nodes.forEach(node => {
			[hash, , , edge, lane] = parseNodeHash(node);
			props = tiles.get(hash);

			if (props) {
				[x, y] = props.center;
				rotation = getIndexOfEdge(edge);
				this.parsed.push({
					lane,
					x,
					y,
					rotation
				});
			};
		});
	}

	draw(p: P5, bg: Color) {
		const ii = Math.min(this.step, this.parsed.length);

		for (let i = 0; i < ii; i += 1) {
			// const t = Math.max(0.5 * i / this.step);
			const t = i / this.step;
			const { lane, x, y, rotation } = this.parsed[i];

			p.stroke(bg);
			p.strokeWeight(WEIGHT_THICK);
			p.strokeCap(p.SQUARE);
			laneRenderer[lane](p, x, y, rotation);

			p.strokeWeight(WEIGHT_THIN);
			p.strokeCap(p.ROUND);
			p.stroke(104 + 151 * t);
			// ctx.stroke(255);
			laneRenderer[lane](p, x, y, rotation);
		}

		this.step += 1;
	}
}