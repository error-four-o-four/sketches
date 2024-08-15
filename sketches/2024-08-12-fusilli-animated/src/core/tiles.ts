import type { TileType, TileHash, TileProps } from "../types.js";
import { TILES, TILE } from "../config.js";

const weights = (Object.keys(TILES) as TileType[])
	.reduce((all, type) => {
		const length = TILES[type].weight;
		return [
			...all,
			...Array.from({ length }, () => type)
		];
	}, [] as TileType[]);

const tiles = new Map<TileHash, TileProps>();
let hash: TileHash;

export function createTiles(size: number) {
	tiles.clear();

	for (let row = 0; row < size; row += 1) {
		for (let col = 0; col < size; col += 1) {
			hash = `${col}.${row}`;
			tiles.set(hash, createTileProps(col, row));
		}
	}

	return tiles;
}

export function createTileProps(col: number, row: number): TileProps {
	const type = pickType();
	const rotation = pickRotation();

	return {
		type,
		lanes: rotateTileHash(type, rotation),
		col,
		row,
		rotation,
		position: getPositionCoords(col, row),
		center: getCenterCoords(col, row),
	};
}

function pickType(): TileType {
	const index = Math.floor(Math.random() * weights.length);
	return weights[index];
}

function pickRotation() {
	return Math.floor(Math.random() * 4);
}

export function rotateTileHash(type: TileType, rotation: number) {
	let i = 0;
	while (i < rotation) {
		type = type.slice(-1) + type.slice(0, 3);
		i += 1;
	}
	return type;
}

const { SIDE_LGTH, HALF_SIDE_LGTH } = TILE;

export function getPositionCoords(
	col: number,
	row: number
): [number, number] {
	return [
		col * SIDE_LGTH,
		row * SIDE_LGTH,
	];
}

export function getCenterCoords(
	col: number,
	row: number
): [number, number] {
	return [
		col * SIDE_LGTH + HALF_SIDE_LGTH,
		row * SIDE_LGTH + HALF_SIDE_LGTH,
	];
}