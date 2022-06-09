const lodash = require('lodash');
const getFile = require('./get-file');
const getTeamsStyle = require('./get-teams-style')
const fontStyle = require('./font-style');
const getColorPlatte = require('./get-color-platte');
const getEffect = require('./get-effect');
const sets = require('./sets');
const getGrid = require('./get-grid');
const getTypography = require('./get-typography');
const getButton = require('./get-button');

// const componentsNames = [
// 	{ button: 'components / button' }
// ];

/**
 * @param {Object} config
 * @returns {Object}
 */
module.exports = async ({ fileKey, type, platforms, platformsMode, filter }) => {
	const isAllowed = (category) => {
		if (!filter.length)
			return true;

		return filter.indexOf(category) > -1;
	};
	const data = {};
	const typeIsFiles = type === 'files';
	const typeIsTeam = type === 'team';
	const isJoinplatformsMode = platformsMode === 'join';
	let figmaTreeStructure;
	let figmaId;

	if (typeIsFiles) {
		figmaId = fileKey;
		figmaTreeStructure = await getFile(fileKey);
	} else if (typeIsTeam) {
		figmaTreeStructure = await getTeamsStyle(fileKey);
	}

	const pages = figmaTreeStructure.document.children;

	if (isAllowed('typography')) {
		const typographyPage = pages.find(page => page.name.trim().toLowerCase() === 'tokens/typography');

		if (typographyPage) {
			const typographyFrame = typographyPage.children.find(frame => frame.name.trim().toLowerCase() === 'typography');
			const typographyBaseFrame = typographyFrame ?
				(typographyFrame.children || []).find(frame => frame.name.trim().toLowerCase() === 'typography/base') :
				null;

			typographyBaseFrame ?
				data.typography = await getTypography(typographyBaseFrame) :
				console.warn('\n> Frame typography/base not fount in page tokens/typography');
		}
	}

	const { styles, components } = figmaTreeStructure;
	const stylesArr = Array.isArray(styles) ? styles : Object.keys(styles);
	// const componentsArr = Array.isArray(components) ? components : Object.keys(components);

	for (const item of stylesArr) {
		const node = { nodeId: item, fileKey: figmaId };
		const styleItem = typeIsFiles ? styles[item] : item;
		const styleType = (typeIsFiles ? styleItem.styleType : styleItem.style_type).toLowerCase();

		if (typeIsTeam) {
			node.nodeId = item.node_id;
			node.fileKey = item.file_key;
		}

		if (isAllowed('text') && styleType === 'text') {
			const textPath = fontStyle.getPath(styleItem.name);

			data.text || (data.text = {});

			// skip if this style already exits [weight or italic versions]
			if (textPath && !lodash.hasIn(data.text, `sets.${textPath.set}.${textPath.name}`)) {
				const text = await fontStyle.getToken({ path: textPath, node });

				lodash.merge(data.text, text);
			}
		} else if (isAllowed('color') && styleType === 'fill') {
			const color = await getColorPlatte(node);

			data.color || (data.color = {});

			lodash.merge(data.color, color);

		} else if (isAllowed('effect') && styleType === 'effect') {
			const effect = await getEffect(node);

			data.effect || (data.effect = {});

			lodash.merge(data.effect, effect);

		} else if (isAllowed('grid') && styleType === 'grid') {
			const grid = await getGrid(node);

			data.grid || (data.grid = {});

			lodash.merge(data.grid, grid);
		}
	}

	if (isAllowed('button')) {
		const buttonPage = pages.find(page => page.name.trim().toLowerCase() === 'component / button');

		if (buttonPage) {
			const buttonData = await getButton({ fileKey, page: buttonPage, data });
			data.button = buttonData.button;
			lodash.merge(data.references, buttonData.references);
		}
	}

	['text', 'button', 'grid'].forEach(el => {
		let elSets = (data[el] || {}).sets || {};

		if (Object.entries(elSets).length) {
			elSets = data[el].sets = sets.intersectSets(elSets);
			isJoinplatformsMode && (data[el].sets = sets.subtractSets(elSets, platforms));
		}
	});

	// console.log('componentsArr', componentsArr);
	// for (const item of componentsArr) {
	// 	// console.log('item', item);

	// 	// const name = item.name.trim().toLowerCase();

	// 	// if (name === 'button') {
	// 		const componentNode = await await getNodes({ nodeIds: item, fileKey: figmaId });

	// 		console.log('componentNode', componentNode);

	// 	// }
	// }

	return data;
}
