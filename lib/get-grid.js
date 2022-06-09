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

	const name = naming(document.name);
	const sets = {
		[name]: {
			gutter: {
				value: `${grid.gutterSize}px`,
				group: 'grid'
			}
		}
	};

	grid.alignment.toLowerCase() === 'stretch' && (sets[name].offset = {
		value: `${grid.offset}px`,
		group: 'grid'
	});

	return { sets };
}
