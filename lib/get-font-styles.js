const naming = require('./naming');
const css = require('./css');
const getNodeId = require('./get-node-id');

const buildFontData = function(document, name, platformName) {
	// const fontFamily = ~name.indexOf('headline') ? '{typography.headline.fontFamily.value}' : `'${document.style.fontFamily}, ${document.style.fontPostScriptName}'`;
	return {
		sets: {
			[platformName]: {
				[name]: {
					// fontFamily: {
					// 	value: fontFamily,
					// 	group: 'typography'
					// },
					fontSize: {
						value: css.fontSize(document.style.fontSize),
						group: 'typography'
					},
					// TODO: don't use for now. Need think on practical cases
					// fontWeight: {
					// 	value: document.style.fontWeight,
					// 	group: 'typography'
					// },
					lineHeight: {
						value: css.lineHeight(document.style.lineHeightPercentFontSize),
						group: 'typography'
					},
					letterSpacing: {
						value: css.letterSpacing(document.style.letterSpacing),
						group: 'typography'
					}
				}
			}
		}
	};
};

module.exports = async function (item, URLformat, headers) {
	const { node_id, file_key } = item;
	const figmaTreeStructure = await getNodeId(node_id, file_key, URLformat, headers);
	const { document } = figmaTreeStructure;
	const baseName = naming(document.name, true);
	const baseNameArr = baseName.split('/');

	// skip weight versions
	let name = baseNameArr[0].replace(/-?((extra|semi)?-?(ligth|bold)|thin|regular|medium|black)/, '');
	let platformName = baseNameArr[1] || 'common';

	/**
	 * Skip styles with `--` or more: something wrong
	 */
	if (name.indexOf('--') > -1)
		console.warn(`Skip text style ${name}: found two (or more) dashes in name`);
	else
		return buildFontData(document, name, platformName);
}
