import { isInstanceOf } from "../../../utils.js";

import type { Where } from "../types.js";

import './base.css';

const componentClass = 'ul-component';

export class BaseList {
	public parent: HTMLElement | null;
	public elt: HTMLUListElement;
	public items: HTMLLIElement[];

	constructor(parent?: HTMLElement, where?: Where) {
		this.elt = document.createElement('ul');
		this.elt.classList.add(componentClass);

		this.parent = parent ?? null;

		if (this.parent) {
			this.parent.insertAdjacentElement(where || 'beforeend', this.elt);
		}

		this.items = [];
	}

	protected _getTargetItem(target: EventTarget | null) {
		if (!target) return null;

		if (!isInstanceOf(target, HTMLElement)) return null;

		while (!isInstanceOf(target, HTMLLIElement)) {
			target = target.parentElement;

			if (
				!target ||
				target === this.elt ||
				!isInstanceOf(target, HTMLElement)
			) return null;
		}

		return target;
	}

	createItem(...elts: (HTMLElement | string)[]) {
		const item = document.createElement('li');

		elts.forEach(elt => {
			if (typeof elt === 'string') {
				item.insertAdjacentHTML('beforeend', elt);
			} else {
				item.insertAdjacentElement('beforeend', elt);
			}
		});

		this.elt.append(item);
		this.items.push(item);

		return item;
	}
}