const lodash = require('lodash');
const diff = require('deep-diff');
const { isObject } = require('./objects');

function getDiff(sourceSet, otherSet) {
  if (!Object.entries(otherSet || {}).length)
    return sourceSet;

  const result = {};

  diff.observableDiff(sourceSet, otherSet, (d) => {
    if (d.lhs) {
      const path = d.path;
      path[path.length - 1] === 'value' && path.splice(-1); // move path up on 1 (don't lose `group`)
      lodash.merge(result, lodash.pick(sourceSet, [path]));
    }
  });

  return result;
}

/**
 * Del double values from bigger set (platform)
 * sets: { phone: { a: 1, b: 2 }, tablet: { a: 1, b: 3 }, desktop: { a: 1, b: 4 } }
 * will be:
 * sets: { phone: { a: 1, b: 2 }, tablet: { b: 3 }, desktop: { b: 4 } }
 * @param {Object} sets
 * @param {Array} setsOrder platforms from bigger to lower: ['desktop', 'tablet', 'phone']
 * @returns {Object}
 */
function subtractSets(sets, setsOrder) {
  const result = { ...sets };

  (setsOrder || []).forEach((setName, i, arr) => {
    const sourceSet = sets[setName];
    const otherSet = sets[arr[i + 1]];
    sourceSet && otherSet && (result[setName] = getDiff(sourceSet, otherSet));
  });

  return result;
}

function getCommon(a, b) {
  const result = {}

  if (([a, b]).every(isObject)) {
    Object.keys(a).forEach((key) => {
      const aVal = a[key];
      const bVal = b[key];

      if (([aVal, bVal]).every(isObject)) {
        const obj = getCommon(aVal, bVal);
        Object.entries(obj).length && (result[key] = obj);
      } else if (aVal === bVal && a.value === b.value && a.group === b.group) {
        result[key] = aVal;
      }
    });
  }

  return result;
}

function intersectSets(sets) {
  const result = { ...sets };
  const setsNames = (Object.keys(sets)).filter(el => el !== 'common');

  if (setsNames.length <= 1) return result;

  let intersect = getCommon(sets[setsNames[0]], sets[setsNames[1]]);

  if (Object.entries(intersect).length) {

    for (let i = 2; i < setsNames.length; i++) {
      intersect = getCommon(sets[setsNames[i]], intersect);
    }

    result.common || (result.common = {});

    lodash.merge(result.common, intersect);

    Object.entries(result.common).length &&
      setsNames.forEach((el) => {
        result[el] = getDiff(result[el], result.common);
      });
  }

  return result;
}

module.exports = {
  getDiff,
  subtractSets,
  getCommon,
  intersectSets
};
