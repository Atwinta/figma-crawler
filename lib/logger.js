/**
 * @param {Object} json
 * @param {String} title
 */
module.exports = (json, title) => {
  console.log(title || '', JSON.stringify(json, null, 2), '\n')
};
