import type { Where } from "../types.js";
import { BaseButton } from "./base.js";

const componentClass = 'toggle-button';

export class ToggleButton<T extends Readonly<Array<string>>> extends BaseButton {
	private index: number;
	private values: T;
	public value: T[number];

	public onClick: ((value: T[number]) => Promise<void> | void) | null;

	constructor(
		values: T,
		parent?: HTMLElement,
		where?: Where
	) {
		const id = `toggle-${values.join('-')}`;
		super(id, parent, where);
		this.elt.classList.add(componentClass);

		this.index = 0;
		this.values = values;
		this.value = values[this.index];

		this.label.innerText = this.value;
		this.onClick = null;

		this.input.type = 'button';
		this.input.value = this.value;
		this.input.addEventListener('click', this._onClick.bind(this));
	}

	set(value: T[number]) {
		const index = this.values.indexOf(value);

		if (index < 0 || index >= this.values.length) return;

		this.index = index;
		this.value = value;
		this.input.value = this.value;
		this.label.innerText = this.value;
	}

	private _onClick(e: MouseEvent) {
		if (e.target !== this.input) return;

		this.index = (this.index + this.values.length + 1) % this.values.length;
		this.value = this.values[this.index];
		this.input.value = this.value;
		this.label.innerText = this.value;

		this.onClick && this.onClick(this.value);
	}
}