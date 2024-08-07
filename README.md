# [Sketches](https://error-four-o-four.github.io/sketches/)

A hotchpotch (monorepo) of p5.js sketches

## cli commands

#### `npx create`

use `npx create foo` to create a new sketch based on this [template](./templates/instance)

#### options
* pass a \<workspace-name\> as the first positional argument or use `--name <workspace-name>` (alias: `-n`)
* either use `--tmpl <'global' | 'instance'>` to choose a specific template (alias: `-t`)
* or use `--source <sketch-folder>` to use an existing sketch as a template (alias: `--src`, `-s`)

#### `npx fetch`

use `npx fetch foo@1.0.0` to download a specific library from [cdnjs](https://cdnjs.com/)

## development

use `npm run dev -w foo` to work on a single sketch

## production

use `npm run build -w foo` to create a start point for a new sketch on [open processing](https://openprocessing.org/)

use `npm run build` to bundle the files, which will be deployed to github\
update included [sketches](./scripts/build/config.ts) to specify the deployed files\
use `npm run preview` to test deployed files locally