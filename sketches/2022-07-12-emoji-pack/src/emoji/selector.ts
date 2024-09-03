import type P5 from "p5";

import { delay, isInstanceOf } from "../utils.js";

import {
	loopButton,
	shuffleButton,
	selectedList,
	uploadedList,
	emojiLists,
} from "../interface/elements.js";

import renderer from "./renderer.js";
import data from "./data.js";

class EmojiSelector {
	public items: Map<string, P5.Image>;

	constructor() {
		this.items = new Map();
	}

	setup() {
		selectedList.toggleRemovable();
		selectedList.onRemove = async (item) => {
			item.classList.add('removing');

			if (!isInstanceOf(item.firstElementChild, HTMLImageElement)) return;

			this.remove(item.firstElementChild.alt);
		};

		uploadedList.onClick = (item) => {
			if (!isInstanceOf(item.firstElementChild, HTMLImageElement)) return;

			const emoji = item.firstElementChild.alt;

			if (this.has(emoji)) return;

			this.add(emoji);
		};

		emojiLists.forEach(list => {
			list.onClick = (elt) => {
				const emoji = elt.innerText;

				if (this.has(emoji)) return;

				this.add(emoji);
			};
		});
	}

	isEmpty() {
		return this.items.size === 0;
	}

	has(ident: string) {
		for (const item of selectedList.items) {
			if (
				isInstanceOf(item.firstElementChild, HTMLImageElement) &&
				item.firstElementChild.alt === ident
			) {
				return true;
			};
		}

		return false;
	}

	add(ident: string) {
		const p5Image = renderer.get(ident);
		this.items.set(ident, p5Image);

		const img = new Image();
		const item = selectedList.createHiddenItem(img);

		img.onload = () => {
			selectedList.showItem(item);
		};

		img.alt = ident;
		img.src = renderer.getResizedDataUrl(ident);
	}

	private _pick() {
		const { length } = data;
		const elt = document.createElement('span');

		// mocked
		// elt.innerHTML = '&#127776;';
		// elt.innerHTML = '&#x1F370;';
		// return [elt.innerText.trim()];

		const picked: string[] = [];
		const amount = Math.ceil(Math.random() * 4);

		while (picked.length < amount) {
			const item = data[Math.floor(Math.random() * length)];

			if (picked.includes(item)) continue;

			elt.innerHTML = item;
			picked.push(elt.innerText.trim());
		}

		return picked;
	}

	async shuffle() {
		!shuffleButton.input.disabled && shuffleButton.disable();

		await this.clear();

		this._pick().forEach(emoji => this.add(emoji));

		(loopButton.value === 'play') && shuffleButton.enable();
	}

	pick() {
		const index = Math.floor(Math.random() * this.items.size);
		return [...this.items.values()][index];
	}

	async remove(ident: string) {
		this.items.delete(ident);
	}

	async clear() {
		this.items.clear();

		await selectedList.items.reduce(async (chain, item) => {
			await chain;
			item.click();
			return delay(100);
		}, Promise.resolve());

		await delay(200);
	}
}

export default new EmojiSelector();