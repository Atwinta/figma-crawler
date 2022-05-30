const naming = require('./naming');
const getNodeId = require('./get-node-id');
const Color = require('./color');

module.exports = async function(item, URLformat, colorFormat, headers) {
	const { node_id, file_key } = item;
	const figmaTreeStructure = await getNodeId(node_id, file_key, URLformat, headers);
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

	const result = { sets: { common: {} } };

	if (nameArr.length > 1) {
		nameArr.reduce((acc, cur, i, arr) => {
			const el = i + 1 === arr.length ? value : {};
			return i === 0 ?
				cur.indexOf('@') === 0 ?
					acc.sets[`${cur.substring(1)}`] = el :
					acc.sets.common[cur] = el :
				acc[cur] = el;
		}, result);
	} else {
		result.sets.common[name] = value;
	}

	return result;
}
