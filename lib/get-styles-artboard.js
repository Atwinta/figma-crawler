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
module.exports = async ({ fileKey, type, platformsOrder, platformsMode, filter }) => {
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
	const items = {};
	// const componentsArr = Array.isArray(components) ? components : Object.keys(components);

	for (const item of stylesArr) {
		const meta = typeIsFiles ? styles[item] : item;
		const styleType = (typeIsFiles ? meta.styleType : meta.style_type).toLowerCase();
		const node = { id: item, fileKey: figmaId, meta: meta };

		if (typeIsTeam) {
			node.id = item.node_id;
			node.fileKey = item.file_key;
		}

		items[styleType] || (items[styleType] = {});
		items[styleType][node.fileKey] || (items[styleType][node.fileKey] = []);
		items[styleType][node.fileKey].push(node);
	}

	for (const key in items) {
		const nodesGroup = items[key];

		if (Object.entries(nodesGroup).length) {
			if (key === 'text' && isAllowed('text')) {
				const text = await fontStyle.getTokens(nodesGroup);
				data.text || (data.text = {});
				lodash.merge(data.text, text);

			} else if (key === 'fill' && isAllowed('color')) {
				const color = await getColorPlatte(nodesGroup);
				data.color || (data.color = {});
				lodash.merge(data.color, color);

			} else if (key === 'effect' && isAllowed('effect')) {
				const effect = await getEffect(nodesGroup);
				data.effect || (data.effect = {});
				lodash.merge(data.effect, effect);

			} else if (key === 'grid' && isAllowed('grid')) {
				const grid = await getGrid(nodesGroup);
				data.grid || (data.grid = {});
				lodash.merge(data.grid, grid);
			}
		}
	}

	if (isAllowed('button')) {
		const buttonPage = pages.find(page => page.name.trim().toLowerCase() === 'component / button');

		if (buttonPage) {
			const buttonData = await getButton({ fileKey, page: buttonPage, data });
			const buttonRefs = buttonData.references;
			buttonRefs && data.references || (data.references = {});
			data.button = buttonData.button;
			lodash.merge(data.references, buttonData.references);
		}
	}

	['text', 'button', 'grid'].forEach(el => {
		let elSets = (data[el] || {}).sets || {};

		if (Object.entries(elSets).length) {
			elSets = data[el].sets = sets.intersectSets(elSets);
			isJoinplatformsMode && (data[el].sets = sets.subtractSets(elSets, platformsOrder));
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
