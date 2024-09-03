import { isInstanceOf, sanitizeFilename } from "../utils.js";

import {
	actionRadios,
	uploadButton,
	uploadedList,
} from "../interface/elements.js";

import renderer from "./renderer.js";

export default {
	setup() {
		loadLocalStorage();

		actionRadios.onClick = function (value) {
			uploadedList.toggleRemovable();
		};

		uploadButton.input.addEventListener('change', async function () {
			if (!this.files || this.files.length === 0) {
				console.warn('Nothing selected');
				return;
			}

			const promises = promiseUploadedFiles(this.files);

			const entries = (await Promise.allSettled(promises))
				.filter(promise => promise.status === 'fulfilled')
				.map(promise => promise.value);

			for (const entry of entries) {
				const p5Image = renderer.get(entry);
				const key = entry[0];
				const url = p5Image.canvas.toDataURL();
				localStorage.setItem(key, url);
				createUploadedItem(key);
			}

			updateUploadRadios();
		});

		uploadedList.onRemove = async (item) => {
			if (!confirm('Do you really want to remove this image?')) {
				return true;
			}

			if (!isInstanceOf(item.firstElementChild, HTMLImageElement)) return;

			item.classList.add('removing');
			localStorage.removeItem(item.firstElementChild.alt);
			updateUploadRadios();
		};
	},
	isEmpty() {
		return uploadedList.items.length === 0;
	}
};

async function loadLocalStorage() {
	for (let i = 0; i < localStorage.length; i += 1) {
		const key = localStorage.key(i);
		const item = key && localStorage.getItem(key);

		if (!item) continue;

		const blob = await (await fetch(item)).blob();
		const bitmap = await createImageBitmap(blob);
		renderer.get([key, bitmap]);
		createUploadedItem(key);
	}

	updateUploadRadios();
}

function promiseUploadedFiles(files: FileList) {
	return Array.from(files)
		.map(async (file) => {
			const result: [string, ImageBitmap] = [
				sanitizeFilename(file.name),
				await createImageBitmap(file, {
					resizeHeight: renderer.bufferSize
				})
			];

			return result;
		});
}

function createUploadedItem(emoji: string) {
	const img = new Image();
	const item = uploadedList.createHiddenItem(img);

	img.onload = () => {
		uploadedList.showItem(item);
	};

	img.alt = emoji;
	img.src = renderer.getResizedDataUrl(emoji);
}

function updateUploadRadios() {
	if (
		uploadedList.items.length === 0 ||
		localStorage.length === 0
	) {
		actionRadios.disable();
		return;
	}

	if (uploadedList.isRemovable()) {
		actionRadios.enable('remove');
		return;
	}

	actionRadios.enable('select');
}