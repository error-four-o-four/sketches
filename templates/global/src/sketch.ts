export function setup() {
	createCanvas(200, 200);
	colorMode(HSL);
	textStyle(BOLD);
	textAlign(CENTER, CENTER);
	textSize(24);
}

export function draw() {
	const hue = frameCount % 360;

	background(hue, 100, 50);
	noStroke();
	fill((hue + 120) % 360, 100, 50);
	text('global template', 0.5 * width, 0.5 * height);
}