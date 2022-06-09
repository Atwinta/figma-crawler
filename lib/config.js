require('dotenv').config();
const argv = require('minimist')(process.argv.slice(2));
const env = process.env;
const fs = require('fs');
const path = require('path');
const configPath = path.resolve(argv['c'] || argv['config'] || 'figmacrawler.config.js');
const defaults = {
  fileKey: '',
  output: 'tokens',
  type: 'files', // files|teams
  platformsMode: 'split', // split|join
  colorFormat: 'css',
  platforms: [
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

module.exports = config;
