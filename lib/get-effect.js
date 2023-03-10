const naming = require('./naming.js');
const getNodes = require('./get-nodes');
const { colorFormat } = require('./config');
const Color = require('./color');
const lodash = require('lodash');

const getItem = (document) => {
	const name = naming(document.name, true);
	const nameArr = name.split('/');
	const effect = document.effects[0];

	if (effect.type.trim().toLowerCase().indexOf('shadow') === -1)
		return;

	const item = {};
	const offset = effect.offset;
	const value = {
		value: [
			`${offset.x || 0}px`,
			`${offset.y || 0}px`,
			`${effect.radius || 0}px`,
			`${effect.spread || 0}px`,
			new Color(effect.color)[colorFormat]
		].join(' '),
		group: 'effect'
	};

	if (nameArr.length > 1) {
		nameArr.reduce((acc, cur, i, arr) => {
			const val = i + 1 === arr.length ? value : {};

			cur.indexOf(',') > -1 ?
				cur.split(',').forEach(item => acc[item] = val) :
				acc[cur] = val;

			return val;
		}, item);
	} else {
		item[name] = value;
	}

	return item;
}

/**
 *
 * @param {Object} nodesGroup
 * @param {Array} nodes[fileKey] nodes
 */
module.exports = async (nodesGroup) => {
	const result = {};

	for (const fileKey in nodesGroup) {
		const nodes = nodesGroup[fileKey];
		const responseNodes = await getNodes({
      fileKey,
      nodeIds: nodes.map(el => el.id)
    });

		for (const id in responseNodes) {
			const element = responseNodes[id];
			const item = getItem(element.document);
			item && lodash.merge(result, item);
		}
	}

	return { shadow: result };
}
