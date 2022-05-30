const lodash = require('lodash');
const path = require('path');
const fs = require('fs');
const StyleDictionaryPackage = require('style-dictionary');
const tokensCfgPath = path.join(process.cwd(), 'tokens.config.js');

if (!fs.existsSync(tokensCfgPath)) {
  console.warn('Tokens config not found:', tokensCfgPath);
  process.exit(0);
}

const tokensCfg = require(tokensCfgPath);
const platformsMap = tokensCfg.platformsMap;
const colorTokensPath = path.join(__dirname, 'tokens', 'color');
const colorTokensRegex = /\@([a-z0-9]+)\.tokens\.json/gi;
const colorGroup = ['color', 'effect'];
const cssParams = {
  transforms: ['attribute/cti', 'name/cti/kebab'],
  files: [{
    format: 'css/variables',
    options: {
      fileHeader: () => [
        'Do not edit directly',
        'this file generated from tokens'
      ],
      outputReferences: true
    }
  }]
};

function getStyleDictionaryConfig(platform) {
  const buildPath = `./themes/default/${platform}/`;

  const source = platform === 'common' ? [
    `./tokens/**/!(*@*).tokens.json`
  ] : [];

  source.push(`./tokens/**/*@${platform}.tokens.json`);

  return {
    source: source,
    platforms: {
      'css': lodash.merge({ buildPath }, cssParams, {
        files: [{
          destination: 'root.css',
          options: {
            selector: '.theme_root_default'
          },
          filter: token => {
            return colorGroup.indexOf(token.group) < 0;
          }
        }]
      }),

      'css/color': lodash.merge({ buildPath }, cssParams, {
        files: [{
          destination: 'color.css',
          options: {
            selector: '.theme_color_default'
          },
          filter: token => {
            return ~colorGroup.indexOf(token.group);
          }
        }]
      })
    }
  };
}

console.log('Build started...');

for (const designName in platformsMap) {
  const platform = platformsMap[designName];
  console.log('\n==============================================');
  console.log(`\nProcessing: [${platform}]`);

  const StyleDictionary = StyleDictionaryPackage.extend(getStyleDictionaryConfig(platform));

  StyleDictionary.buildAllPlatforms();

  console.log('\nEnd processing');
}

fs.readdir(colorTokensPath, (err, files) => {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }

  files.forEach(file => {
    const matches = new RegExp(colorTokensRegex).exec(file);
    const colorType = matches ? matches[1] : '';

    if (colorType && colorType !== 'common') {
      console.log('\n==============================================');
      console.log(`\nProcessing: [color ${colorType}]`);

      StyleDictionaryPackage.extend({
        source: [
          `./tokens/color/${file}`
        ],
        platforms: {
          'css/color/override': lodash.merge({}, cssParams, {
            buildPath: './themes/default/common/',
            files: [{
              destination: `color_override_${colorType}.css`,
              options: {
                selector: `.theme__color_override_${colorType}`
              },
              filter: token => {
                return ~colorGroup.indexOf(token.group);
              }
            }]
          })
        }
      }).buildAllPlatforms();

      console.log('\nEnd processing');
    }
  });


  console.log('\n==============================================');
  console.log('\nBuild completed!');
});
