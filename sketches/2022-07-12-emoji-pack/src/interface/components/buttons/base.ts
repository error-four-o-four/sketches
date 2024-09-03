import { Where } from '../types.js';

import './base.css';

const componentClass = 'button-component';

export class BaseButton {
	public parent: HTMLElement | null;
	public elt: HTMLDivElement;

	public click: () => void;
	public input: HTMLInputElement;
	public label: HTMLLabelElement;

	constructor(id: string, parent?: HTMLElement, where?: Where) {
		this.elt = document.createElement('div');
		this.elt.classList.add(componentClass);

		this.parent = parent ?? null;
		this.parent && this.parent.insertAdjacentElement(where || 'beforeend', this.elt);

		const input = document.createElement('input');
		input.id = id;
		input.name = id;

		const label = document.createElement('label');
		label.htmlFor = id;

		this.click = input.click.bind(input);
		this.input = input;
		this.label = label;
		this.elt.append(this.input, this.label);
	}

	public disable() {
		this.input.setAttribute('disabled', 'disabled');
	}

	public enable() {
		this.input.removeAttribute('disabled');
	}
}