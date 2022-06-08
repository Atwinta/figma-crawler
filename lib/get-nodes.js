const axios = require('./axios');

module.exports = async ({ nodeIds, fileKey }) => {
	try {
		const response = await axios.get(`/v1/files/${fileKey}/nodes`, {
			params: {
				ids: [].concat(nodeIds).join()
			}
		});
		return Array.isArray(nodeIds) ?
			response.data.nodes :
			response.data.nodes[nodeIds];
	} catch (error) {
		console.error(error);
	}
}
