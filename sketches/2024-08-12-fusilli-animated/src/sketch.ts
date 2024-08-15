import type { Color } from "p5";
import type { P5, NodeHash } from "./types.js";

import { GRID, TILE } from "./config.js";
import { createTiles } from "./core/tiles.js";
import { createNodes } from "./core/nodes.js";
import { NodesObserver } from "./core/observer.js";
import { NodesRenderer } from "./renderer/nodes.js";

const { SIZE } = GRID;
const { SIDE_LGTH } = TILE;

const maxFrames = 640;

let tiles = createTiles(SIZE);
let observer = new NodesObserver();

let graphs: NodeHash[][] = [];
let renderers: NodesRenderer[] = [];

let background: Color;

export const sketch = (p: P5) => {
	p.setup = () => {
		p.createCanvas(SIZE * SIDE_LGTH, SIZE * SIDE_LGTH);
		p.ellipseMode(p.RADIUS);
		p.background(background = p.color('hsl(0, 0%, 10%)'));
		// p.frameRate(10);

		// p.saveGif(Date.now().toString(), frames, { units: 'frames' });
	};

	p.draw = () => {
		p.background(background);
		// const hsl = `hsl(${p.frameCount % 360}, 20%, 10%)`;
		// p.background(hsl);
		// drawCheckboard(p);
		const start = observer.done ? undefined : observer.getNextUnoccupied(tiles);

		if (start) {
			const nodes = createNodes(tiles, start, observer);
			graphs.push(nodes);

			const renderer = new NodesRenderer(tiles, nodes);
			renderers.push(renderer);
		}

		if (observer.done && p.frameCount > maxFrames) {
			p.noLoop();
			console.log('Done', p.frameCount);
		}

		p.noFill();
		renderers.forEach(r => r.draw(p, background));
	};

	p.mouseClicked = (e) => {
		if (p.isLooping()) {
			p.noLoop();
		} else {
			p.loop();
		}

		// 	if (e instanceof UIEvent && e.target instanceof HTMLCanvasElement) {
		// 		setTimeout(() => {
		// 			grid = new Grid(SIZE);
		// 			colors = createColors(p, grid.colors);
		// 			p.redraw(1);

		// 		}, 300);
		// 	}
	};
};

// function createColors(p: P5, input: Set<string>) {
// 	return {
// 		background: p.color(17),
// 		...[...input].reduce((all, color) => ({
// 			...all,
// 			[color]: p.color(color)
// 		}), {})
// 	} as Record<string, Color>;
// }

// function drawCheckboard(p: P5) {
// 	let x: number;
// 	let y: number;

// 	p.background('#333');
// 	p.noStroke();
// 	p.fill('#0003');

// 	for (let j = 0; j < SIZE; j += 1) {
// 		for (let i = 0; i < SIZE; i += 1) {
// 			if (
// 				(i % 2 === 0 && j % 2 === 0) ||
// 				(i % 2 === 1 && j % 2 === 1)
// 			) {
// 				x = i * SIDE_LGTH;
// 				y = j * SIDE_LGTH;
// 				p.rect(x, y, SIDE_LGTH, SIDE_LGTH);
// 			}
// 		}
// 	}
// }

// function drawNodes(p: P5, data: Grid) {
// 	const bg = colors.background;

// 	let x: number;
// 	let y: number;

// 	p.noFill();
// 	p.strokeWeight(Math.max(1, 0.1 * SIDE_LGTH));

// 	const tiles = [...data.parsed.values()];
// 	tiles.forEach((tile, j) => {
// 		[x, y] = tile.coords;

// 		// order matters
// 		(['N', 'E', 'S', 'W'] as Edge[]).forEach((edge, rotation) => {
// 			const { lane, color } = tile.edges[edge];

// 			if (tile.hasIntersections) {
// 				p.stroke(bg);
// 				p.strokeWeight(WEIGHT_THICK);
// 				p.strokeCap(p.SQUARE);
// 				renderer[lane](p, x, y, rotation);

// 				// 	p.erase();
// 				// 	p.strokeWeight(WEIGHT_THICK);
// 				// 	p.strokeCap(p.SQUARE);
// 				// 	renderer[lane](p, x, y, rotation);
// 				// 	p.noErase();
// 			}

// 			p.stroke(color);
// 			p.strokeWeight(WEIGHT_THIN);
// 			p.strokeCap(p.ROUND);
// 			renderer[lane](p, x, y, rotation);
// 		});
// 	});
// }