import { assertInstanceOf } from "../utils.js";

import data from "../emoji/data.js";

import { Tabs } from "./components/tabs.js";
import { RadioButtons } from "./components/buttons/radios.js";
import { ToggleButton } from "./components/buttons/toggle.js";
import { TriggerButton } from "./components/buttons/trigger.js";
import { ColorPickerButton } from "./components/buttons/color.js";
import { ClickableList } from "./components/list/clickable.js";
import { EditableList } from "./components/list/editable.js";

import './elements.css';

const idents = {
	canvasWrap: 'wrapper',
	controls: 'sketch-controls',
	upload: 'image-picker',
	emojis: 'emoji-picker',
} as const;

const parents = (Object.keys(idents) as (keyof typeof idents)[])
	.reduce((all, key) => {
		const elt = document.getElementById(idents[key]);
		assertInstanceOf(elt, HTMLDivElement);
		return {
			...all,
			[key]: elt,
		};
	}, {} as Record<keyof typeof idents, HTMLDivElement>);

export const { canvasWrap } = parents;

const wrapSelector = '.inputs-wrap';

// #sketch-controls

const sketchControlsWrap = parents.controls.querySelector(wrapSelector);
assertInstanceOf(sketchControlsWrap, HTMLDivElement);

export const loopButton = new ToggleButton(
	['play', 'pause'] as const,
	sketchControlsWrap
);

export const refreshButton = new TriggerButton(
	'button-refresh',
	'refresh',
	sketchControlsWrap
);

export const backgroundButton = new ColorPickerButton(
	'button-background',
	'background',
	'#101010',
	sketchControlsWrap
);

export const shuffleButton = new TriggerButton(
	'button-shuffle',
	'shuffle',
	sketchControlsWrap
);

export const saveButton = new TriggerButton(
	'button-save',
	'save',
	sketchControlsWrap
);

export const selectedList = new EditableList(sketchControlsWrap);

// #image-picker

const uploadImageWrap = parents.upload.querySelector(wrapSelector);
assertInstanceOf(uploadImageWrap, HTMLDivElement);

export const uploadButton = new TriggerButton(
	'button-upload',
	'upload',
	uploadImageWrap
);

uploadButton.input.type = 'file';
uploadButton.input.setAttribute('multiple', 'multiple');
uploadButton.input.setAttribute('accept', 'image/png,image/jpeg');

export const actionRadios = new RadioButtons(
	['select', 'remove'] as const,
	uploadImageWrap
);

export const uploadedList = new EditableList(uploadImageWrap);

// #emoji-picker

export const emojiLists = createEmojiLists();

const emojiListElts = emojiLists.map(list => list.elt);
export const tabs = new Tabs(emojiListElts, parents.emojis);

function createEmojiLists() {
	const amount = 120;
	const lists: ClickableList[] = [];

	for (let i = 0; i < data.length; i += amount) {
		const list = new ClickableList();

		for (let j = i; j < Math.min(i + amount, data.length); j += 1) {
			list.createItem(data[j]);
		}
		lists.push(list);
	}

	return lists;
}