const getChildren = require('./get-children');
const css = require('./css');
const func = require('./functions');
const propDictionary = require('./prop-dictionary');
const objects = require('./objects');
const naming = require('./naming');
const getNodes = require('./get-nodes');
const references = require('./references');
const lodash = require('lodash');
const getChildrenDeep = require('./get-children-deep');

module.exports = async({ fileKey, nodeId, data }) => {
  const { color, effect } = data;
  const refs = {};
	const button = {
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

  const componentSet = await getNodes({ nodeIds: nodeId, fileKey, dontGroup: true });

  if (!componentSet || !componentSet.document) return button.sets;

  const children = componentSet.document.children || [];

  const props = {};
  const getVariant = (id) => children.find(el => el.id === id);

  children.forEach(variant => {
    variant.name.trim().toLowerCase().split(',')
      .forEach(prop => {
        const propArr = prop.trim().split('=');
        const propName = propArr[0];
        const propVal = propArr[1];

        objects.buildPath(props, propName); // { size = {} }

        props[propName][propVal] || (props[propName][propVal] = []); // { size = { m: [] } }
        props[propName][propVal].push(variant.id); // { size = { m: [id] } }
      });
  });


  const propContent = props.content || {};
  // const propView = props.view;

  for (const propName in props) {
    if (['size'/* , 'view' */].indexOf(propName) < 0) continue;

    const propVariants = props[propName];

    for (const propVal in propVariants) {
      const propValArr = propVal.split('@');
      const set = propValArr[1] || 'common';
      const setPropVal = propValArr[0];

      objects.buildPath(button.sets, [set, propName, setPropVal]);

      if (propName === 'size') {
        const variants = propVariants[propVal];
        const variantSize = getVariant(variants[0]);
        const variantContentText = (propContent.text || []).length ?
          getVariant(variants.find(id => ~propContent.text.indexOf(id))) :
          null;
        const variantContentIcon = (propContent.icon || []).length ?
          getVariant(variants.find(id => ~propContent.icon.indexOf(id))) :
          null;

        if (variantSize)  {
          [
            'borderRadius',
            'borderWidth',
            'gap',
            'paddingTop',
            'paddingBottom',
            'paddingLeft',
            'paddingRight'
          ].forEach(el => {
            const value = variantSize[propDictionary[el]];
            const valueStr = `${value}px`;

            typeof value === 'undefined' ||
              (button.sets[set][propName][setPropVal][el] = {
                value: el === 'borderWidth' ?
                  /**
                   * api ???????????? strokeWeight = 1, ???????? ???????? ?????? ???????????????????? ??????
                   * ?????? ?????? ???????? ?????? ?????????????? ??????, ???? variantSize.strokes[] ????????
                   */
                  variantSize.strokes.length ?
                    valueStr :
                    0 :
                  valueStr,
                group: 'size'
              })
          });
        }

        // for (const view in propView) {
        //   const viewVariant = getVariant(variants.find(id => ~propView[view].indexOf(id)));

        //   ['borderWidth'].forEach(el => {
        //     objects.buildPath(button.sets, [set, 'view', view, propName, setPropVal]);

        //     button.sets[set]['view'][view][propName][setPropVal][el] = {
        //       value: el === 'borderWidth' ?
        //         /**
        //          * api ???????????? strokeWeight = 1, ???????? ???????? ?????? ???????????????????? ??????
        //          * ?????? ?????? ???????? ?????? ?????????????? ??????, ???? viewVariant.strokes[] ????????
        //          */
        //         viewVariant.strokes.length ?
        //           `${viewVariant[propDictionary[el]]}px` :
        //           0 :
        //         viewVariant[propDictionary[el]],
        //       group: 'size'
        //     }
        //   });
        // }

        if (variantContentText) {
          const textEl = getChildrenDeep(variantContentText.children, { name: 'text', type: 'text' });
          const styles = [
            'fontSize',
            'lineHeight',
            'letterSpacing'
          ];

          if (textEl) for (let i = 0; i < styles.length; i++) {
            const el = styles[i];
            const figmaProp = propDictionary[el] ? propDictionary[el] : el;
            let textStyle = '';
            let value = '';

            try {
              const textStyleNode = await getNodes({ nodeIds: textEl.styles.text, fileKey, dontGroup: true });
              const styleName = naming(textStyleNode.document.name, true).split('/')[0];
              textStyle = `text.${styleName}.${el}`;
            } catch (error) {
              console.warn('\n> Warning. Button text style error:', error);
              console.warn('\n> Will be used values instead of Text style');

              value = func.isFunction(css[el]) ?
                css[el](textEl.style[figmaProp]) :
                textEl.style[figmaProp];
            }

            if (textStyle) {
              lodash.merge(refs, references.set({
                path: textStyle,
                value: 'unset',
                group: 'typography'
              }));

              value = `{${textStyle}.value}`;
            }

            button.sets[set][propName][setPropVal][el] = {
              value,
              group: 'typography'
            };
          }

          // [
          //   'paddingTop',
          //   'paddingBottom',
          //   'paddingLeft',
          //   'paddingRight'
          // ].forEach(el => {
          //   button.sets[set][propName][setPropVal][el] = {
          //     value: `${variantContentText[el]}px`,
          //     group: 'size'
          //   };
          // });
        }

        if (variantContentIcon) {
          const iconInstance = getChildren(variantContentIcon.children, { name: 'icon' });
          const iconViewBox = iconInstance ? getChildren(iconInstance.children, { name: 'view-box' }) : null;
          const icon = iconViewBox ? getChildren(iconViewBox.children, { name: 'icon', type: 'vector' }) : null;

          if (icon) {
            const absoluteBoundingBox = icon.absoluteBoundingBox;
            const iconSize = button.sets[set][propName][setPropVal]['icon'] = {};

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

            objects.buildPath(button.sets, [set, propName, setPropVal, colorProp]);

            button.sets[set][propName][setPropVal][colorProp][colorStateName] = {
              value: `{color.control.${propName}.${setPropVal}.${colorTypeName}.${colorStateName}.value}`,
              group: 'color'
            };

            lodash.merge(refs, references.set({
              path: `color.control.${propName}.${setPropVal}.${colorTypeName}.${colorStateName}`,
              value: 'unset',
              group: 'color'
            }));
          }
        }

        for (const key in shadowView) {
          if (Object.hasOwnProperty.call(shadowView, key)) {
            const prop = 'boxShadow';

            objects.buildPath(button.sets, [set, propName, setPropVal, prop]);

            button.sets[set][propName][setPropVal][prop][key] = {
              value: `{effect.shadow.control.${propName}.${propVal}.${key}.value}`,
              group: 'effect'
            };

            lodash.merge(refs, references.set({
              path: `effect.shadow.control.${propName}.${propVal}.${key}`,
              value: 'unset',
              group: 'effect'
            }));
          }
        }
      }
    }
  }

	return { button, references: refs };
}
