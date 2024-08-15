import type p5 from 'p5';
import { EDGES, LANES } from "./config.js";

export type P5 = InstanceType<typeof p5>;

export type Coords = [number, number];
export type Edge = (typeof EDGES)[number];
export type Lane = (typeof LANES)[number];
export type Lanes = `${Lane}${Lane}${Lane}${Lane}`;

export type TileType = Extract<
	Lanes,
	| 'FFFF'
	| 'LLLL'
	| 'BBBB'
	| 'RRRR'
	| 'BFBF'
	| 'LRLR'
	| 'LFBL'
	| 'BFRR'
	| 'BLRB'
	| 'FFRL'
>;

export type TileHash = `${number}.${number}`;

export type TileProps = {
	type: TileType,
	col: number,
	row: number;
	lanes: Lanes,
	rotation: number;
	position: Coords;
	center: Coords;
};

export type TileEntry = [TileHash, TileProps];
export type TilesMap = Map<TileHash, TileProps>;

// type Sep = typeof SEP;

export type NodeHash = `${TileHash}${Edge}${Lane}`;

// export type ProcessedNodeHash = `${NodeHash}${`${Sep}${NodeHash}` | ''}`; // append next

// export type NodeHash = `${TileHash}#${Edge}`;
// export type NodeProps = {
// 	hash: NodeHash;
// 	next: NodeHash | undefined;
// 	tile: TileHash;
// 	lane: Lane;
// 	edge: Edge;
// };