const axios = require('./axios');

/**
 *
 * @param {Object} data
 * @param {String[]} data.nodeIds
 * @param {String} data.fileKey
 * @returns {Object}
 */
module.exports = async ({ nodeIds, fileKey }) => {
	try {
		const response = await axios.get(`/v1/files/${fileKey}/nodes`, {
			params: {
				ids: [].concat(nodeIds).join()
			}
		});

		const nodes = response.data.nodes;

		return Object.keys(nodes).length > 1 ?
			nodes :
			nodes[nodeIds];

	} catch (error) {
		console.error(error);
	}
}
