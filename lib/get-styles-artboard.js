const lodash = require('lodash');
const getFiles = require('./get-files');
const getTeamsStyle = require('./get-teams-style')
const getFontStyles = require('./get-font-styles');
const getColorPlatte = require('./get-color-platte');
const getEffect = require('./get-effect');
const sets = require('./sets');
const getGrid = require('./get-grid');

const getTypography = require('./get-typography');
const getButton = require('./get-button');
// const getNodeId = require('./get-node-id');
const type = 'files'; //process.argv[4] || 'files';

// const componentsNames = [
// 	{ button: 'components / button' }
// ];

/**
 *
 * @param {String} key Figma file key (id)
 * @param {Object} URLformat
 * @param {String} URLformat.host
 * @param {String} URLformat.protocol
 * @param {Object} config
 * @param {Object} headers
 * @returns
 */
module.exports = async function(key, URLformat, { colorFormat, platforms }, headers) {
	let figmaTreeStructure;
	let figmaId;
	const data = {
		typography: {},
		text: {},
		color: {},
		effect: {},
		grid: {}
	};

	if (type === 'files') {
		figmaId = key;
		figmaTreeStructure = await getFiles(key, URLformat, headers);
	} else if (type === 'teams') {
		figmaTreeStructure = await getTeamsStyle(key, URLformat, headers);
	}

	const pages = figmaTreeStructure.document.children,
				typographyPage = pages.find(page => page.name.trim().toLowerCase() === 'tokens/typography'),
				buttonPage = pages.find(page => page.name.trim().toLowerCase() === 'component / button');

	if (typographyPage) {
		const typographyFrame = typographyPage.children.find(frame => frame.name.trim().toLowerCase() === 'typography');
		const typographyBaseFrame = typographyFrame ?
			(typographyFrame.children || []).find(frame => frame.name.trim().toLowerCase() === 'typography/base') :
			null;

		typographyBaseFrame ?
			data.typography = await getTypography(typographyBaseFrame) :
			console.warn('\n> Frame typography/base not fount in page tokens/typography');
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
			}, URLformat, headers);

			lodash.merge(data.text, text);

		} else if (styleType === 'fill') {
			const color = await getColorPlatte({
				node_id: node_id,
				file_key: figmaId
			}, URLformat, colorFormat, headers);

			lodash.merge(data.color, color);

		} else if (styleType === 'effect') {
			const effect = await getEffect({
				node_id: node_id,
				file_key: figmaId
			}, URLformat, colorFormat, headers);

			lodash.merge(data.effect, effect);

		} else if (styleType === 'grid') {
			const grid = await getGrid({
				node_id: node_id,
				file_key: figmaId
			}, URLformat, headers);

			lodash.merge(data.grid, grid);
		}
	}

	buttonPage && (data.button = await getButton(key, URLformat, buttonPage, data, headers));

	['text', 'button', 'grid'].forEach(el => {
		const elSets = data[el].sets || {};
		Object.entries(elSets) && (data[el].sets = sets.subtractSets(elSets, platforms));
	});

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
