import { Graphics, Image } from 'p5';
import { P5 } from './types';

const wrapper = document.getElementById('wrapper')!;

const CANVAS_SIZE = Math.floor(Math.min(wrapper.clientWidth, wrapper.clientHeight));
const BUFFER_SIZE = 192;
const BUFFER_SIZE_HALF = 0.5 * BUFFER_SIZE;

// @todo addEventlistener
let debugMode = false;

const MAX_FFRAMES = 500;

// depends on BUFFER_SIZE
const MIN_SCALE = 0.2;

// scale image down if pixels conflict
const SCALE_FACTOR = 1 / 10;

const MAX_ANGLE = 0.75;
// const MAX_ANGLE = 0.5;

const emojis = '🌮'.split(' ');
// const emojis = '💀 💡 🧨 ⏳'.split(' ');
// const emojis = '👞 👟 🥾 🥿 👠 👡 👢'.split(' ');
// const emojis = '🍕 🍔 🍿 🌭 🍟 🥓 🍗 🥩 🍪'.split(' ');

export const sketch = (p: P5) => {
	let emoji: EmojiController;
	let coords: CoordsController;
	let buffer: Graphics;

	p.setup = function () {
		p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
		p.pixelDensity(1);

		emoji = new EmojiController(p, emojis);
		coords = new CoordsController();

		buffer = p.createGraphics(CANVAS_SIZE, CANVAS_SIZE);
		buffer.pixelDensity(1);
		buffer.loadPixels();

		// p.frameRate(1);
		// p.background('hsl(0, 0%, 6%)');
	};

	p.draw = function () {
		if (p.frameCount >= MAX_FFRAMES) {
			p.noLoop();
			p.background('hsl(0, 0%, 4%)');
			p.image(buffer, 0, 0);

			return;
		}

		p.background('hsl(0, 0%, 4%)');
		p.noStroke();
		p.fill(204);
		p.text('Processing ...', 20, 20);

		const [cx, cy] = p.frameCount < 5
			? coords.getRandomCoords(emoji)
			: coords.getDistributedCoords(emoji);


		emoji.test(buffer, cx, cy);

		let imgWidthHalf: number;
		let imgHeightHalf: number;

		while (!emoji.fits) {
			emoji.shrink();

			if (emoji.scale <= MIN_SCALE) {
				break;
			};

			emoji.renderImage();

			if (debugMode) {
				[imgWidthHalf, imgHeightHalf] = emoji.imageCenter;
				p.tint(255, 0, 0, 34);
				p.image(emoji.image, cx - imgWidthHalf, cy - imgHeightHalf);
			}
			emoji.test(buffer, cx, cy);
		}

		if (emoji.fits) {
			[imgWidthHalf, imgHeightHalf] = emoji.imageCenter;
			buffer.image(emoji.image, cx - imgWidthHalf, cy - imgHeightHalf);
			buffer.loadPixels();

			// console.log('yes', cx, cy, emoji.imageBounds, emoji.scale);
		} else {
			// console.log('nope');
		}


		emoji.reset();
		emoji.renderImage();

		p.tint(255, 255);
		p.image(buffer, 0, 0);
	};

	p.keyPressed = function (e: KeyboardEvent) {
		if (e.code === 'KeyD') {
			debugMode = !debugMode;
			console.log('debug %o', debugMode);
			return;
		}

		if (e.code !== 'KeyR') return;

		if (p.frameCount >= MAX_FFRAMES) {
			buffer.clear();
			coords = new CoordsController();
			p.frameCount = 0;
			p.loop();
			return;
		}

		if (p.isLooping()) {
			p.noLoop();
		} else {
			p.loop();
		}
	};
};

class EmojiController {
	pg: Graphics;
	textSizeMax: number;

	items: string[];
	current: string;

	scale: number;
	angle: number;
	image: Image;

	fits: boolean;

	constructor(p: P5, items: string[]) {
		const pg = p.createGraphics(BUFFER_SIZE, BUFFER_SIZE);

		pg.pixelDensity(1);
		pg.noSmooth();
		pg.angleMode(p.RADIANS);
		pg.textAlign(p.CENTER, p.CENTER);
		pg.textSize(BUFFER_SIZE);

		const textHeight = pg.textAscent() + pg.textDescent();
		const textDiagonal = 2 ** 0.5 * textHeight;

		this.pg = pg;
		this.textSizeMax = BUFFER_SIZE * (BUFFER_SIZE / textDiagonal);

		this.items = items;
		this.current = this.getRandomItem();

		this.scale = 1;
		this.angle = this.getRandomAngle();
		this.image = this.getImage();
		this.image.loadPixels();

		this.fits = false;
	}

	private getRandomItem() {
		return this.items[Math.floor(Math.random() * this.items.length)];
	}

	private getRandomAngle() {
		return MAX_ANGLE * (Math.random() * 2 - 1) * Math.PI;
	}

	public get imageCenter() {
		return [
			Math.floor(0.5 * this.image.width),
			Math.floor(0.5 * this.image.height)
		];
	}

	public get imageBounds() {
		return [this.image.width, this.image.height];
	}

	public test(pgOut: Graphics, cx: number, cy: number) {
		const [imgWidthHalf, imgHeightHalf] = this.imageCenter;
		const [imgWidth, imgHeight] = this.imageBounds;

		let px: number;
		let py: number;

		for (let y = imgHeight - 1; y >= 0; y -= 1) {
			for (let x = imgWidth - 1; x >= 0; x -= 1) {
				const imgIndex = convertCoord2Index(x, y, imgWidth);
				const imgAlpha = this.image.pixels[4 * imgIndex + 3];

				if (imgAlpha === 0) continue;

				px = cx - imgWidthHalf + x;
				py = cy - imgHeightHalf + y;

				const pgIndex = convertCoord2Index(px, py, pgOut.width);
				const pgAlpha = pgOut.pixels[4 * pgIndex + 3];

				if (pgAlpha === 0) continue;

				this.fits = false;
				return;
			}
		}

		this.fits = true;
	}

	public shrink() {
		this.scale -= SCALE_FACTOR;
	}

	public reset() {
		this.current = this.getRandomItem();

		this.scale = 1;
		this.angle = this.getRandomAngle();
		this.fits = false;
	}

	public renderImage() {
		this.image = this.getImage();
		this.image.loadPixels();
	}

	private getImage() {
		const { pg } = this;

		pg.clear();
		pg.push();
		pg.translate(BUFFER_SIZE_HALF, BUFFER_SIZE_HALF);
		pg.rotate(this.angle);
		pg.textSize(Math.floor(this.scale * this.textSizeMax));
		pg.text(this.current, 0, 0);
		pg.pop();

		pg.loadPixels();

		const isTransparentPixel = (pixels: number[], x: number, y: number) => {
			return pixels[4 * convertCoord2Index(x, y, BUFFER_SIZE) + 3] === 0;
		};

		// find min max pixels and crop
		let ax: number | undefined;
		let ay: number | undefined;
		let bx: number | undefined;
		let by: number | undefined;

		// from top edge
		for (let y = 0; y < BUFFER_SIZE; y += 1) {
			for (let x = 0; x < BUFFER_SIZE; x += 1) {
				if (isTransparentPixel(pg.pixels, x, y)) continue;
				ay = y;
				break;
			}
			if (ay) break;
		}

		// from left edge
		for (let x = 0; x < BUFFER_SIZE; x += 1) {
			for (let y = 0; y < BUFFER_SIZE; y += 1) {
				if (isTransparentPixel(pg.pixels, x, y)) continue;
				ax = x;
				break;
			}
			if (ax) break;
		}

		// from bottom edge
		for (let y = BUFFER_SIZE - 1; y >= 0; y -= 1) {
			for (let x = BUFFER_SIZE - 1; x >= 0; x -= 1) {
				if (isTransparentPixel(pg.pixels, x, y)) continue;
				by = y + 1;
				break;
			}
			if (by) break;
		}

		// from right edge
		for (let x = BUFFER_SIZE - 1; x >= 0; x -= 1) {
			for (let y = BUFFER_SIZE - 1; y >= 0; y -= 1) {
				if (isTransparentPixel(pg.pixels, x, y)) continue;
				bx = x + 1;
				break;
			}
			if (bx) break;
		}

		if (!ax || !ay || !bx || !by) {
			throw new Error('Something went wrong ...');
		}

		return pg.get(ax, ay, bx - ax, by - ay);
	}
}

class CoordsController {
	values: [number, number][];

	constructor() {
		this.values = [];
	}

	private create(emoji: EmojiController): [number, number] {
		const [marginX, marginY] = emoji.imageBounds.map(v => Math.floor(v * 0.75));
		return [
			randomInt(CANVAS_SIZE - marginX, marginX),
			randomInt(CANVAS_SIZE - marginY, marginY)
		];
	}

	getRandomCoords(emoji: EmojiController) {
		this.values.push(this.create(emoji));

		return this.values[this.values.length - 1];
	}

	getDistributedCoords(emoji: EmojiController) {
		const coords = this.create(emoji);
		const [ax, ay] = coords.map(v => Math.floor(v - BUFFER_SIZE_HALF));
		const [bx, by] = coords.map(v => Math.floor(v + BUFFER_SIZE_HALF));

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

function convertCoord2Index(x: number, y: number, w = BUFFER_SIZE) {
	return y * w + x;
}