const axios = require('./axios');

module.exports = async (fileKey) => {
	try {
		const response = await axios.get(`/v1/teams/${fileKey}/styles`, {
			params: {
				page_size: 10000000
			}
		});
		return response.data.meta;
	} catch (error) {
		console.error(error);
	}
}
