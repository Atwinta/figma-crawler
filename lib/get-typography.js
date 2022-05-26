const getChildren = require('./get-children.js');

module.exports = async function(frame) {
	let result = {};

	for (const type of frame.children) {
		const name = type.name.trim().toLowerCase();

		if (name === 'font-family') {
			type.children.forEach(child => {
				result[child.name] = {
					fontFamily: {
						value: getChildren(child.children, { type: 'text', name: 'code' }).characters,
						group: 'typography'
					}
				}
			})
		}
	}

	return result;
}
