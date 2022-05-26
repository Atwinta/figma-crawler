const fetch = require('node-fetch');
const lodash = require('lodash');
const headers = new fetch.Headers();
const devToken = process.env.FIGMA_DEV_TOKEN;
headers.append('X-Figma-Token', devToken);

let type = 'files'; //process.argv[4] || 'files';

const getFiles = require('./get-files.js');
const getTeamsStyle = require('./get-teams-style.js')
const getFontStyles = require('./get-font-styles.js');
const getColorPlatte = require('./get-color-platte.js');
const getEffect = require('./get-effect.js');
// const getGrids = require('./get-grids.js');

const getTypography = require('./get-typography.js');
const getButton = require('./get-button.js');
const getNodeId = require('./get-node-id.js');

const componentsNames = [
	{ button: 'components / button' }
];

module.exports = async function(key, URLformat, colorFormat) {
	let figmaTreeStructure;
	let figmaId;
	let data = {
		typography: {},
		text: {},
		color: {},
		effect: {}
	};

	if (type === 'files') {
		figmaId = key;
		figmaTreeStructure = await getFiles(key, URLformat);
	} else if (type === 'teams') {
		figmaTreeStructure = await getTeamsStyle(key, URLformat);
	}

	const pages = figmaTreeStructure.document.children,
				typographyPage = pages.find(page => page.name.trim().toLowerCase() === 'tokens/typography'),
				buttonPage = pages.find(page => page.name.trim().toLowerCase() === 'component / button');

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

	const { styles, components } = figmaTreeStructure;
	const stylesArr = Array.isArray(styles) ? styles : Object.keys(styles);
	// const componentsArr = Array.isArray(components) ? components : Object.keys(components);

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

		if (styleType === 'fill') {
			const color = await getColorPlatte({
				node_id: node_id,
				file_key: figmaId
			}, URLformat, colorFormat);

			lodash.merge(data.color, color);
		}

		if (styleType === 'effect') {
			const effect = await getEffect({
				node_id: node_id,
				file_key: figmaId
			}, URLformat, colorFormat);

			lodash.merge(data.effect, effect);
		}
	}

	buttonPage && (data.button = await getButton(buttonPage, data));

	// console.log('componentsArr', componentsArr);
	// for (const item of componentsArr) {
	// 	// console.log('item', item);

	// 	// const name = item.name.trim().toLowerCase();

	// 	// if (name === 'button') {
	// 		const componentNode = await await getNodeId(item, figmaId, URLformat);

	// 		console.log('componentNode', componentNode);

	// 	// }
	// }

	return data;
}
