require('dotenv').config();
const defaults = {
  config: 'figmacrawler.config.js',
  output: 'tokens',
  mode: 'split'
};
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const env = process.env;
const figmaDevToken = env.FIGMA_DEV_TOKEN || argv['figma-dev-token'];
const fileKey = argv['i'] || argv['input'];
const mode = argv['m'] || argv['mode'] || defaults.mode;
let output = argv['o'] || argv['output'];
let config = argv['c'] || argv['config'];

if (!figmaDevToken)
  throw new Error('Figma Dev Token not set. Set FIGMA_DEV_TOKEN in .env or use argument "--figma-dev-token <YOUR_FIGMA_DEV_TOKEN>"');

if (!fileKey)
  throw new Error('Figma file key (id) not set. Use argument "-i <figma-file-key>" or "--input <figma-file-key>"');

if (!config) {
  config = path.resolve(defaults.config);
  console.warn(`\n> Config path not set. Try use ${config} if is exist.`);
} else {
  config = path.resolve(config);
}

if (!output) {
  output = path.resolve(defaults.output);
  console.warn(`\n> Output path not set. Will be use ${output} if is exist.`);
} else {
  output = path.resolve(output);
}

module.exports = params = {
  fileKey,
  output,
  figmaDevToken,
  config,
  mode
};
