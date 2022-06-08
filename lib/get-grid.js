const naming = require('./naming.js');
const getNodes = require('./get-nodes');

module.exports = async ({ nodeId, fileKey }) => {
	const figmaTreeStructure = await getNodes({ nodeIds: nodeId, fileKey });
	const { document } = figmaTreeStructure;
	const grid = document.layoutGrids.find(el => el.visible && el.pattern.toLowerCase() === 'columns');

	if (!grid) {
		console.warn('> Warning! Grid not found:', nodeId);
		return {};
	};

	return {
		sets: {
			[naming(document.name)]: {
				offset: {
					value: `${grid.offset}px`,
					group: 'grid'
				},
				gutter: {
					value: `${grid.gutterSize}px`,
					group: 'grid'
				},
				// not use, grid in css powerful thing
				// count: {
				// 	value: grid.count,
				// 	group: 'grid'
				// }
			}
		}
	};
}
