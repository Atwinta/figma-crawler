const naming = require('./naming.js');
const getNodes = require('./get-node-id');

module.exports = async function(nodeId, fileKey) {
	const figmaTreeStructure = await getNodes({ nodeIds: nodeId, fileKey });
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
