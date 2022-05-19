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

function getStyleDictionaryConfig(platform) {
  const source = [
    `./tokens/components/*@${platform}.tokens.json`
  ];

  platform === 'common' && source.unshift("./tokens/typography.tokens.json");

  return {
    "source": source,
    "platforms": {
      "css": {
        "transformGroup": "web",
        "buildPath": `./themes/default/${platform}/`,
        "files": [{
          "destination": "root.css",
          "format": "css/variables",
          "options": {
            "fileHeader": () => [
              "Do not edit directly",
              "this file generated from tokens"
            ],
            "selector": ".theme_root_default"
          }
        }]
      }
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

console.log('\n==============================================');
console.log('\nBuild completed!');
