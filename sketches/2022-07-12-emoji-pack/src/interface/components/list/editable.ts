import { delay } from "../../../utils.js";
import type { Where } from "../types.js";
import { BaseList } from "./base.js";

const classList = {
	removable: 'removable',
	hidden: 'hidden',
};

export class EditableList extends BaseList {
	public onClick: ((item: HTMLLIElement) => Promise<void> | void) | null;
	public onRemove: ((item: HTMLLIElement) => Promise<boolean | void> | boolean | void) | null;

	constructor(parent?: HTMLElement, where?: Where) {
		super(parent, where);

		this.onClick = null;
		this.onRemove = null;
		this.elt.addEventListener('click', this._onclick.bind(this));
	}

	protected async _onclick(e: MouseEvent) {
		const item = this._getTargetItem(e.target);

		if (!item) return;

		if (this.isRemovable() && typeof this.onRemove === 'function') {
			const aborted = await this.onRemove(item);

			if (aborted) return;
		}

		if (this.isRemovable()) {
			this.removeListItem(item);
			return;
		}

		this.onClick && (await this.onClick(item));
	}

	isRemovable() {
		return this.elt.classList.contains(classList.removable);
	}

	async toggleRemovable() {
		if (this.isRemovable()) {
			this.items.forEach(item => item.classList.remove(classList.removable));
			await delay(300);
			this.elt.classList.remove(classList.removable);
			return;
		}

		this.elt.classList.add(classList.removable);
		await delay(100);
		this.items.forEach(item => item.classList.add(classList.removable));
	}

	createHiddenItem(...args: Parameters<typeof this.createItem>) {
		const item = this.createItem(...args);
		item.classList.add(classList.hidden);

		if (this.isRemovable()) {
			item.classList.add(classList.removable);
		}

		return item;
	}

	async showItem(item: HTMLLIElement) {
		item.classList.remove(classList.hidden);
		return delay(300);
	}

	async removeListItem(item: HTMLLIElement) {
		const index = this.items.indexOf(item);

		if (index < 0) return;

		this.items.splice(index, 1);
		item.classList.add(classList.hidden);

		await delay(300);

		item.remove();
	}
}