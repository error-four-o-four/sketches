import type { Where } from "../types.js";
import { BaseButton } from "./base.js";

const componentClass = 'trigger-button';

export class TriggerButton extends BaseButton {
	public onClick: (() => Promise<void> | void) | null;

	constructor(
		id: string,
		text: string,
		parent?: HTMLElement,
		where?: Where
	) {
		super(id, parent, where);
		this.elt.classList.add(componentClass);
		this.input.type = 'button';
		this.label.innerText = text;

		this.onClick = null;
		this.input.addEventListener('click', this._onClick.bind(this));
	}

	private _onClick() {
		this.onClick && this.onClick();
	}
}