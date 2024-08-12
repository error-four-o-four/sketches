import type { Tile, TileProps } from "../types.js";
import { TILES } from "../config.js";
import { getCenterCoords, getPositionCoords } from "./coords.js";

const weights = (Object.keys(TILES) as Tile[])
	.reduce((all, type) => {
		const length = TILES[type].weight;
		return [
			...all,
			...Array.from({ length }, () => type)
		];
	}, [] as Tile[]);

function pickType(): Tile {
	const index = Math.floor(Math.random() * weights.length);
	return weights[index];
}

function pickRotation() {
	return Math.floor(Math.random() * 4);
}

export function rotateTileHash(type: Tile, rotation: number) {
	let i = 0;
	while (i < rotation) {
		type = type.slice(-1) + type.slice(0, 3);
		i += 1;
	}
	return type;
}

export function createTileProps(col: number, row: number): TileProps {
	const type = pickType();
	const rotation = pickRotation();

	return {
		type,
		lanes: rotateTileHash(type, rotation),
		rotation,
		position: getPositionCoords(col, row),
		center: getCenterCoords(col, row),
	};
}