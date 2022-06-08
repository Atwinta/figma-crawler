const lodash = require('lodash');
const getFiles = require('./get-files');
const getTeamsStyle = require('./get-teams-style')
const fontStyle = require('./font-style');
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
 * @param {Object} data
 * @param {String} data.fileKey Figma file key (id)
 * @param {Object} data.URLformat
 * @param {String} data.URLformat.host
 * @param {String} data.URLformat.protocol
 * @param {Object} data.config
 * @param {Object} data.headers
 * @returns {Object}
 */
module.exports = async ({ fileKey, URLformat, config, params, headers }) => {
	const colorFormat = config.colorFormat;
	const typeIsFiles = type === 'files';
	const isJoinMode = params.mode === 'join';
	let figmaTreeStructure;
	let figmaId;
	const data = {
		references: {},
		typography: {},
		text: {},
		color: {},
		effect: {},
		grid: {}
	};

	if (typeIsFiles) {
		figmaId = fileKey;
		figmaTreeStructure = await getFiles(fileKey, URLformat, headers);
	} else if (type === 'teams') {
		figmaTreeStructure = await getTeamsStyle(fileKey, URLformat, headers);
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
		const styleItem = typeIsFiles ? styles[item] : item;
		const styleType = (typeIsFiles ? styleItem.styleType : styleItem.style_type).toLowerCase();

		if (type === 'teams') {
			node_id = item.node_id;
			figmaId = item.file_key;
		}

		if (styleType === 'text') {
			const textPath = fontStyle.getPath(styleItem.name);

			// skip if this style already exits [weight or italic versions]
			if (textPath && !lodash.hasIn(data.text, `sets.${textPath.set}.${textPath.name}`)) {
				const text = await fontStyle.getToken({
					path: textPath,
					item: { node_id, file_key: figmaId },
				 	URLformat,
					headers
				});

				lodash.merge(data.text, text);
			}
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

	if (buttonPage) {
		const buttonData = await getButton(fileKey, URLformat, buttonPage, data, headers);
		data.button = buttonData.button;
		lodash.merge(data.references, buttonData.references);
	}

	['text', 'button', 'grid'].forEach(el => {
		let elSets = data[el].sets || {};

		if (Object.entries(elSets).length) {
			elSets = data[el].sets = sets.intersectSets(elSets);
			isJoinMode && (data[el].sets = sets.subtractSets(elSets, config.platforms));
		}
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
