import type { Color } from "p5";
import type { P5, NodeHash } from "./types.js";

import { CANVAS_SIZE, TILES_AMOUNT } from "./config.js";
import { createTiles } from "./core/tiles.js";
import { createNodes } from "./core/nodes.js";
import { NodesObserver } from "./core/observer.js";
import { NodesRenderer } from "./renderer/nodes.js";

export const sketch = (p: P5) => {
	let tiles = createTiles(TILES_AMOUNT);
	let observer = new NodesObserver();

	let graphs: NodeHash[][] = [];
	let renderers: NodesRenderer[] = [];

	let background: Color;

	p.setup = () => {
		p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
		p.ellipseMode(p.RADIUS);
		p.background(background = p.color('hsl(0, 0%, 8%)'));

		NodesRenderer.shuffleColorValues();
	};

	p.draw = () => {
		p.background(background);
		const start = !observer.done
			? observer.getNextUnoccupied(tiles)
			: null;

		if (start) {
			const nodes = createNodes(tiles, start, observer);
			graphs.push(nodes);

			const renderer = new NodesRenderer(p, background, tiles, nodes);
			renderers.push(renderer);
		}

		p.noFill();
		renderers.forEach(r => r.draw(p, background));

		if (renderers.every(renderer => renderer.done)) {
			tiles = createTiles(TILES_AMOUNT);
			observer = new NodesObserver();

			graphs = [];
			renderers = [];

			NodesRenderer.shuffleColorValues();
		}
	};

	p.mouseClicked = (e) => {
		if (p.isLooping()) {
			p.noLoop();
		} else {
			p.loop();
		}
	};
};