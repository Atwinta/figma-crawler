const naming = require('./naming');
const css = require('./css');
const getNodes = require('./get-nodes');
const lodash = require('lodash');

/**
 *
 * @param {Object} nodesGroup
 * @param {Array} nodes[fileKey] nodes
 */
const getTokens = async (nodesGroup) => {
  const result = { sets: {} };
  const ids = {};
  const filteredNodes = {};

  for (const fileKey in nodesGroup) {
    const nodes = nodesGroup[fileKey];

    nodes.forEach(node => {
      const path = _getPath(node.meta.name);

      if (path) {
        const { set, name } = path;

        filteredNodes[set] || (filteredNodes[set] = {});

        // skip weight and italic versions
        if (!filteredNodes[set][name]) {
          filteredNodes[set][name] = true;
          ids[node.fileKey] || (ids[node.fileKey] = []);
          ids[node.fileKey].push({ id: node.id, path });
        }
      }
    });
  }

  for (const fileKey in ids) {
    const nodesMeta = ids[fileKey];
    const responseNodes = await getNodes({
      fileKey,
      nodeIds: nodesMeta.map(el => el.id)
    });

    for (const id in responseNodes) {
      const element = responseNodes[id];
      element.document.visible === false || lodash.merge(result.sets, _buildToken({
        document: element.document,
        path: nodesMeta.find(el => el.id === id).path
      }));
    }
  }

  return result;
};

const _getPath = (styleName) => {
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

const _buildToken = ({ path, document }) => {
  // const fontFamily = ~path.name.indexOf('headline') ? '{typography.headline.fontFamily.value}' : `'${document.style.fontFamily}, ${document.style.fontPostScriptName}'`;
  return {
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
  };
}

module.exports = {
  getTokens
}
