# Sketches

### cli options

use `npm create -- foo` to create a new sketch based on this [template](./sketches/template/)

additionally pass `--from <sketch-folder>` to copy a new sketch from an existing

### dev

use `npm run dev -w foo` to work on a single sketch

### build

use `npm run build -w foo` to create a start point for a new sketch on [open processing](https://openprocessing.org/)

update included [sketches](./scripts/build/config.ts) to add a sketch to the deployed files

use `npm run preview` to test deployed files locally