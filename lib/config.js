const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
const defaults = {
  colorFormat: 'css',
  platforms: [
    'desktop-large',
    'desktop',
    'tablet',
    'phone'
  ]
};

module.exports = function loadConfig(cfg) {
  if (!fs.existsSync(path.resolve(cfg)))
    throw new Error(`Cannot load config from "${path.normalize(cfg)}", please check path.`);

  return lodash.merge(defaults, require(cfg));
};
