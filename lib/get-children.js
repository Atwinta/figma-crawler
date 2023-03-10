const strings = require('./strings');
const compare = strings.compare;

module.exports = (children, { type, name }) => {
  if (type && name) {
    return children.find(item => {
      return compare(item.type, type) && compare(item.name, name);
    });
  } else if (type) {
    return children.find(item => {
      return compare(item.type, type)
    });
  } else if (name) {
    return children.find(item => {
      return compare(item.name, name);
    });
  } else {
    return null;
  }
}
