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

const tokens = {
	type: 'tokens.json',
	baseDir: tokensDir,
	base: [
		'typography'
	],
	components: [
		'text'
	]
};

const getStylesArtboard = require('./lib/get-styles-artboard.js');

headers.append('X-Figma-Token', devToken);

let query = {
	url: {
		host: 'api.figma.com',
		protocol: 'https',
	}
}

async function main() {
	console.log(`> Build tokens of file ${fileKey}. Go get a cup of coffee...`);

	const data = await getStylesArtboard(fileKey, query.url);

	const baseDir = path.join(process.cwd(), tokens.baseDir);

	fs.existsSync(baseDir) && fs.rmdirSync(baseDir, { recursive: true });

	['base', 'components'].forEach(type => {
		const dirPath = path.join(baseDir, type === 'components' ? 'components' : '');

		fs.existsSync(dirPath) || fs.mkdirSync(dirPath, { recursive: true });

		tokens[type].forEach(component => {
			const basePath = path.join(dirPath, component);

			if (component === 'text') {
				for (const designPlatformName in platformsMap) {
					const filePlatformName = platformsMap[designPlatformName];
					const file = `${basePath}@${filePlatformName}.${tokens.type}`;
					const json = data[component][designPlatformName];

					json && fs.writeFile(file, JSON.stringify({ [component]: json }, null, 2), (err) => {
						err && console.log(err);

						console.log('> Token file written:', file);
					});
				}
			} else {
				const file = `${basePath}.${tokens.type}`;
				const json = data[component];

				json && fs.writeFile(file, JSON.stringify({ [component]: json }, null, 2), (err) => {
					if (err) console.log(err);

					console.log('> Token file written:', file);
				});
			}
		});
	});
}

main().catch((err) => {
	console.error(err);
	console.error(err.stack);
});
