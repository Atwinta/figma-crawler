const getChildren = require('./get-children');
const lineHeight = require('./line-height');
const propDictionary = require('./prop-dictionary');
const objects = require('./objects');

module.exports = function(page, { color, effect }) {
	const result = {
    fontFamily: {
      value: '{typography.controls.fontFamily.value}'
    }
  };

  const colorControl = color.control;
  const shadow = effect.shadow.control;

  const componentSet = page.children.find(component => {
    return component.type.trim().toLowerCase() === 'component_set';
  });

  if (!componentSet) return result;

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
      objects.buildPath(result, [propName, propVal]);

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
          result[propName][propVal][el] = {
            value: `${variantSize[propDictionary[el]]}px`,
            group: 'size'
          }
        });

        for (const view in propView) {
          const viewVariant = getVariant(variants.find(id => ~propView[view].indexOf(id)));

          ['borderWidth'].forEach(el => {
            objects.buildPath(result, ['view', view, propName, propVal]);

            result['view'][view][propName][propVal][el] = {
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

            result[propName][propVal][el] = {
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
            result[propName][propVal][el] = {
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
            const iconSize = result[propName][propVal]['icon'] = {};

            ['width', 'height'].forEach(el => {
              iconSize[el] = {
                value: `${absoluteBoundingBox[el]}px`,
                group: 'size'
              };
            });
          }
        }

      } else if (propName === 'view') {
        const colorView = colorControl[propName][propVal];
        const shadowView = shadow[propName][propVal];

        for (const colorTypeName in colorView) {
          const colorType = colorView[colorTypeName];
          for (const colorStateName in colorType) {
            // const colorState = colorType[colorStateName];
            const colorProp = `${colorTypeName}Color`;

            objects.buildPath(result, [propName, propVal, colorProp]);

            result[propName][propVal][colorProp][colorStateName] = {
              value: `{color.control.${propName}.${propVal}.${colorTypeName}.${colorStateName}.value}`,
              group: 'color'
            };
          }
        }

        for (const key in shadowView) {
          if (Object.hasOwnProperty.call(shadowView, key)) {
            const prop = 'boxShadow';

            objects.buildPath(result, [propName, propVal, prop]);

            result[propName][propVal][prop][key] = {
              value: `{effect.shadow.control.${propName}.${propVal}.${key}.value}`,
              group: 'effect'
            };
          }
        }
      }
    }
  }

	return result;
}
