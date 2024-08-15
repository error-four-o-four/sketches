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

import { FADE_TRANSITION_LGTH, MIN_LIFETIME, MAX_LIFETIME } from "../config.js";
import { getIndexOfEdge, parseNodeHash } from "../core/utils.js";

import { LANE, LaneRenderer } from "./lane.js";

const { WEIGHT_THICK, WEIGHT_THIN } = LANE;

type RendererProps = {
	lane: Lane,
	x: number,
	y: number,
	rotation: number;
};

export class NodesRenderer {
	static hue_offset: number;
	static hue_delta: number;
	static sat_min: number;
	static sat_delta: number;
	static lgt_min: number;
	static lgt_delta: number;

	static shuffleColorValues() {
		const pick = <T>(array: T[]) => array[Math.floor(Math.random() * array.length)];

		this.hue_offset = pick([0, 60, 120, 180, 240, 300]);
		this.hue_delta = pick([60, 120, 180]);

		this.sat_min = 25;
		this.sat_delta = 50;

		this.lgt_min = 20;
		this.lgt_delta = 40;
	}

	static createColors(p: P5, bg: Color, nodes: NodeHash[]): Color[] {
		/** @todo */
		const hue = Math.floor((this.hue_offset + this.hue_delta * Math.random()) % 360);
		const sat = this.sat_min + this.sat_delta * Math.random();
		const lgt = this.lgt_min + Math.min(this.lgt_delta, 2 * nodes.length);

		const a = p.color(`hsl(${hue}, 100%, 100%)`);
		const b = p.color(`hsl(${hue}, ${sat}%, ${lgt}%)`);

		const colors: Color[] = [];
		let t: number;

		for (let i = 0; i < FADE_TRANSITION_LGTH; i += 1) {
			t = i / (FADE_TRANSITION_LGTH - 1);
			colors.push(p.lerpColor(a, b, t));
		}

		for (let i = 0; i < FADE_TRANSITION_LGTH; i += 1) {
			t = i / (FADE_TRANSITION_LGTH - 1);
			colors.push(p.lerpColor(b, bg, t));
		}

		return colors;
	}

	parsed: RendererProps[];
	colors: Color[];

	birthtime: number;
	lifetime: number;
	duration: number;
	done: boolean;

	constructor(p: P5, bg: Color, tiles: TilesMap, nodes: NodeHash[]) {
		this.parsed = [];

		this.birthtime = p.frameCount;
		this.lifetime = 0;
		this.duration = Math.max(MIN_LIFETIME, Math.min(MAX_LIFETIME, nodes.length + FADE_TRANSITION_LGTH));
		this.done = false;

		this.colors = NodesRenderer.createColors(p, bg, nodes);

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
		this.lifetime = p.frameCount - this.birthtime;

		if (this.lifetime === 0 || this.done === true) return;

		if (this.lifetime - this.duration - this.parsed.length - 2 * FADE_TRANSITION_LGTH > 0) {
			console.log('Done');
			this.done = true;
			return;
		}

		const ii = Math.min(this.lifetime, this.parsed.length);

		let index: number;
		let color: Color;

		for (let i = 0; i < ii; i += 1) {
			if (this.lifetime - this.duration - i - 2 * FADE_TRANSITION_LGTH > 0) continue;

			const { lane, x, y, rotation } = this.parsed[i];

			index = this.lifetime < this.duration
				? Math.max(0, Math.min(FADE_TRANSITION_LGTH - 1, this.lifetime - i))
				: Math.max(FADE_TRANSITION_LGTH, Math.min(this.colors.length - 1, this.lifetime - this.duration - i));

			color = this.colors[index];

			p.stroke(bg);
			p.strokeWeight(WEIGHT_THICK);
			p.strokeCap(p.SQUARE);
			LaneRenderer[lane](p, x, y, rotation);

			p.strokeWeight(WEIGHT_THIN);
			p.strokeCap(p.ROUND);
			p.stroke(color);
			LaneRenderer[lane](p, x, y, rotation);
		}
	}
}