const df = require('d-forest');
const strings = require('./strings');
const compare = strings.compare;

module.exports = getChildrenDeep = (children, { type, name }) => {
  if (!type || !name) return null;

  return df.findNode(children, (node) => {
    const nodeType = node.type;
    const nodeName = node.name;
    return nodeType && nodeName && compare(nodeType, type) && compare(nodeName, name)
  })
}
