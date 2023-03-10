const SEPARATOR_NAME = '-';

/**
 * Clean name
 * @param {String} name
 * @param {Boolean} keepSlashes
 * @returns {String}
 */
module.exports = function(name, keepSlashes) {
	let str = name
		.trim()
		.toLowerCase()
		.replace(/=/ig, '/')
		.replace(/ /ig, SEPARATOR_NAME)
		.replace(/-/ig, SEPARATOR_NAME)
		.replace(/,-/ig, ',')
		.replace(/-\/-/ig, '/');

	return keepSlashes ? str : str.replace(/\//ig, SEPARATOR_NAME);
}
