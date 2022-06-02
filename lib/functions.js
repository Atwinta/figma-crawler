/**
 * @source https://github.com/bem/bem-core/blob/v4.2.0/common.blocks/functions/functions.vanilla.js
 */

const toStr = Object.prototype.toString;

module.exports = {
   /**
    * Checks whether a given object is function
    * @param {*} obj
    * @returns {Boolean}
    */
   isFunction: function(obj) {
    return toStr.call(obj) === '[object Function]';
  }
}
