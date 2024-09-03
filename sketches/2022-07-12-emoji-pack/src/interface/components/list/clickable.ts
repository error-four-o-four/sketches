import type { Where } from "../types.js";
import { BaseList } from "./base.js";

export class ClickableList extends BaseList {
	public onClick: ((item: HTMLLIElement) => Promise<void> | void) | null;

	constructor(parent?: HTMLElement, where?: Where) {
		super(parent, where);

		this.onClick = null;
		this.elt.addEventListener('click', this._onclick.bind(this));
	}

	protected async _onclick(e: MouseEvent) {
		const item = this._getTargetItem(e.target);

		if (!item) return;

		this.onClick && (await this.onClick(item));
	}
}