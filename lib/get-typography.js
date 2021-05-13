module.exports = async function(frame) {
	let result = { typography: {} };

	for (const type of frame.children) {
		const name = type.name.trim().toLowerCase();

		if (name === 'font-family') {
			type.children.forEach(child => {
				result.typography[child.name] = {
					fontFamily: {
						value: child.children.find(item => {
							return item.type.toLowerCase() === 'text' && item.name.trim().toLowerCase() === 'code'
						}).characters
					}
				}
			})
		}
	}

	return result;
}
