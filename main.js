const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const params = require('./lib/params');
const loadConfig = require('./lib/config');
const writeToken = require('./lib/write-token');
const headers = new fetch.Headers();
const fileKey = params.fileKey;
const tokensExt = 'tokens.json';
const config = loadConfig(params.config);
const getStylesArtboard = require('./lib/get-styles-artboard.js');
const query = {
	url: {
		host: 'api.figma.com',
		protocol: 'https',
	}
};

headers.append('X-Figma-Token', params.figmaDevToken);

async function main() {
	console.log(`\n> Build tokens of file ${fileKey}. Go get a cup of coffee...`);

	const data = await getStylesArtboard({ fileKey, URLformat: query.url, config, params, headers });
	const dist = params.output;

	fs.existsSync(dist) && fs.rmdirSync(dist, { recursive: true });

	for (const category in data) {
		const token = data[category];
		const sets = token.sets;
		const tokenDir = path.join(dist, category);

		if (Object.entries(category || {}).length) {
			fs.existsSync(tokenDir) || fs.mkdirSync(tokenDir, { recursive: true });

			if (sets) {
				for (const setName in sets) {
					const set = sets[setName];
					const file = path.join(tokenDir,`${category}@${setName}.${tokensExt}`);
					writeToken(file, { [category]: set });
				}
			} else {
				const file = path.join(tokenDir, `${category}.${tokensExt}`);
				writeToken(file, category === 'references' ? token : { [category]: token });
			}
		}
	}
}

main().catch((err) => {
	console.error(err);
	console.error(err.stack);
});
