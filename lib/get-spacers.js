const naming = require('./naming.js');
const getNodeId = require('./get-node-id');

module.exports = async function(node_id, key, URLformat, headers) {
	const figmaTreeStructure = await getNodeId(node_id, key, URLformat, headers);
	const {
		document
	} = figmaTreeStructure;
	const spacers = {}

	document.children.map(item => {
		if (item.type === 'TEXT') {
			return;
		}
		const res = {
			[naming(item.name)]: {
				value: item.absoluteBoundingBox.height,
				type: "spacers"
			}
		}
		Object.assign(spacers, res);
	});

	return spacers;
}
