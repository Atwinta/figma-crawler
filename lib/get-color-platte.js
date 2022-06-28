const naming = require('./naming');
const getNodes = require('./get-nodes');
const { colorFormat } = require('./config');
const Color = require('./color');
const lodash = require('lodash');

const getItem = (document) => {
	const result = { common: {} };
	const name = naming(document.name, true);
	const nameArr = name.split('/');
	const fill = document.fills[0];

	if (fill.type.toLowerCase() !== 'solid')
		return result;

	const { r, g, b, a } = fill.color;
	const opacity = typeof fill.opacity !== 'undefined' ?  fill.opacity : a;
	const value = {
		value: new Color({ r, g, b, a: opacity })[colorFormat],
		group: 'color'
	};

	if (nameArr.length > 1) {
		nameArr.reduce((acc, cur, i, arr) => {
			const el = i + 1 === arr.length ? value : {};
			return i === 0 ?
				cur.indexOf('@') === 0 ?
					acc[`${cur.substring(1)}`] = el :
					acc.common[cur] = el :
				acc[cur] = el;
		}, result);
	} else {
		result.common[name] = value;
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
