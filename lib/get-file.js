const axios = require('./axios');

module.exports = async (fileKey) => {
	try {
		const response = await axios.get(`/v1/files/${fileKey}`);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}
