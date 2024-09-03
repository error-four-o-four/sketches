import { isInstanceOf } from "../../../utils.js";

import type { Where } from "../types.js";

import { BaseButton } from "./base.js";

const componentClass = 'radios-component';

export class RadioButtons<T extends Readonly<Array<string>>> {
	public parent: HTMLElement | null;
	public elt: HTMLDivElement;
	public buttons: BaseButton[];
	public active: HTMLInputElement | null;

	public values: T;
	public value: T[number] | null;

	public onClick: ((value: T[number]) => Promise<void> | void) | null;

	constructor(values: T, parent?: HTMLElement, where?: Where) {
		this.elt = document.createElement('div');
		this.elt.classList.add(componentClass);

		this.parent = parent ?? null;
		this.parent && this.parent.insertAdjacentElement(where || 'beforeend', this.elt);

		this.buttons = [];
		this.active = null;
		/** @todo this.index */

		this.values = values;
		this.value = null;

		for (const value of values) {
			const button = new BaseButton(`radio-${value}`, this.elt);
			button.input.type = 'button';
			button.input.value = value;
			button.label.textContent = value;
			this.buttons.push(button);
		}

		this.onClick = null;
		this.elt.addEventListener('click', this._onclick.bind(this));
	}

	private async _onclick(e: MouseEvent) {
		if (!isInstanceOf(e.target, HTMLInputElement)) return;

		const target = this.buttons.reduce((result, button) => {
			return button.input === e.target ? button.input : result;
		}, null as HTMLInputElement | null);

		if (!target) return;

		this.enable(target.value);
		this.onClick && (await this.onClick(target.value));
	}

	enable(value: T[number]) {
		const id = `#radio-${value}`;
		const input = this.elt.querySelector<HTMLInputElement>(id);

		if (!input) return;

		this.buttons
			.filter(button => button.input !== input)
			.forEach(button => button.input.removeAttribute('disabled'));

		this.active = input;
		this.active.setAttribute('disabled', 'disabled');

		this.value = this.active.value;
	}

	disable() {
		for (const button of this.buttons) {
			button.input.setAttribute('disabled', 'disabled');
		}

		this.active = null;
		this.value = null;
	}
};