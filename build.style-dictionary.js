const path = require('path');
const fs = require('fs');
const StyleDictionaryPackage = require('style-dictionary');
const figmacrawlerConfigPath = path.join(process.cwd(), 'figmacrawler.config.js');

if (!fs.existsSync(figmacrawlerConfigPath)) {
  console.warn('Figmacrawler config not found:', figmacrawlerConfigPath);
  process.exit(0);
}

const figmacrawlerConfig = require(figmacrawlerConfigPath);

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
            "selector": ".theme_root_default",
            "useAliasVariables": true
          }
        }]
      }
    }
  };
}

console.log('Build started...');

figmacrawlerConfig.platforms.map(platform => {
  console.log('\n==============================================');
  console.log(`\nProcessing: [${platform}]`);

  const StyleDictionary = StyleDictionaryPackage.extend(getStyleDictionaryConfig(platform));

  StyleDictionary.buildAllPlatforms();

  console.log('\nEnd processing');
});

console.log('\n==============================================');
console.log('\nBuild completed!');
