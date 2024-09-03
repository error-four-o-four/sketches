import { delay, isInstanceOf } from "../../utils.js";
import type { Where } from "./types.js";

import './tabs.css';

const classList = {
	component: 'tab-component',
	link: 'tab-link',
	item: 'tab-item',
	selected: 'selected',
	hidden: 'hidden'
};

export class Tabs {
	public parent: HTMLElement;
	public container: HTMLDivElement;

	private linksWrap: HTMLDivElement;
	private itemsWrap: HTMLDivElement;

	private index: number;
	private links: HTMLDivElement[];
	private items: HTMLDivElement[];

	public onSelect: ((tab: HTMLDivElement, index: number) => Promise<void> | void) | null;;

	constructor(
		elements: HTMLElement[],
		parent: HTMLElement,
		where: Where = 'beforeend'
	) {
		this.parent = parent;
		this.container = document.createElement('div');
		this.container.classList.add(classList.component);

		this.linksWrap = document.createElement('div');
		this.linksWrap.classList.add(`${classList.link}-wrap`);

		this.itemsWrap = document.createElement('div');
		this.itemsWrap.classList.add(`${classList.item}-wrap`);

		this.index = 0;
		this.links = [];
		this.items = [];
		elements.forEach(elt => this._create(elt));

		this.parent.insertAdjacentElement(where, this.container);
		this.container.insertAdjacentElement('beforeend', this.linksWrap);
		this.container.insertAdjacentElement('beforeend', this.itemsWrap);

		this.links[this.index].classList.add(classList.selected);
		this.items[this.index].classList.add(classList.selected);
		this.container.setAttribute('style', `min-height: ${this.container.scrollHeight}px`);

		this.onSelect = null;

		this.linksWrap.addEventListener('click', this._onselect.bind(this));
	}

	private _create(elt: HTMLElement) {
		const index = this.links.length;
		const link = document.createElement('div');
		link.classList.add(classList.link, `${classList.link}-${index}`);
		link.textContent = `${index + 1}`;
		this.linksWrap.append(link);
		this.links.push(link);

		const item = document.createElement('div');
		item.classList.add(classList.item, `${classList.item}-${index}`);
		item.append(elt);

		this.itemsWrap.append(item);
		this.items.push(item);
	}

	private async _onselect(e: MouseEvent) {
		if (!e.target) return;

		if (!isInstanceOf(e.target, HTMLDivElement)) return;

		if (!this.links.includes(e.target)) return;

		const next = this.links.indexOf(e.target);

		if (next < 0 || next >= this.links.length || next === this.index) return;

		const prev = this.index;

		this.links[prev].classList.remove(classList.selected);
		this.links[next].classList.add(classList.selected);

		this.items[prev].classList.add(classList.hidden);

		await delay(250);

		this.index = next;
		this.items[prev].classList.remove(classList.selected);
		this.items[next].classList.add(classList.hidden);
		this.items[next].classList.add(classList.selected);
		this.items[next].classList.remove(classList.hidden);
		this.onSelect && this.onSelect(this.items[this.index], this.index);
	}
}