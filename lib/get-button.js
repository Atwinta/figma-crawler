const getChildren = require('./get-children');
const lineHeight = require('./line-height');
const propDictionary = require('./prop-dictionary');
const objects = require('./objects');
const sets = require('./sets');

module.exports = function(page, { color, effect }) {
	const result = {
    sets: {
      common: {
        fontFamily: {
          value: '{typography.controls.fontFamily.value}'
        }
      }
    }
  };

  const colorControl = color.sets.common.control;
  const shadow = effect.shadow.control;

  const componentSet = page.children.find(component => {
    return component.type.trim().toLowerCase() === 'component_set';
  });

  if (!componentSet) return result.sets;

  const props = {};
  const getVariant = (id) => componentSet.children.find(el => el.id === id);

  componentSet.children.forEach(variant => {
    variant.name.trim().toLowerCase().split(',')
      .forEach(prop => {
        const propArr = prop.trim().split('=');
        const propName = propArr[0];
        const propVal = propArr[1];

        objects.buildPath(props, propName);

        props[propName][propVal] || (props[propName][propVal] = []);
        props[propName][propVal].push(variant.id);
      });
  });

  const propContent = props.content;
  const propView = props.view;

  for (const propName in props) {
    if (['size', 'view'].indexOf(propName) < 0) continue;

    const propVariants = props[propName];

    for (const propVal in propVariants) {
      const propValArr = propVal.split('@');
      const set = propValArr[1] || 'common';
      const setPropVal = propValArr[0];

      objects.buildPath(result.sets, [set, propName, setPropVal]);

      if (propName === 'size') {
        const variants = propVariants[propVal];
        const variantSize = getVariant(variants[0]);
        const variantContentText = getVariant(variants.find(id => ~propContent.text.indexOf(id)));
        const variantContentIcon = getVariant(variants.find(id => ~propContent.icon.indexOf(id)));

        variantSize && [
          'borderRadius',
          // 'borderWidth',
          'gap'
        ].forEach(el => {
          result.sets[set][propName][setPropVal][el] = {
            value: `${variantSize[propDictionary[el]]}px`,
            group: 'size'
          }
        });

        for (const view in propView) {
          const viewVariant = getVariant(variants.find(id => ~propView[view].indexOf(id)));

          ['borderWidth'].forEach(el => {
            objects.buildPath(result.sets, [set, 'view', view, propName, setPropVal]);

            result.sets[set]['view'][view][propName][setPropVal][el] = {
              value: el === 'borderWidth' ?
                /**
                 * api отдаёт strokeWeight = 1, даже если его фактически нет
                 * при том если его реально нет, то viewVariant.strokes[] пуст
                 */
                viewVariant.strokes.length ?
                  `${viewVariant[propDictionary[el]]}px` :
                  0 :
                viewVariant[propDictionary[el]],
              group: 'size'
            }
          });
        }

        if (variantContentText) {
          const textChildFrame = getChildren(variantContentText.children, { name: 'text' });
          const textEl = textChildFrame ? getChildren(textChildFrame.children, { type: 'text' }) : null;

          textEl && [
            'fontSize',
            'fontWeight',
            'lineHeight'
          ].forEach(el => {
            const figmaProp = propDictionary[el] ? propDictionary[el] : el;
            const value = textEl.style[figmaProp];

            result.sets[set][propName][setPropVal][el] = {
              value: el === 'lineHeight' ?
                lineHeight(value) :
                value + (el === 'fontSize' ? 'px' : ''),
              group: 'typography'
            };
          });

          [
            'paddingTop',
            'paddingBottom',
            'paddingLeft',
            'paddingRight'
          ].forEach(el => {
            result.sets[set][propName][setPropVal][el] = {
              value: `${variantContentText[el]}px`,
              group: 'size'
            };
          });
        }

        if (variantContentIcon) {
          const iconInstance = getChildren(variantContentIcon.children, { name: 'icon' });
          const iconViewBox = iconInstance ? getChildren(iconInstance.children, { name: 'view-box' }) : null;
          const icon = iconViewBox ? getChildren(iconViewBox.children, { name: 'icon', type: 'vector' }) : null;

          if (icon) {
            const absoluteBoundingBox = icon.absoluteBoundingBox;
            const iconSize = result.sets[set][propName][setPropVal]['icon'] = {};

            ['width', 'height'].forEach(el => {
              iconSize[el] = {
                value: `${absoluteBoundingBox[el]}px`,
                group: 'size'
              };
            });
          }
        }

      } else if (propName === 'view') {
        const colorView = colorControl[propName][setPropVal];
        const shadowView = shadow[propName][setPropVal];

        for (const colorTypeName in colorView) {
          const colorType = colorView[colorTypeName];
          for (const colorStateName in colorType) {
            // const colorState = colorType[colorStateName];
            const colorProp = `${colorTypeName}Color`;

            objects.buildPath(result.sets, [set, propName, setPropVal, colorProp]);

            result.sets[set][propName][setPropVal][colorProp][colorStateName] = {
              value: `{color.control.${propName}.${setPropVal}.${colorTypeName}.${colorStateName}.value}`,
              group: 'color'
            };
          }
        }

        for (const key in shadowView) {
          if (Object.hasOwnProperty.call(shadowView, key)) {
            const prop = 'boxShadow';

            objects.buildPath(result.sets, [set, propName, setPropVal, prop]);

            result.sets[set][propName][setPropVal][prop][key] = {
              value: `{effect.shadow.control.${propName}.${propVal}.${key}.value}`,
              group: 'effect'
            };
          }
        }
      }
    }
  }

  /**
   * Del double values from bigger set (platform)
   * @example
   * sets: { phone: { a: 1, b: 2 }, tablet: { a: 1, b: 3 }, desktop: { a: 1, b: 4 } }
   * will be:
   * sets: { phone: { a: 1, b: 2 }, tablet: { b: 3 }, desktop: { b: 4 } }
   */
  const subsctedSets = sets.subtractSets(result.sets);
  for (const key in subsctedSets) {
    result.sets[key] && (result.sets[key] = subsctedSets[key]);
  }

	return result;
}
