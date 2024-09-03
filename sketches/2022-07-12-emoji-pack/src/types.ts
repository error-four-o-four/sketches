import type p from 'p5';

export { };

declare global {
	var p5: typeof p;
}

declare module 'p5' {
	interface Image {
		canvas: HTMLCanvasElement;
		drawingContext: CanvasRenderingContext2D;
	}
}
