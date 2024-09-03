
import type P5 from "p5";

import selector from "./emoji/selector.js";

import {
	loopButton,
	refreshButton,
	shuffleButton,
	saveButton,
	actionRadios,
	backgroundButton,
} from './interface/elements.js';


refreshButton.disable();
shuffleButton.disable();
saveButton.disable();
actionRadios.disable();

const controller = {
	debugMode: true,
	attempts: 0,
	setup(p: P5, buffer: P5.Graphics) {
		initLoopControl(p);
		initRefreshControl(p, buffer);
		initBackgroundControl(p);
		initShuffleControl();
		initSaveControl(p);
	},
};

export default controller;

function initLoopControl(p: P5) {
	p.isLooping()
		? loopButton.set('pause')
		: loopButton.set('play');

	onToggleLoop();

	loopButton.onClick = async (value) => {
		if (value === 'pause' && selector.isEmpty()) {
			await selector.shuffle();
		}

		// console.log('clicked - loop: %o', value === 'pause');

		value === 'pause'
			? p.loop()
			: p.noLoop();

		onToggleLoop();
	};
}

function initRefreshControl(p: P5, buffer: P5.Graphics) {
	refreshButton.onClick = () => {
		if (p.isLooping()) return;

		controller.attempts = 0;

		p.background(backgroundButton.value);
		buffer.clear();
		loopButton.enable();
		loopButton.click();
	};
}

function initBackgroundControl(p: P5) {
	backgroundButton.onChange = function () {
		if (p.isLooping()) return;

		p.redraw();
	};
}

function initShuffleControl() {
	shuffleButton.onClick = async function () {
		refreshButton.disable();
		await selector.shuffle();
		refreshButton.enable();
	};
}

function initSaveControl(p: P5) {
	saveButton.onClick = () => {
		p.saveCanvas(`img-${Date.now()}`, 'png');
	};
}

function onToggleLoop() {
	if (loopButton.value === 'play') {
		refreshButton.enable();
		shuffleButton.enable();
		saveButton.enable();
		return;
	}

	refreshButton.disable();
	shuffleButton.disable();
	saveButton.disable();
}
