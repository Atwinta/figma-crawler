const naming = require('./naming.js');
const getNodes = require('./get-nodes');
const lodash = require('lodash');

const getItem = (document) => {
	const grid = document.layoutGrids.find(el => el.visible && el.pattern.toLowerCase() === 'columns');

	if (!grid) {
		console.warn('> Warning! Grid not found:', nodeId);
		return {};
	};

	const name = naming(document.name);
	const item = {
		[name]: {
			gutter: {
				value: `${grid.gutterSize}px`,
				group: 'grid'
			}
		}
	};

	grid.alignment.toLowerCase() === 'stretch' && (item[name].offset = {
		value: `${grid.offset}px`,
		group: 'grid'
	});

	return item;
}

/**
 *
 * @param {Object} nodesGroup
 * @param {Array} nodes[fileKey] nodes
 */
module.exports = async (nodesGroup) => {
	const result = { sets: {} };

	for (const fileKey in nodesGroup) {
		const nodes = nodesGroup[fileKey];
		const responseNodes = await getNodes({
      fileKey,
      nodeIds: nodes.map(el => el.id)
    });

		for (const id in responseNodes) {
			const element = responseNodes[id];
			lodash.merge(result.sets, getItem(element.document));
		}
	}

	return result;
}
