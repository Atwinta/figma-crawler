const naming = require('./naming.js');
const getNodes = require('./get-nodes');
const { colorFormat } = require('./config');
const Color = require('./color');

module.exports = async ({ nodeId, fileKey }) => {
	const figmaTreeStructure = await getNodes({ nodeIds: nodeId, fileKey });
	const { document } = figmaTreeStructure;
	const name = naming(document.name, true);
	const nameArr = name.split('/');
	const effect = document.effects[0];

	if (effect.type.trim().toLowerCase().indexOf('shadow') === -1)
		return;

	const offset = effect.offset;
	const value = {
		value: [
			`${offset.x}px`,
			`${offset.y}px`,
			`${effect.radius}px`,
			`${effect.spread}px`,
			new Color(effect.color)[colorFormat]
		].join(' '),
		group: 'effect'
	};

	let result = {};

	if (nameArr.length > 1) {
		nameArr.reduce((acc, cur, i, arr) => {
			return acc[cur] = i + 1 === arr.length ? value : {};
		}, result);
	} else {
		result[name] = value;
	}

	return { shadow: result };
}
