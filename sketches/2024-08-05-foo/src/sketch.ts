import { P5 } from "./types";

export const sketch = (p: P5) => {
	p.setup = function () {
		p.createCanvas(200, 200);
		p.colorMode(p.HSL);
		p.textStyle(p.BOLD);
		p.textAlign(p.CENTER, p.CENTER);
		p.textSize(24);
	};

	p.draw = function () {
		const hue = p.frameCount % 360;
		p.background(hue, 100, 50);
		p.noStroke();
		p.fill((hue + 120) % 360, 100, 50);
		p.text('template', 0.5 * p.width, 0.5 * p.height);
	};
};