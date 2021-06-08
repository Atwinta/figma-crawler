const fetch = require('node-fetch');
const headers = new fetch.Headers();
const devToken = process.env.FIGMA_DEV_TOKEN;
headers.append('X-Figma-Token', devToken);

let type = 'files'; //process.argv[4] || 'files';

const getFiles = require('./get-files.js');
const getTeamsStyle = require('./get-teams-style.js')
const getFontStyles = require('./get-font-styles.js');
// const getColorPlatte = require('./get-color-platte.js');
// const getGrids = require('./get-grids.js');
// const getEffect = require('./get-effect.js');

const getTypography = require('./get-typography.js');

module.exports = async function(key, URLformat) {
	let figmaTreeStructure;
	let figmaId;
	let data = {
		typography: {},
		text: {}
	};

	if (type === 'files') {
		figmaId = key;
		figmaTreeStructure = await getFiles(key, URLformat);
	} else if (type === 'teams') {
		figmaTreeStructure = await getTeamsStyle(key, URLformat);
	}

	const pages = figmaTreeStructure.document.children,
				typographyPage = pages.find(page => page.name.trim().toLowerCase() === 'tokens/typography');

	if (typographyPage) {
		const typographyFrame = typographyPage.children.find(frame => frame.name.trim().toLowerCase() === 'typography');
		const typographyBaseFrame = typographyFrame ?
			(typographyFrame.children || []).find(frame => frame.name.trim().toLowerCase() === 'typography/base') :
			null;

		if (!typographyBaseFrame) {
			console.log('Frame typography/base not fount in page tokens/typography');
			process.exit(0);
		}

		data.typography = await getTypography(typographyBaseFrame);
	}

	const { styles } = figmaTreeStructure;
	const stylesArr = Array.isArray(styles) ? styles : Object.keys(styles);

	for (const item of stylesArr) {
		let node_id = item;
		const styleType = type === 'files' ? styles[item].styleType.toLowerCase() : item.style_type.toLowerCase();

		if (type === 'teams') {
			node_id = item.node_id;
			figmaId = item.file_key;
		}

		if (styleType === 'text') {
			const text = await getFontStyles({
				node_id: node_id,
				file_key: figmaId
			}, URLformat);

			if (text) {
				const key = Object.keys(text)[0];

				data.text[key] || (data.text[key] = {});

				Object.assign(data.text[key], text[key]);
			}
		}
	}

	return data;
}
