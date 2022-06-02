const naming = require('./naming.js');
const getNodeId = require('./get-node-id');

module.exports = async function(item, URLformat, headers) {
	const { node_id, file_key } = item;
	const figmaTreeStructure = await getNodeId(node_id, file_key, URLformat, headers);
	const { document } = figmaTreeStructure;
	const grid = document.layoutGrids.find(el => el.visible && el.pattern.toLowerCase() === 'columns');

	if (!grid) {
		console.warn('> Warning! Grid not found:', node_id);
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
