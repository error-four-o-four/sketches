import type P5 from "p5";

class EmojiRenderer {
	private img: P5.Image;
	private ctx: CanvasRenderingContext2D;
	private cache: Map<string, P5.Image>;
	private textSize: number;

	// public setupPromise: Promise<void>;
	public bufferSize: number;
	public bufferSizeHalf: number;

	constructor() {
		this.img = new p5.Image(1, 1);
		this.ctx = this.img.drawingContext;
		this.cache = new Map();
		this.textSize = 0;

		// this.setupPromise = new Promise((resolve) => {
		// 	const _setup = this.setup;
		// 	this.setup = (...args: Parameters<typeof _setup>) => {
		// 		_setup.call(this, ...args);
		// 		resolve();
		// 	};
		// });

		this.bufferSize = 0;
		this.bufferSizeHalf = 0;
	}

	private _setBuffersize(canvasSize: number) {
		const sizes = Array.from({ length: 5 }, (_, i) => i + 6).map(n => 2 ** n);
		this.bufferSize = sizes.find(n => n >= canvasSize / 3) || 256;
		this.bufferSizeHalf = Math.floor(0.5 * this.bufferSize);
	}

	private _setTextSize() {
		const diagonal = 2 ** 0.5 * this.bufferSize;
		this.textSize = Math.floor(this.bufferSize * (this.bufferSize / diagonal));
	}

	public setup(canvasSize: number) {
		this._setBuffersize(canvasSize);
		this._setTextSize();

		this.img.resize(this.bufferSize, this.bufferSize);

		this.ctx.font = `${this.textSize}px serif`;
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
	}

	private _createFromEmojiString(emoji: string) {
		this.ctx.clearRect(0, 0, this.bufferSize, this.bufferSize);
		this.ctx.fillText(emoji, this.bufferSizeHalf, this.bufferSizeHalf);
		const img = this._crop(this.img.get());
		this.cache.set(emoji, img);
		return img;
	}

	private _createFromImageBitmap(name: string, data: ImageBitmap) {
		// data is created with resizeHeight: bufferSize
		let w = data.width;
		let h = data.height;

		if (w > this.bufferSize) {
			const ratio = w / h;
			w /= ratio;
			h /= ratio;
		}

		this.ctx.clearRect(0, 0, this.bufferSize, this.bufferSize);
		this.ctx.drawImage(data, 0, 0, w, h);
		data.close();

		/** @todo consider reference vs value */
		const img = this._crop(this.img.get());
		this.cache.set(name, img);
		return img;
	}

	public convertCoord2Index(
		x: number,
		y: number,
		w = this.bufferSize
	) {
		return Math.floor(y * w + x);
	}

	public convertIndex2Coord(
		i: number,
		w = this.bufferSize,
		h = w
	) {
		return [
			i % w,
			i / h
		].map(n => Math.floor(n));
	}

	public isTransparentPixel(pixels: number[], x: number, y: number, w = this.bufferSize) {
		return pixels[4 * this.convertCoord2Index(x, y, w) + 3] === 0;
	}

	private _crop(img: P5.Image) {
		const { width, height } = img;
		const step = 4;

		// find min max pixels and crop
		let ax: number | undefined;
		let ay: number | undefined;
		let bx: number | undefined;
		let by: number | undefined;

		img.loadPixels();

		// from top edge
		for (let y = 0; y < height; y += 1) {
			for (let x = 0; x < width; x += step) {
				if (this.isTransparentPixel(img.pixels, x, y, width)) continue;
				ay = y;
				break;
			}
			if (ay) break;
		}

		// from left edge
		for (let x = 0; x < width; x += 1) {
			for (let y = 0; y < height; y += step) {
				if (this.isTransparentPixel(img.pixels, x, y, width)) continue;
				ax = x;
				break;
			}
			if (ax) break;
		}

		// from bottom edge
		for (let y = height - 1; y >= 0; y -= 1) {
			for (let x = width - 1; x >= 0; x -= step) {
				if (this.isTransparentPixel(img.pixels, x, y, width)) continue;
				by = y + 1;
				break;
			}
			if (by) break;
		}

		// from right edge
		for (let x = width - 1; x >= 0; x -= 1) {
			for (let y = height - 1; y >= 0; y -= step) {
				if (this.isTransparentPixel(img.pixels, x, y, width)) continue;
				bx = x + 1;
				break;
			}
			if (bx) break;
		}

		if (!ax || !ay || !bx || !by) {
			throw new Error('Something went wrong ...');
		}

		return img.get(ax, ay, bx - ax, by - ay);
	}

	public get(emoji: string | [string, ImageBitmap]) {
		if (this.bufferSize === 0) {
			throw new Error('Renderer: setup is required');
		}

		if (typeof emoji === 'string') {
			return this.cache.get(emoji)?.get() || this._createFromEmojiString(emoji);
		}

		const [name, data] = emoji;
		return this.cache.get(name)?.get() || this._createFromImageBitmap(name, data);
	}

	public getResizedDataUrl(emoji: string) {
		const icon = this.get(emoji);

		if (icon.width > icon.height) {
			icon.resize(64, 0);
		} else {
			icon.resize(0, 64);
		}

		return icon.canvas.toDataURL();
	}
}

export default new EmojiRenderer();