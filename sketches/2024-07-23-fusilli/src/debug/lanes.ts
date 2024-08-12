import type { Color } from "p5";
import type { P5 } from "../types.js";

import { LANES } from "../config.js";
import { TILE, LANE, COORDS, ANGLES } from "../tile/coords.js";

let color: Color;
let weight: number;

export const sketch = (p: P5) => {
	p.setup = () => {
		p.createCanvas(5 * TILE.SIDE_LGTH, 5 * TILE.SIDE_LGTH);
		p.ellipseMode(p.RADIUS);
		p.noLoop();
	};

	p.draw = () => {
		background(p);

		p.textAlign(p.CENTER, p.CENTER);
		p.textStyle(p.BOLD);
		p.textSize(0.25 * TILE.SIDE_LGTH);
		p.strokeCap(p.ROUND);

		let type: (typeof LANES)[number] = 'B';
		COORDS[type].forEach((array, i) => {
			p.push();
			p.translate(TILE.SIDE_LGTH + i * TILE.SIDE_LGTH, TILE.SIDE_LGTH);

			color = p.color(104);
			weight = Math.max(1, 0.025 * TILE.HALF_SIDE_LGTH);
			p.fill(color);
			p.noStroke();
			p.text(type + i, 0, 0);

			color = p.color(255);
			weight = Math.max(1, 0.2 * TILE.HALF_SIDE_LGTH);
			p.noFill();
			p.stroke(color);
			p.strokeWeight(weight);
			p.line(...array[0], ...array[1]);
			p.arc(...array[2], LANE.RADIUS_SMALL, LANE.RADIUS_SMALL, ANGLES[type][i][0], ANGLES[type][i][1]);
			p.line(...array[3], ...array[4]);
			p.arc(...array[5], LANE.RADIUS_SMALL, LANE.RADIUS_SMALL, ANGLES[type][i][2], ANGLES[type][i][3]);
			p.line(...array[6], ...array[7]);
			p.pop();
		});

		type = 'L';
		COORDS[type].forEach((array, i) => {
			p.push();
			p.translate(TILE.SIDE_LGTH + i * TILE.SIDE_LGTH, 2 * TILE.SIDE_LGTH);

			color = p.color(104);
			weight = Math.max(1, 0.025 * TILE.HALF_SIDE_LGTH);
			p.fill(color);
			p.noStroke();
			p.text(type + i, 0, 0);

			color = p.color(255);
			weight = Math.max(1, 0.2 * TILE.HALF_SIDE_LGTH);
			p.noFill();
			p.stroke(color);
			p.strokeWeight(weight);
			p.line(...array[0], ...array[1]);
			p.arc(...array[2], LANE.RADIUS_BIG, LANE.RADIUS_BIG, ANGLES[type][i][0], ANGLES[type][i][1]);
			p.line(...array[3], ...array[4]);
			p.arc(...array[5], LANE.RADIUS_BIG, LANE.RADIUS_BIG, ANGLES[type][i][2], ANGLES[type][i][3]);
			p.line(...array[6], ...array[7]);
			p.pop();
		});

		type = 'F';
		COORDS[type].forEach((array, i) => {
			p.push();
			p.translate(TILE.SIDE_LGTH + i * TILE.SIDE_LGTH, 3 * TILE.SIDE_LGTH);

			color = p.color(104);
			weight = Math.max(1, 0.025 * TILE.HALF_SIDE_LGTH);
			p.fill(color);
			p.noStroke();
			p.text(type + i, 0, 0);

			color = p.color(255);
			weight = Math.max(1, 0.2 * TILE.HALF_SIDE_LGTH);
			p.noFill();
			p.stroke(color);
			p.strokeWeight(weight);
			const [ax, ay] = array[0];
			const [bx, by] = array[1];
			p.line(ax, ay, bx, by);
			p.pop();
		});

		type = 'R';
		COORDS[type].forEach((array, i) => {
			p.push();
			p.translate(TILE.SIDE_LGTH + i * TILE.SIDE_LGTH, 4 * TILE.SIDE_LGTH);

			color = p.color(104);
			weight = Math.max(1, 0.025 * TILE.HALF_SIDE_LGTH);
			p.fill(color);
			p.noStroke();
			p.text(type + i, 0, 0);

			color = p.color(255);
			weight = Math.max(1, 0.2 * TILE.HALF_SIDE_LGTH);
			p.noFill();
			p.stroke(color);
			p.strokeWeight(weight);
			p.line(...array[0], ...array[1]);
			p.arc(...array[2], LANE.RADIUS_SMALL, LANE.RADIUS_SMALL, ANGLES[type][i][0], ANGLES[type][i][1]);
			p.line(...array[3], ...array[4]);
			p.arc(...array[5], LANE.RADIUS_SMALL, LANE.RADIUS_SMALL, ANGLES[type][i][2], ANGLES[type][i][3]);
			p.line(...array[6], ...array[7]);
			p.pop();
		});
	};
};

function background(p: P5) {
	let x: number;
	let y: number;

	p.background('#202020');
	p.noStroke();
	p.fill('#2c2c2c');

	for (let j = 0; j <= p.height / TILE.SIDE_LGTH; j += 1) {
		for (let i = 0; i <= p.width / TILE.SIDE_LGTH; i += 1) {
			if (
				(i % 2 === 0 && j % 2 === 0) ||
				(i % 2 === 1 && j % 2 === 1)
			) {
				x = i * TILE.SIDE_LGTH - TILE.HALF_SIDE_LGTH;
				y = j * TILE.SIDE_LGTH - TILE.HALF_SIDE_LGTH;
				p.rect(x, y, TILE.SIDE_LGTH, TILE.SIDE_LGTH);
			}
		}
	}
}