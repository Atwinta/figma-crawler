const naming = require('./naming.js');
const getNodeId = require('./get-node-id');

const buildFontData = function(document, name, platformName) {
	// const fontFamily = ~name.indexOf('headline') ? '{typography.headline.fontFamily.value}' : `'${document.style.fontFamily}, ${document.style.fontPostScriptName}'`;
	return {
		[platformName]: {
			[name]: {
				// fontFamily: {
				// 	value: fontFamily,
				// 	type: "string"
				// },
				fontSize: {
					value: `${document.style.fontSize}px`,
					type: "string"
				},
				// TODO: don't use for now. Need think on practical cases
				// fontWeight: {
				// 	value: document.style.fontWeight,
				// 	type: "number"
				// },
				lineheight: {
					value: `${document.style.lineHeightPercentFontSize / 100}em`,
					type: "string"
				},
				spacing: {
					value:
						document.style.letterSpacing !== 0
							? `${document.style.letterSpacing}px`
							: "normal",
					type: "string"
				}
			}
		}
	};
};

module.exports = async function (item, URLformat) {
	const { node_id, file_key } = item;
	const figmaTreeStructure = await getNodeId(node_id, file_key, URLformat);
	const { document } = figmaTreeStructure;
	const baseName = naming(document.name, true);
	const baseNameArr = baseName.split('/');

	let name = baseNameArr[0]
		.replace(/-?thin/, '')
		.replace(/-?light/, '')
		.replace(/-?extra-light/, '')
		.replace(/-?regular/, '')
		.replace(/-?medium/, '')
		.replace(/-?semibold/, '')
		.replace(/-?bold/, '')
		.replace(/-?black/, ''); // skip weighes variant for now

	let platformName = 'common';

	if (baseNameArr[1]) {
		const platformNameArr = baseNameArr[1].split('@');
		const platformNameSuffix = platformNameArr[1];
		platformName = platformNameArr[0];
		name += (platformNameSuffix ? `-media-${platformNameSuffix}` : '');
	}

	/**
	 * Skip styles with `--` or more: something wrong
	 */
	if (name.indexOf('--') > -1)
		console.warn(`Skip text style ${name}: found two (or more) dashes in name`);
	else
		return buildFontData(document, name, platformName);
}
