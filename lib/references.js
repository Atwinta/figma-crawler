const lodash = require('lodash');

module.exports = {
  set: ({ path, value, group }) => {
    const data = {};
    lodash.set(data, `${path}.value`, typeof value === 'undefined' ? 'unset' : value);
    lodash.set(data, `${path}.group`, group);
    return data;
  }
};
