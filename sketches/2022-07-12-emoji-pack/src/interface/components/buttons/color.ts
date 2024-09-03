import { Where } from "../types.js";
import { BaseButton } from "./base.js";

const componentClass = 'color-picker';

export class ColorPickerButton extends BaseButton {
	public onChange: ((value: string) => Promise<void> | void) | null;

	public value: string;

	constructor(
		id: string,
		text: string,
		value: string,
		parent?: HTMLElement,
		where?: Where
	) {
		super(id, parent, where);
		this.elt.classList.add(componentClass);
		this.input.type = 'color';
		this.input.value = value;
		this.label.innerText = text;
		this.value = value;

		this.onChange = null;
		this.input.addEventListener('change', this._onChange.bind(this));
	}

	private _onChange() {
		this.value = this.input.value;
		this.onChange && this.onChange(this.value);
	}
}