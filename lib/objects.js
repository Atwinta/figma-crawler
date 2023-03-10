module.exports = {
  /**
   * Create recursive props: obj[a][b][c]
   * It's like mkdir -p
   * @param {Object} obj
   * @param {Object[]} props
   */
  buildPath: (obj, props) => {
    [].concat(props).reduce((prevVal, curVal) => {
      return prevVal[curVal] || (prevVal[curVal] = {});
    }, obj);

    return obj;
  },

  /**
   * return path, e.g 'a.b.c'
   * @param {Object} obj
   * @returns {String}
   */
  getPath: (obj) => {
    return JSON.stringify(obj)
      .replace(/[{}]/gi, '')
      .replace(/"/gi, '')
      .replace(/:/gi, '.')
      .replace(/\.$/, '');
  },

  isObject: x => typeof x === 'object'
}
