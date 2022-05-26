function compare(a, b) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

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
