import { GRID, LANES } from "./config.js";
import { log } from "./logger.js";
import type { P5, Edge } from "./types.js";

import { Grid } from "./grid/index.js";

import { LANE, TILE } from "./tile/coords.js";
import { renderer } from "./tile/renderer.js";
import { Color } from "p5";

const wrapper = document.getElementById('wrapper');
wrapper?.classList.add('loading');

// 128 x 128
// 11:52:59.798 Created Grid +18ms
// 11:52:59.952 Processed Grid +155ms
// 11:53:00.013 Processed Nodes +61ms
// 11:53:00.025 Finished Setup +11ms
// 11:53:00.791 Finished Draw +767ms

// 512 x 512
// 10:56:16.080 Created Grid +388ms
// 10:56:18.935 Processed Grid +2855ms
// 10:56:20.008 Processed Nodes +1073ms
// 10:56:20.024 Finished Setup +16ms
// 10:56:43.780 Finished Draw +23756ms

const DEBUG = {
	GRID: false,
};

const { SIZE } = GRID;
const { SIDE_LGTH } = TILE;
const { WEIGHT_THICK, WEIGHT_THIN } = LANE;

let grid = new Grid(SIZE);
let colors: Record<string, Color> = {};

export const sketch = (p: P5) => {
	p.setup = () => {
		p.createCanvas(SIZE * SIDE_LGTH, SIZE * SIDE_LGTH);
		p.ellipseMode(p.RADIUS);
		p.noLoop();

		colors = createColors(p, grid.colors);
		log('Finished Setup');
	};

	p.draw = () => {
		p.background(colors.background);

		if (DEBUG.GRID) {
			drawCheckboard(p);
			debugGrid(p, grid);
		} else {
			drawNodes(p, grid);
		}

		log('Finished Draw');
		wrapper?.classList.remove('loading');
	};

	p.mouseClicked = (e) => {
		if (e instanceof UIEvent && e.target instanceof HTMLCanvasElement) {
			wrapper?.classList.add('loading');

			setTimeout(() => {
				log.reset();
				grid = new Grid(SIZE);
				colors = createColors(p, grid.colors);
				p.redraw(1);

			}, 300);
		}
	};
};

function createColors(p: P5, input: Set<string>) {
	return {
		background: p.color(17),
		...[...input].reduce((all, color) => ({
			...all,
			[color]: p.color(color)
		}), {})
	} as Record<string, Color>;
}

function drawCheckboard(p: P5) {
	let x: number;
	let y: number;

	p.noStroke();
	p.fill(51);

	for (let j = 0; j < SIZE; j += 1) {
		for (let i = 0; i < SIZE; i += 1) {
			if (
				(i % 2 === 0 && j % 2 === 0) ||
				(i % 2 === 1 && j % 2 === 1)
			) {
				x = i * SIDE_LGTH;
				y = j * SIDE_LGTH;
				p.rect(x, y, SIDE_LGTH, SIDE_LGTH);
			}
		}
	}
}

function debugGrid(p: P5, data: Grid) {
	drawCheckboard(p);

	p.textSize(0.25 * SIDE_LGTH);
	p.textStyle(p.BOLD);
	p.textAlign(p.CENTER, p.CENTER);
	p.noStroke();
	p.fill('#ffffff33');

	const tiles = [...data.tiles.values()];

	for (const tile of tiles) {
		p.text(`${tile.lanes}\n${tile.rotation}`, ...tile.center);
	}

	let x: number;
	let y: number;

	p.noFill();
	tiles.forEach((tile, j) => {
		[x, y] = tile.center;
		p.strokeWeight(Math.max(1, 0.1 * SIDE_LGTH));

		(tile.lanes.split('') as (typeof LANES)[number][])
			.forEach((lane, k) => {
				const hue = ((360 * j / 4) + k * 90) % 360;
				p.stroke(`hsl(${hue}, 90%, 60%)`);
				renderer[lane](p, x, y, k);
			});
	});
}

function drawNodes(p: P5, data: Grid) {
	const bg = colors.background;

	let x: number;
	let y: number;

	p.noFill();
	p.strokeWeight(Math.max(1, 0.1 * SIDE_LGTH));

	const tiles = [...data.parsed.values()];
	tiles.forEach((tile, j) => {
		[x, y] = tile.coords;

		// order matters
		(['N', 'E', 'S', 'W'] as Edge[]).forEach((edge, rotation) => {
			const { lane, color } = tile.edges[edge];

			if (tile.hasIntersections) {
				p.stroke(bg);
				p.strokeWeight(WEIGHT_THICK);
				p.strokeCap(p.SQUARE);
				renderer[lane](p, x, y, rotation);

				// 	p.erase();
				// 	p.strokeWeight(WEIGHT_THICK);
				// 	p.strokeCap(p.SQUARE);
				// 	renderer[lane](p, x, y, rotation);
				// 	p.noErase();
			}

			p.stroke(color);
			p.strokeWeight(WEIGHT_THIN);
			p.strokeCap(p.ROUND);
			renderer[lane](p, x, y, rotation);
		});
	});
}