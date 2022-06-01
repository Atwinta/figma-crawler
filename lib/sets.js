const lodash = require('lodash');
const objectDeepCompare = require('object-deep-compare');

const setsNames = [
  'desktop-large',
  'desktop',
  'tablet',
  'phone'
];

function substactSetsItem(sourceSet, otherSet) {
  const diff = objectDeepCompare.CompareValuesWithConflicts(sourceSet, otherSet);
  return diff.length ?
    lodash.pick(sourceSet, diff.map(el => el.replace('.value', ''))) // move path up on 1 (don't lose `group`)
    : sourceSet;
}

function subtractSets(sets) {
  const result = {};

  setsNames.forEach((setName, i, arr) => {
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
