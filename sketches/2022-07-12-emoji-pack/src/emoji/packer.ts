import type P5 from 'p5';

import renderer from "./renderer.js";
import selector from './selector.js';

import controller from '../controller.js';

function assert<T = unknown>(value: T): asserts value is NonNullable<T> {
	if (!value) throw new Error('No Image');
}

export default class EmojiPacker {
	buffer: P5.Graphics;
	bufferWidthHalf: number;
	bufferHeightHalf: number;

	debug: P5.Graphics;
	constrain: P5.p5InstanceExtensions['constrain'];

	img: P5.Image | undefined;
	imgWidth: number;
	imgHeight: number;
	imgWidthHalf: number;
	imgHeightHalf: number;

	minScale: number;
	scaleFactor: number;
	scale: number;

	maxAngle: number;
	angle: number;

	ax: number;
	ay: number;
	bx: number;
	by: number;

	constructor(
		p: P5,
		minScale: number,
		scaleFactor: number,
		maxAngle: number
	) {
		const { bufferSize } = renderer;
		const buffer = p.createGraphics(bufferSize, bufferSize);

		buffer.pixelDensity(1);
		buffer.angleMode(p.RADIANS);
		buffer.imageMode(p.CENTER);
		this.buffer = buffer;
		this.bufferWidthHalf = Math.floor(0.5 * buffer.width);
		this.bufferHeightHalf = Math.floor(0.5 * buffer.height);

		const debug = p.createGraphics(bufferSize, bufferSize);
		debug.pixelDensity(1);
		debug.angleMode(p.RADIANS);
		debug.rectMode(p.CENTER);
		this.debug = debug;

		this.constrain = p.constrain;

		this.img = undefined;

		// dimensions refer to AABB of rotated image
		this.imgWidth = 0;
		this.imgHeight = 0;
		this.imgWidthHalf = 0;
		this.imgHeightHalf = 0;

		// relative to pg buffer
		this.ax = 0;
		this.ay = 0;
		this.bx = 0;
		this.by = 0;

		this.minScale = minScale;
		this.scaleFactor = scaleFactor;
		this.scale = 1;

		this.maxAngle = maxAngle;
		this.angle = 0;
	}

	public setCurrentEmoji(frameCount: number) {
		this.img = selector.pick();
		this.scale = frameCount < 5 ? 1 : 0.625;

		// mocked
		this.angle = 0;
		// this.angle = 0.2 * Math.PI;

		this.setRandomAngle();
		this.calcAABB();

		if (this.ax < 0 || this.ay < 0) {
			const s = Math.max(this.bx - this.ax, this.by - this.ay);
			this.scale = this.buffer.width / s;
			this.calcAABB();
		}

		this.drawToBuffer();
	}

	private setRandomAngle() {
		this.angle = this.maxAngle * (Math.random() * 2 - 1) * Math.PI;
	}

	private calcAABB() {
		assert(this.img);

		this.imgWidth = this.scale * this.img.width;
		this.imgWidthHalf = 0.5 * this.imgWidth;

		this.imgHeight = this.scale * this.img.height;
		this.imgHeightHalf = 0.5 * this.imgHeight;

		const aCos = Math.cos(this.angle);
		const aSin = Math.sin(this.angle);

		let ax = this.imgWidthHalf;
		let ay = this.imgHeightHalf;

		let bx = this.imgWidthHalf;
		let by = -this.imgHeightHalf;

		const px = Math.abs(ax * aCos - ay * aSin);
		const py = Math.abs(ax * aSin + ay * aCos);

		const qx = Math.abs(bx * aCos - by * aSin);
		const qy = Math.abs(bx * aSin + by * aCos);

		const ex = Math.max(px, qx);
		const ey = Math.max(py, qy);

		this.ax = this.bufferWidthHalf - ex;
		this.ay = this.bufferHeightHalf - ey;
		this.bx = this.bufferWidthHalf + ex;
		this.by = this.bufferHeightHalf + ey;
	}

	private drawToBuffer() {
		assert(this.img);

		const { buffer } = this;

		if (controller.debugMode) {
			// this.drawDebugBuffer();
		}

		buffer.clear();
		buffer.push();
		buffer.translate(this.bufferWidthHalf, this.bufferHeightHalf);
		buffer.rotate(this.angle);

		buffer.image(
			this.img,
			0,
			0,
			this.imgWidth,
			this.imgHeight
		);
		buffer.pop();

		buffer.loadPixels();
	}

	private drawDebugBuffer() {
		const { debug } = this;

		debug.clear();
		debug.noFill();

		debug.push();

		debug.translate(this.bufferWidthHalf, this.bufferHeightHalf);
		debug.rectMode(debug.CENTER);

		// buffer size
		debug.noStroke();
		debug.fill('#ffff0009');
		debug.rect(0, 0, this.buffer.width, this.buffer.height);

		debug.push();

		// rotated image
		debug.rotate(this.angle);
		debug.fill('#00ffff10');
		debug.rect(0, 0, this.imgWidth, this.imgHeight);

		debug.pop();

		// original image
		debug.noFill();
		debug.stroke('#ffff00');
		debug.rect(0, 0, this.imgWidth, this.imgHeight);

		debug.pop();

		debug.rectMode(debug.CORNERS);
		debug.stroke('#00ffff');
		debug.rect(this.ax, this.ay, this.bx, this.by);
	}

	public shrink(factor = this.scaleFactor) {
		this.scale -= factor;

		if (this.scale < this.minScale) {
			this.img = undefined;
			return;
		}

		this.calcAABB();
		this.drawToBuffer();
	}

	public test(debug: P5.Graphics, out: P5.Graphics, cx: number, cy: number) {
		const step = 4;

		const [ax, ay, bx, by] = [
			this.ax,
			this.ay,
			this.bx,
			this.by
		].map(v => Math.floor(v));

		let px: number;
		let py: number;

		if (!controller.debugMode) {
			for (let y = by - 1; y > ay; y -= step) {
				for (let x = bx - 1; x > ax; x -= step) {
					const imgIndex = renderer.convertCoord2Index(x, y, this.buffer.width);
					const imgAlpha = this.buffer.pixels[4 * imgIndex + 3];

					if (imgAlpha === 0) continue;

					px = cx - this.bufferWidthHalf + x;
					py = cy - this.bufferHeightHalf + y;

					const pgIndex = renderer.convertCoord2Index(px, py, out.width);
					const pgAlpha = out.pixels[4 * pgIndex + 3];

					if (pgAlpha === 0) continue;

					return true;
				}
			}

			return false;
		}

		let conflict: boolean | undefined;

		for (let y = by - 1; y > ay; y -= step) {
			for (let x = bx - 1; x > ax; x -= step) {
				const imgIndex = renderer.convertCoord2Index(x, y, this.buffer.width);
				const imgAlpha = this.buffer.pixels[4 * imgIndex + 3];

				px = cx - this.bufferWidthHalf + x;
				py = cy - this.bufferHeightHalf + y;

				const pgIndex = renderer.convertCoord2Index(px, py, out.width);
				const pgAlpha = out.pixels[4 * pgIndex + 3];

				if (conflict === undefined && imgAlpha !== 0 && pgAlpha !== 0) {
					conflict = true;
				}

				if (pgAlpha === 0 && imgAlpha === 0) {
					debug.pixels[4 * pgIndex] = 0;
					debug.pixels[4 * pgIndex + 1] = 0;
					debug.pixels[4 * pgIndex + 2] = 102;
					debug.pixels[4 * pgIndex + 3] = 255;
					continue;
				}

				if ((pgAlpha === 0 && imgAlpha !== 0)) {
					debug.pixels[4 * pgIndex] = 51;
					debug.pixels[4 * pgIndex + 1] = 255;
					debug.pixels[4 * pgIndex + 2] = 51;
					debug.pixels[4 * pgIndex + 3] = 255;
					continue;
				}

				if (pgAlpha !== 0 && imgAlpha === 0) {
					debug.pixels[4 * pgIndex] = 255;
					debug.pixels[4 * pgIndex + 1] = 255;
					debug.pixels[4 * pgIndex + 2] = 51;
					debug.pixels[4 * pgIndex + 3] = 255;
					continue;
				}

				if (pgAlpha !== 0 && imgAlpha !== 0) {
					debug.pixels[4 * pgIndex] = 255;
					debug.pixels[4 * pgIndex + 1] = 0;
					debug.pixels[4 * pgIndex + 2] = 0;
					debug.pixels[4 * pgIndex + 3] = 255;
					continue;
				}
			}
		}

		debug.updatePixels();
		return conflict || false;
	}
}