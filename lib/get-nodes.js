const axios = require('./axios');

/**
 *
 * @param {Object} data
 * @param {String[]} data.nodeIds
 * @param {String} data.fileKey
 * @param {Boolean} data.dontGroup
 * @returns {Object}
 */
module.exports = async ({ nodeIds, fileKey, dontGroup = false }) => {
	try {
		const response = await axios.get(`/v1/files/${fileKey}/nodes`, {
			params: {
				ids: [].concat(nodeIds).join()
			}
		});

		const nodes = response.data.nodes;

		return dontGroup ?
			Object.keys(nodes).length > 1 ?
				nodes :
				nodes[nodeIds]
			: nodes;
	} catch (error) {
		console.error(error);
	}
}
