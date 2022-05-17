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
  return {
    "include": [
      "./tokens/typography.tokens.json",
      "./tokens/components/*@common.tokens.json"
    ],
    "source": [
      `./tokens/components/*@${platform}.tokens.json`
    ],
    "platforms": {
      "css": {
        "transformGroup": "web",
        "buildPath": `./themes/default/${platform}/`,
        "files": [{
          "destination": "root.css",
          "format": "css/variables",
          "options": {
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
