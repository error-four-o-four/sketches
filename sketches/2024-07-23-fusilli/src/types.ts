import type p5 from 'p5';
import { EDGES, LANES, SEP } from "./config.js";

export type P5 = InstanceType<typeof p5>;

export type Grid = Map<TileHash, TileProps>;
export type Coords = [number, number];
export type Edge = (typeof EDGES)[number];
export type Lane = (typeof LANES)[number];
export type Lanes = `${Lane}${Lane}${Lane}${Lane}`;

export type Tile = Extract<
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
	type: Tile,
	lanes: Lanes,
	rotation: number;
	position: [number, number];
	center: [number, number];
};

type Sep = typeof SEP;

export type CheckedNodeHash = `${TileHash}${Edge}${Lane}`;
export type ProcessedNodeHash = `${CheckedNodeHash}${`${Sep}${CheckedNodeHash}` | ''}`; // append next

// export type NodeHash = `${TileHash}#${Edge}`;
// export type NodeProps = {
// 	hash: NodeHash;
// 	next: NodeHash | undefined;
// 	tile: TileHash;
// 	lane: Lane;
// 	edge: Edge;
// };