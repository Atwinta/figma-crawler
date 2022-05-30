const URL = require('url');
const fetch = require('node-fetch');

module.exports = async function (file_key, URLformat, headers) {
	URLformat = {
		...URLformat,
		pathname: `/v1/teams/${file_key}/styles`,
		query: {
			page_size: 10000000
		}
	}
	const result = await fetch(`${URL.format(URLformat).toString()}`, { headers });
	const figmaTreeStructure = await result.json();

	return figmaTreeStructure.meta;
}
