const lodash = require('lodash');
const objectDeepCompare = require('object-deep-compare');

function substactSetsItem(sourceSet, otherSet) {
  const diff = objectDeepCompare.CompareValuesWithConflicts(sourceSet, otherSet);
  return diff.length ?
    lodash.pick(sourceSet, diff.map(el => el.replace('.value', ''))) // move path up on 1 (don't lose `group`)
    : sourceSet;
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
    sourceSet && otherSet && (result[setName] = substactSetsItem(sourceSet, otherSet));
  });

  return result;
}

module.exports = {
  substactSetsItem,
  subtractSets
};
