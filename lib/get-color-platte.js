const naming = require('./naming');
const getNodes = require('./get-nodes');
const { colorFormat, colorTailwind } = require('./config');
const Color = require('./color');
const lodash = require('lodash');
const objects = require('./objects');

const getItem = (document) => {
	const result = { common: {} };

	if (document.name.trim().indexOf('#') === 0) {
		console.log(`Skip ${document.name} ${document.id}: name start from #`);
		return result;
	}

	const name = naming(document.name, true);
	const nameArr = name.split('/');
	const fill = document.fills[0];

	if (fill.type.toLowerCase() !== 'solid')
		return result;

	const { r, g, b, a } = fill.color;
	const opacity = typeof fill.opacity !== 'undefined' ?  fill.opacity : a;
	const color = new Color({ r, g, b, a: opacity });
	const colorTailwindValue = colorTailwind && opacity === 1 ? {
		value: color.tailwind,
		group: 'color'
	} : null;
	const value = {
		value: color[colorFormat],
		group: 'color'
	};

	let path = '';

	if (nameArr.length > 1) {
		nameArr.reduce((acc, cur, i, arr) => {
			const isFirst = i === 0;
			const isLast = i + 1 === arr.length;
			const isSetName = cur.indexOf('@') === 0;
			const el = isLast ? value : {};

			if (isFirst) {
				isSetName ?
					acc[`${cur.substring(1)}`] = el :
					acc.common[cur] = el;
			} else {
				isSetName && (path = `${objects.getPath(result)}.${cur}`);

				if (cur.indexOf(',') > -1) { // одинаковые цвета для разных состояний
					cur.split(',').forEach(item => {
						acc[item] = el;
						isLast && colorTailwindValue && (acc[`${item}-tailwind`] = colorTailwindValue);
					});
				} else {
					acc[cur] = el;
					isLast && colorTailwindValue && (acc[`${cur}-tailwind`] = colorTailwindValue);
				}
			}

			return el;
		}, result);
	} else {
		result.common[name] = value;
	}

	if (path) {
		const value = lodash.get(result, path);
		const splittedPath = path.split('.@');

		lodash.unset(result, path);
		return lodash.set(result, splittedPath[0].replace(/^common/i, splittedPath[1]), value);
	}

	return result;
}

/**
 *
 * @param {Object} nodesGroup
 * @param {Array} nodes[fileKey] nodes
 */
module.exports = async (nodesGroup) => {
	const result = { sets: { common: {} } };

	for (const fileKey in nodesGroup) {
		const nodes = nodesGroup[fileKey];
		const responseNodes = await getNodes({
      fileKey,
      nodeIds: nodes.map(el => el.id)
    });

		for (const id in responseNodes) {
			const element = responseNodes[id];

			element.document.visible === false ||
				lodash.merge(result.sets, getItem(element.document));
		}
	}

	return result;
}
