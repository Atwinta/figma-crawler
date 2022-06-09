require('dotenv').config();
const argv = require('minimist')(process.argv.slice(2));
const env = process.env;
const fs = require('fs');
const path = require('path');
const configPath = path.resolve(argv['c'] || argv['config'] || 'figmacrawler.config.json');
const defaults = {
  fileKey: '',
  output: 'tokens',
  clear: false,
  type: 'files', // files|teams
  colorFormat: 'css',
  platformsMode: 'split', // split|join
  platformsOrder: [
    'desktop-large',
    'desktop',
    'tablet',
    'phone'
  ],
  filter: []
};
const config = ((cfg) => {
  if (!fs.existsSync(cfg))
    throw new Error(`Cannot load config from "${path.normalize(cfg)}", please check path.`);

  return Object.assign(defaults, require(cfg));
})(configPath);

config.figmaDevToken = env.FIGMA_DEV_TOKEN;

if (!config.figmaDevToken)
  throw new Error('Figma Dev Token not set. Set envoirement variable FIGMA_DEV_TOKEN in .env"');

config.fileKey = argv['f'] || argv['file-key'] || config.fileKey;

if (!config.fileKey)
  throw new Error('Figma file key (id) not set. Use argument "-i <figma-file-key>" or "--input <figma-file-key>"');

config.output = argv['o'] || argv['output'] || config.output;
config.platformsMode = argv['p'] || argv['platforms-mode'] || config.platformsMode;
config.type = argv['t'] || argv['type'] || config.type;
const filter = config.filter = [].concat(config.filter);

if (~filter.indexOf('button')) { // add button dependencies
  console.warn('\n> Filter: found `button`, will be added dependencies: `typography`, `text`, `color`, `effect`')

  ~filter.indexOf('typography') || filter.push('typography');
  ~filter.indexOf('text') || filter.push('text');
  ~filter.indexOf('color') || filter.push('color');
  ~filter.indexOf('effect') || filter.push('effect');
}

module.exports = config;
