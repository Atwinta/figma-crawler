const naming = require('./naming.js');
const getNodeId = require('./get-node-id');

module.exports = async function(item, URLformat, headers) {
	const { node_id, file_key } = item;
	const figmaTreeStructure = await getNodeId(node_id, file_key, URLformat, headers);
	const {
		document
	} = figmaTreeStructure;
	return {
		size: {
			grids: {
				[naming(document.name)]: {
					gutter: {
						value: document.layoutGrids[0].gutterSize,
						type: "grids"
					},
					offset: {
						value: document.layoutGrids[0].offset},
					type: "grids"
				}
			}
		},
		grids: {
			[naming(document.name)]: {
				count: {
					value: document.layoutGrids[0].count,
						type: "grids"
				}
			}
		}
	};
}
