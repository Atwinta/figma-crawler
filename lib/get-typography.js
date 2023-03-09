const getChildren = require('./get-children.js');

module.exports = async function(frame) {
	let result = {};

	for (const type of frame.children) {
		const name = type.name.trim().toLowerCase();

		if (name === 'font-family') {
			type.children.forEach(child => {
				const name = child.name.trim().toLowerCase()
				const codeText = getChildren(child.children, { type: 'text', name: 'code' });

				if (codeText) {
					result[name] = {
						fontFamily: {
							value: codeText.characters,
							group: 'typography'
						}
					}
				} else {
					console.warn(`Not found text node with name "code" for ${name}`);
				}
			})
		}
	}

	return result;
}
