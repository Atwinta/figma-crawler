require('dotenv').config();

const fetch = require('node-fetch');
const fs = require('fs');

const headers = new fetch.Headers();
const devToken = process.env.DEV_TOKEN;
const fileKey = process.argv[2];

if (!devToken) {
  console.log('set DEV_TOKEN in .env');
  process.exit(0);
}

if (!fileKey) {
	console.log('Usage: node main.js <file-key>');
	process.exit(0);
}

const platforms = {
	design: process.env.DESIGN_PLATFORMS ? process.env.DESIGN_PLATFORMS.split(',') : [],
	themekit: process.env.THEMEKIT_PLATFORMS ? process.env.THEMEKIT_PLATFORMS.split(',') : []
};

const tokens = {
	type: 'tokens.json',
	typography: './tokens/typography',
	text: './tokens/components/text'
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

	const typographyTokenFile = `${tokens.typography}.${tokens.type}`;

	fs.writeFile(typographyTokenFile, JSON.stringify(data.typography), (err) => {
		if (err) console.log(err);

		console.log('> Token file written:', typographyTokenFile);
	});

	// text tokens
	for (const platform of platforms.design) {
		const i = platforms.design.indexOf(platform);
		const tokenFile = `${tokens.text}@${platforms.themekit[i]}.${tokens.type}`;

		fs.writeFile(tokenFile, JSON.stringify({ text: data.text[platform]}), (err) => {
			if (err) console.log(err);

			console.log('> Token file written:', tokenFile);
		});
	}
}

main().catch((err) => {
	console.error(err);
	console.error(err.stack);
});
