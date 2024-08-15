// import type { Coords, NodeHash } from "./types.js";
// import { GRID } from "./config.js";
// // import { Grid } from "./grid/index.js";
// import * as util from './grid/utils.js';
// // import { log } from "./logger.js";

// const { SIZE } = GRID;

// type ConfigType = 'rgb' | 'hsl';

// type ConfigRgb = {
// 	min: number;
// 	max: number;
// 	delta: number;
// };

// type ConfigHsl = {
// 	hueOff: number;
// 	hueDelta: number;
// 	hueJitter: number;
// 	lgtMin: number;
// 	lgtDelta: number;
// };

// // type ColorConfig<T> = T extends ConfigType
// // 	? T extends 'rgb'
// // 	? ConfigRgb
// // 	: T extends 'hsl'
// // 	? ConfigHsl
// // 	: never
// // 	: never;

// type ColorGenerator<T> = T extends ConfigType
// 	? T extends 'rgb'
// 	? ReturnType<typeof createRGBColorGenerator>
// 	: T extends 'hsl'
// 	? ReturnType<typeof createHSLColorGenerator>
// 	: never
// 	: never;


// // export class Colors {
// // 	type: ConfigType;
// // 	config: ConfigRgb | ConfigHsl;
// // 	data: Set<string> = new Set();
// // 	generator: ColorGenerator<typeof this.type>;

// // 	constructor(graphs: Grid['graphs']) {
// // 		this.type = throwCoin() ? 'rgb' : 'hsl';

// // 		this.config = this.type === 'rgb'
// // 			? createConfigValues(this.type)
// // 			: createConfigValues(this.type);

// // 		this.generator = this.type === 'rgb'
// // 			? createRGBColorGenerator(this.config as ConfigRgb)
// // 			: createHSLColorGenerator(this.config as ConfigHsl, graphs);

// // 		// log(JSON.stringify({ type: this.type, vals: this.config }, null, 2));
// // 	}

// // 	process(nodes: NodeHash[]) {
// // 		const [x, y] = getAvgCoords(nodes);
// // 		const [a, b, c] = this.generator(x, y, nodes.length);

// // 		const color = this.type === 'rgb'
// // 			? `rgb(${a}, ${b}, ${c})`
// // 			: `hsl(${a}, ${b}%, ${c}%)`;

// // 		this.data.add(color);
// // 		return color;
// // 	}
// // }

// function createConfigValues(type: ConfigType) {
// 	if (type === 'rgb') {
// 		const min = 34;
// 		const max = 255;

// 		return {
// 			min,
// 			max,
// 			delta: max - min
// 		} as ConfigRgb;
// 	}

// 	return {
// 		hueOff: Math.floor(270 * Math.random()),
// 		hueDelta: [90, 180][Math.floor(2 * Math.random())],
// 		hueJitter: 30,
// 		lgtMin: 20,
// 		lgtDelta: 60
// 	} as ConfigHsl;
// }

// // function getAvgCoords(nodes: ProcessedNodeHash[]) {
// // 	const minMaxCoords = nodes.reduce((all, node) => {
// // 		const [col, row] = util.getHash(node).slice(0, -2).split('.').map(val => parseInt(val)) as Coords;

// // 		all[0] = Math.min(all[0], col);
// // 		all[1] = Math.max(all[1], col);
// // 		all[2] = Math.min(all[2], row);
// // 		all[3] = Math.max(all[3], row);

// // 		return all;
// // 	}, [Infinity, -Infinity, Infinity, -Infinity]);

// // 	return [
// // 		minMaxCoords[0] + 0.5 * (minMaxCoords[1] - minMaxCoords[0]),
// // 		minMaxCoords[2] + 0.5 * (minMaxCoords[3] - minMaxCoords[2]),
// // 	];
// // }

// function throwCoin(n = 0.5) {
// 	return Math.random() < n;
// }

// // ####

// function createRGBColorGenerator(config: ConfigRgb) {
// 	const a: ShufflerParams = [
// 		throwCoin(),
// 		throwCoin(),
// 		throwCoin()
// 	];

// 	const b: ShufflerParams = throwCoin()
// 		? [a[0], !a[1], !a[2]]
// 		: [!a[0], throwCoin(), throwCoin()];

// 	// mapped to [r, g, b]
// 	const colors = shuffleArray([
// 		createShuffler(...a),
// 		createShuffler(...b),
// 		throwCoin() ? 0.25 : 0.75,
// 	]);

// 	const generate = (x: number, y: number) => {
// 		return colors.map(item => typeof item === 'function'
// 			? item(x, y) : item
// 		);
// 	};

// 	return (
// 		x: number,
// 		y: number,
// 		_: number
// 	) => {
// 		x /= SIZE;
// 		y /= SIZE;
// 		const vals = generate(x, y);
// 		return vals.map(n => clampRGBValue(config.min + n * config.delta));
// 	};
// }

// function createShuffler(axis: boolean, map: boolean, invert: boolean) {
// 	return (x: number, y: number) => {
// 		const v = (axis ? x : y);
// 		return shuffleValue(v, map, invert);
// 	};
// }

// type ShufflerParams = Parameters<typeof createShuffler>;

// function shuffleValue(n: number, map: boolean, inv: boolean) {
// 	if (map) {
// 		n = Math.abs(n * 2 - 1);
// 	}

// 	n += 0.2 * (Math.random() * (throwCoin() ? 1 : -1));

// 	return inv ? 1 - n : n;
// }

// function shuffleArray(array: any[]) {
// 	let currentIndex = array.length;

// 	while (currentIndex != 0) {
// 		let randomIndex = Math.floor(Math.random() * currentIndex);
// 		currentIndex--;

// 		[
// 			array[currentIndex],
// 			array[randomIndex]
// 		] = [
// 				array[randomIndex],
// 				array[currentIndex]
// 			];
// 	}

// 	return array;
// }

// function clampRGBValue(n: number) {
// 	return Math.max(0, Math.min(255, Math.round(n)));
// }

// // #####

// function createHSLColorGenerator(config: ConfigHsl, data: NodeHash[][]) {
// 	// const dataLength = data.length - 1;
// 	const maxNodesLength = data.reduce(
// 		(all, nodes) => nodes.length > all ? nodes.length : all,
// 		-Infinity
// 	);

// 	// const accLength = data.reduce((acc, nodes) => acc += nodes.length - 1, 0);
// 	// const avgNodesLength = (Math.round(accLength / data.length));

// 	return (
// 		x: number,
// 		y: number,
// 		length: number,
// 	) => {
// 		x /= SIZE;
// 		y /= SIZE;

// 		const a = Math.atan2(
// 			y - 0.5,
// 			x - 0.5
// 		) / Math.PI;

// 		const b = length / maxNodesLength;

// 		const jitter = Math.random() * (throwCoin() ? 1 : -1);
// 		const hue = config.hueOff + a * config.hueDelta + jitter * config.hueJitter;

// 		const lgt = config.lgtMin + b * config.lgtDelta;

// 		return [
// 			(hue + 360) % 360,
// 			100,
// 			lgt,
// 		].map(val => Math.floor(val));
// 	};
// }