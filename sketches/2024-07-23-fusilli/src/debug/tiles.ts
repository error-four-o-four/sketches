import type { P5 } from "../types.js";

import { TILES, LANES } from "../config.js";
import { TILE, LANE, COORDS, ANGLES } from "../tile/coords.js";
import { rotateTileHash } from "../tile/index.js";

const data = (Object.keys(TILES) as (keyof typeof TILES)[])
	.map(tile => Array.from({ length: 4 }, (_, i) => rotateTileHash(tile, i)));

const renderer: Record<
	(typeof LANES)[number],
	(p: P5, x: number, y: number, rotation: number) => void
> = {
	B(p, x, y, rotation) {
		const type: (typeof LANES)[number] = 'B';
		const coords = getCoords(type, x, y, rotation);
		const angles = ANGLES[type][rotation];

		p.line(...coords[0], ...coords[1]);
		p.arc(...coords[2], LANE.RADIUS_SMALL, LANE.RADIUS_SMALL, angles[0], angles[1]);
		p.line(...coords[3], ...coords[4]);
		p.arc(...coords[5], LANE.RADIUS_SMALL, LANE.RADIUS_SMALL, angles[2], angles[3]);
		p.line(...coords[6], ...coords[7]);
	},
	L(p, x, y, rotation) {
		const type: (typeof LANES)[number] = 'L';
		const coords = getCoords(type, x, y, rotation);
		const angles = ANGLES[type][rotation];

		p.line(...coords[0], ...coords[1]);
		p.arc(...coords[2], LANE.RADIUS_BIG, LANE.RADIUS_BIG, angles[0], angles[1]);
		p.line(...coords[3], ...coords[4]);
		p.arc(...coords[5], LANE.RADIUS_BIG, LANE.RADIUS_BIG, angles[2], angles[3]);
		p.line(...coords[6], ...coords[7]);
	},
	F(p, x, y, rotation) {
		const type: (typeof LANES)[number] = 'F';
		const coords = getCoords(type, x, y, rotation);
		p.line(...coords[0], ...coords[1]);
	},
	R(p, x, y, rotation) {
		const type: (typeof LANES)[number] = 'R';
		const coords = getCoords(type, x, y, rotation);
		const angles = ANGLES[type][rotation];

		p.line(...coords[0], ...coords[1]);
		p.arc(...coords[2], LANE.RADIUS_SMALL, LANE.RADIUS_SMALL, angles[0], angles[1]);
		p.line(...coords[3], ...coords[4]);
		p.arc(...coords[5], LANE.RADIUS_SMALL, LANE.RADIUS_SMALL, angles[2], angles[3]);
		p.line(...coords[6], ...coords[7]);
	},
};

function getCoords(
	type: (typeof LANES)[number],
	x: number,
	y: number,
	rotation: number,
) {
	return COORDS[type][rotation].map(values => [x + values[0], y + values[1]] as [number, number]);
}

export const sketch = (p: P5) => {
	p.setup = () => {
		p.createCanvas(5 * TILE.SIDE_LGTH, (data.length + 1) * TILE.SIDE_LGTH);
		p.ellipseMode(p.RADIUS);
		p.noLoop();
	};

	p.draw = () => {
		background(p);

		p.textAlign(p.CENTER, p.CENTER);
		p.textStyle(p.BOLD);
		p.textSize(0.25 * TILE.SIDE_LGTH);

		p.strokeCap(p.ROUND);
		p.strokeWeight(0.1 * TILE.SIDE_LGTH);

		p.translate(TILE.SIDE_LGTH, TILE.SIDE_LGTH);

		data.forEach((tiles, i) => {
			tiles.forEach((tile, j) => {
				let x = j * TILE.SIDE_LGTH;
				let y = i * TILE.SIDE_LGTH;
				p.fill('#ffffff33');
				p.noStroke();
				p.text(`${tile}\n${j * 90}°`, x, y);

				p.noFill();
				(tile.split('') as (typeof LANES)[number][]).forEach((lane, k) => {
					const hue = ((360 * j / 4) + k * 90) % 360;
					p.stroke(`hsl(${hue}, 90%, 60%)`);
					renderer[lane](p, x, y, k);
				});
			});
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