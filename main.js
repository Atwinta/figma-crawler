require('dotenv').config();

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const env = process.env;

const headers = new fetch.Headers();
const devToken = env.FIGMA_DEV_TOKEN;
const tokensCfgPath = path.join(process.cwd(), 'tokens.config.js');
const fileKey = process.argv[2];
const tokensDir = process.argv[3] ? process.argv[3] : 'tokens';
const tokensExt = 'tokens.json';

if (!fs.existsSync(tokensCfgPath)) {
	console.warn('Config not found:', tokensCfgPath);
	process.exit(0);
}

if (!devToken) {
  console.log('set FIGMA_DEV_TOKEN in .env');
  process.exit(0);
}

if (!fileKey) {
	console.log('Usage: node main.js <file-key>');
	process.exit(0);
}

const tokensCfg = require(tokensCfgPath);
const platformsMap = tokensCfg.platformsMap;
const colorFormat = tokensCfg.colorFormat || 'css';

const getStylesArtboard = require('./lib/get-styles-artboard.js');

headers.append('X-Figma-Token', devToken);

let query = {
	url: {
		host: 'api.figma.com',
		protocol: 'https',
	}
};

async function main() {
	console.log(`> Build tokens of file ${fileKey}. Go get a cup of coffee...`);

	const data = await getStylesArtboard(fileKey, query.url, colorFormat);
	const dist = path.join(process.cwd(), tokensDir);

	fs.existsSync(dist) && fs.rmdirSync(dist, { recursive: true });

	for (const category in data) {
		const token = data[category];
		const tokenDir = path.join(dist, category);

		fs.existsSync(tokenDir) || fs.mkdirSync(tokenDir, { recursive: true });

		if (category === 'text') {
			for (const designPlatformName in platformsMap) {
				const filePlatformName = platformsMap[designPlatformName];
				const file = path.join(tokenDir, `${category}@${filePlatformName}.${tokensExt}`);
				const json = token[designPlatformName];

				json && fs.writeFile(file, JSON.stringify({ [category]: json }, null, 2), (err) => {
					err && console.log(err);

					console.log('> Token file written:', file);
				});
			}
		} else {
			const json = token;
			const sets = json.sets;

			if (sets) {
				for (const setName in sets) {
					const set = sets[setName];
					const file = path.join(tokenDir,`${category}@${setName}.${tokensExt}`);
					set && fs.writeFile(file, JSON.stringify({ [category]: set }, null, 2), (err) => {
						if (err) console.log(err);

						console.log('> Token file written:', file);
					});
				}
			} else {
				const file = path.join(tokenDir, `${category}.${tokensExt}`);
				json && fs.writeFile(file, JSON.stringify({ [category]: json }, null, 2), (err) => {
					if (err) console.log(err);

					console.log('> Token file written:', file);
				});
			}
		}
	}
}

main().catch((err) => {
	console.error(err);
	console.error(err.stack);
});
