import type P5 from 'p5';

import { backgroundButton, canvasWrap, loopButton } from './interface/elements.js';

import renderer from './emoji/renderer.js';
import uploader from './emoji/uploader.js';
import selector from './emoji/selector.js';
import EmojiPacker from './emoji/packer.js';

import controller from './controller.js';

const MAX_ATTEMPTS = 500;
const FRAME_RATE = controller.debugMode ? 20 : 60;

// depends on BUFFER_SIZE
const MIN_SCALE = 0.25;

// scale image down if pixels conflict
const SCALE_FACTOR = 1 / 6;

const MAX_ANGLE = 0.75;
// const MAX_ANGLE = 0.5;

export const sketch = (p: P5) => {
	const canvasSize = Math.floor(Math.min(canvasWrap.clientWidth, canvasWrap.clientHeight));

	let buffer: P5.Graphics;
	let debug: P5.Graphics;
	let coords: CoordsController;
	let packer: EmojiPacker;

	p.setup = async function () {
		p.createCanvas(canvasSize, canvasSize);
		p.pixelDensity(1);
		p.background(backgroundButton.value);
		p.rectMode(p.CENTER);
		p.noLoop();
		p.frameRate(FRAME_RATE);

		buffer = p.createGraphics(canvasSize, canvasSize);
		buffer.pixelDensity(1);

		debug = p.createGraphics(canvasSize, canvasSize);
		debug.pixelDensity(1);
		debug.ellipseMode(p.CENTER);

		controller.setup(p, buffer);

		renderer.setup(canvasSize);
		uploader.setup();
		selector.setup();

		await selector.shuffle();

		coords = new CoordsController(canvasSize);
		packer = new EmojiPacker(p, MIN_SCALE, SCALE_FACTOR, MAX_ANGLE);

		loopButton.click();
	};

	p.draw = function () {
		p.background(backgroundButton.value);

		if (selector.items.size === 0) {
			return;
		}

		// loopButton.click();

		if (controller.attempts === MAX_ATTEMPTS) {
			p.image(buffer, 0, 0);
			packer.img = undefined;
			loopButton.click();
			loopButton.disable();
			// console.log('Stopped with%oattempts at%oframes', attempts, p.frameCount);
			return;
		}

		p.noStroke();
		p.fill(204);
		p.text(`Processing ... ${Math.round(100 * controller.attempts / MAX_ATTEMPTS)}%`, 10, 20);

		controller.attempts += 1;
		buffer.loadPixels();

		if (controller.debugMode) {
			debug.clear();
			debug.loadPixels();
		}

		if (!packer.img) {
			packer.setCurrentEmoji(p.frameCount);
			coords.setRandomCoords(packer);
			// p.frameCount < 5
			// 	? coords.setRandomCoords(packer)
			// 	: coords.setDistributedCoords(packer);
		}

		let conflict = packer.test(debug, buffer, coords.x, coords.y);

		// while (conflict) {
		// 	// emoji = shrink(emoji);

		// 	// if (emoji.scale <= MIN_SCALE) {
		// 	// 	break;
		// 	// };

		// 	// emoji.renderImage();

		// 	// emoji.test(buffer, coordX, coordY);
		// }

		if (!conflict) {
			buffer.image(
				packer.buffer,
				coords.x - packer.bufferWidthHalf,
				coords.y - packer.bufferHeightHalf,
				packer.buffer.width,
				packer.buffer.height
			);
			packer.img = undefined;
		} else {
			packer.shrink();
		}

		p.image(buffer, 0, 0);

		if (!controller.debugMode) return;

		// if (conflict) {
		// 	p.tint(255, 0, 0, 128);
		// 	p.image(
		// 		packer.buffer,
		// 		coords.x - packer.bufferWidthHalf,
		// 		coords.y - packer.bufferHeightHalf,
		// 		packer.buffer.width,
		// 		packer.buffer.height
		// 	);
		// 	p.tint(255, 255);
		// }

		p.image(
			packer.debug,
			coords.x - packer.bufferWidthHalf,
			coords.y - packer.bufferHeightHalf,
			packer.buffer.width,
			packer.buffer.height
		);

		p.image(debug, 0, 0);
	};


	// p.keyPressed = async function (e: KeyboardEvent) {
	// 	if (e.code === 'KeyD') {
	// 		controller.debugMode = !controller.debugMode;
	// 		console.log('debug %o', controller.debugMode);
	// 		return;
	// 	}
	// };
};

class CoordsController {
	canvasSize: number;
	values: [number, number][];
	x: number;
	y: number;

	constructor(canvasSize: number) {
		this.canvasSize = canvasSize;
		this.values = [];
		this.x = 0;
		this.y = 0;
	}

	private create(packer: EmojiPacker): [number, number] {
		const [marginX, marginY] = [packer.imgWidth, packer.imgHeight].map(v => Math.floor(v * 0.75));

		return [
			randomInt(this.canvasSize - marginX, marginX),
			randomInt(this.canvasSize - marginY, marginY)
		];
	}

	setRandomCoords(packer: EmojiPacker) {
		const coords = this.create(packer);

		this.values.push(coords);
		this.x = coords[0];
		this.y = coords[1];
	}

	setDistributedCoords(packer: EmojiPacker) {
		const coords = this.create(packer);
		const [ax, ay] = coords.map(v => Math.floor(v - renderer.bufferSizeHalf));
		const [bx, by] = coords.map(v => Math.floor(v + renderer.bufferSizeHalf));

		const others = this.values
			// filter values within AABB
			.filter(([x, y]) => {
				if (x < ax || x > bx) return false;
				if (y < ay || y > by) return false;
				return true;
			});

		if (others.length < 2) {
			return coords;
		}

		if (others.length === 2) {
			const dx = others[1][0] - others[0][0];
			const dy = others[1][1] - others[0][1];

			return [
				others[0][0] + 0.5 * dx,
				others[0][1] + 0.5 * dy,
			].map(v => Math.floor(v));
		}

		if (others.length > 2) {
			// find the three closest coords
			// const distances = others.reduce((all, [x, y]) => ({
			// 	...all,
			// 	[((coords[0] - x) ** 2 + (coords[1] - y) ** 2) ** 0.5]: [x, y]
			// }), {} as Record<string, [number, number]>);

			// const keys: string[] = [];

			// while (keys.length < 3) {
			// 	const distance = Object.keys(distances)
			// 		.filter(value => !keys.includes(value))
			// 		.reduce((result, value) => Math.min(result, parseFloat(value)), Infinity)
			// 		.toString();
			// 	keys.push(distance);
			// }

			// const closest = keys.reduce((all, key) => [
			// 	...all,
			// 	distances[key]
			// ], [] as [number, number][]);

			// // calculate center of triangle
			// return [
			// 	(closest[0][0] + closest[1][0] + closest[2][0]) / 3,
			// 	(closest[0][1] + closest[1][1] + closest[2][1]) / 3,
			// ].map(v => Math.floor(v));
			return [
				others.reduce((acc, val) => acc += val[0], 0) / others.length,
				others.reduce((acc, val) => acc += val[1], 0) / others.length
			].map(v => Math.floor(v));
		}

		throw new Error('Nope');
	}
}

function randomInt(n = 10, m = 0) {
	return m + Math.floor((n - m + 1) * Math.random());
}
