const naming = require('./naming');
const css = require('./css');
const getNodeId = require('./get-node-id');

const getPath = (styleName) => {
  const baseName = naming(styleName, true);
	const baseNameArr = baseName.split('/');
	const name = baseNameArr[0]
    .replace(/-?((extra|semi)?-?(light|bold)|thin|regular|medium|black)/, '') // skip weight versions
    .replace('-italic', ''); // skip italic style
	const set = baseNameArr[1] || 'common';

	/**
	 * Skip styles with `--` or more: something wrong
	 */
	if (~name.indexOf('--')) {
    console.warn(`Skip text style ${name}: found two (or more) dashes in name`);
    return null;
  }

  return { set, name };
};

const getToken = async ({ path, item, URLformat, headers }) => {
  const { node_id, file_key } = item;
	const figmaTreeStructure = await getNodeId(node_id, file_key, URLformat, headers);
	const { document } = figmaTreeStructure;

  // const fontFamily = ~path.name.indexOf('headline') ? '{typography.headline.fontFamily.value}' : `'${document.style.fontFamily}, ${document.style.fontPostScriptName}'`;
  return {
    sets: {
      [path.set]: {
        [path.name]: {
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
}

module.exports = {
  getPath,
  getToken
}
