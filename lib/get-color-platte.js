const naming = require('./naming.js');
const getNodeId = require('./get-node-id');
const Color = require('./color');

module.exports = async function(item, URLformat, colorFormat) {
	const { node_id, file_key } = item;
	const figmaTreeStructure = await getNodeId(node_id, file_key, URLformat);
	const { document } = figmaTreeStructure;
	const name = naming(document.name, true);
	const nameArr = name.split('/');
	const fill = document.fills[0];
	const { r, g, b, a } = fill.color;
	const opacity = typeof fill.opacity !== 'undefined' ?  fill.opacity : a;
	const value = {
		value: new Color({ r, g, b, a: opacity })[colorFormat],
		group: 'color'
	};

	let result = {};

	if (nameArr.length > 1) {
		nameArr.reduce((acc, cur, i, arr) => {
			return acc[cur] = i + 1 === arr.length ? value : {};
		}, result);
	} else {
		result[name] = value;
	}

	return result;
}
