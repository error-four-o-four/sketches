import type { P5, Lane } from "../types.js";
import { LANES } from "../config.js";
import { LANE, COORDS, ANGLES } from "./coords.js";

export const renderer: Record<
	Lane,
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