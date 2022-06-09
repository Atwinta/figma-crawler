const fs = require('fs');
const path = require('path');
const config = require('./lib/config');
const writeToken = require('./lib/write-token');
const tokensExt = 'tokens.json';
const getStylesArtboard = require('./lib/get-styles-artboard.js');

async function main() {
	console.log(`\n> Build tokens of file ${config.fileKey}. Go get a cup of coffee...`);

	const data = await getStylesArtboard(config);
	const output = config.output;

	config.clear && fs.existsSync(output) && fs.rmdirSync(output, { recursive: true });

	for (const category in data) {
		const token = data[category];
		const sets = token.sets;
		const tokenDir = path.join(output, category);

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
