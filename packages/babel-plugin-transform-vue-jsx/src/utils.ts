import { NodePath } from '@babel/core';
import { addDefault } from '@babel/helper-module-imports'
import htmlTags from 'html-tags'
import svgTags from 'svg-tags'
import { JSXElement, Expression, isJSXIdentifier, stringLiteral, isJSXMemberExpression, identifier, arrayExpression, CallExpression, JSXAttribute, spreadElement, objectExpression, objectProperty, callExpression, booleanLiteral, isStringLiteral, StringLiteral, isArrayExpression } from '@babel/types';
import { transformJSXText, transformJSXExpressionContainer, transformJSXSpreadChild, transformJSXElement, transformJSXMemberExpression, transformAttribute } from './transforms';
import { ParsedAttribute, OptimizedAttribute, isSpreadAttribute, isSimplePrefixAttribute, isVNodeOptions, VNodeOptions, VNodeOptionsPrefixValue, isGroupPrefixAttribute, rootAttributeKeys, rootPrefixKeys, RootPrefixKey, isNamedAttribute, isDirectiveAttribute, DirectiveAttribute, toArryJoin } from './types'

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export const getTag = (path: NodePath<JSXElement>) => {
  const namePath = path.get('openingElement').get('name')
  if (namePath.isJSXIdentifier()) {
    const name = namePath.node.name
    if (path.scope.hasBinding(name) && !htmlTags.includes(name) && !svgTags.includes(name)) {
      return identifier(name)
    } else {
      return stringLiteral(name)
    }
  }

  if (namePath.isJSXMemberExpression()) {
    return transformJSXMemberExpression(namePath)
  }
  /* istanbul ignore next */
  throw new Error(`getTag: ${namePath.type} is not supported`)
}

export const getChildren = (path: NodePath<JSXElement>) =>
  path
    .get('children')
    .map(path => {
      if (path.isJSXText()) {
        return transformJSXText(path)
      }
      if (path.isJSXExpressionContainer()) {
        return transformJSXExpressionContainer(path)
      }
      if (path.isJSXSpreadChild()) {
        return transformJSXSpreadChild(path)
      }
      if (path.isJSXElement()) {
        return transformJSXElement(path)
      }
      if (path.isCallExpression()) {
        return path.node as CallExpression
      }
      throw new Error(`getChildren: ${path.type} is not supported`)
    })
    .filter(notEmpty)

export const optimizeAttributes = (list: OptimizedAttribute[], element: ParsedAttribute) => {
  if (isSpreadAttribute(element)) {
    list.push(element)
  } else {
    if (list.length === 0 || !isVNodeOptions(list[list.length - 1])) {
      list.push({ type: 'VNodeOptions', directives: [] })
    }
    const opts = list[list.length - 1] as VNodeOptions
    if (isSimplePrefixAttribute(element)) {
      const { prefix, name, value } = element
      if (!opts[prefix]) {
        opts[prefix] = []
      }
      const list = opts[prefix] as VNodeOptionsPrefixValue[]
      list.push({ name, value })
    } else if (isGroupPrefixAttribute(element)) {
      const { prefix, value } = element
      if (!opts[prefix]) {
        opts[prefix] = []
      }
      const list = opts[prefix] as VNodeOptionsPrefixValue[]
      list.push(value)
    } else if (isDirectiveAttribute(element)) {
      opts.directives.push(element)
    } else {
      const { key, value } = element
      const option = opts[key]
      if (option && key === 'staticClass' && isStringLiteral(value) && isStringLiteral(option)) {
        option.value = `${option.value} ${value.value}`
        
      } else {
        opts[key] = value
      }
    }
  }
  return list
}

export const reduceVNodeOptionsPrefixValues =
  (key: RootPrefixKey) =>
  (list: VNodeOptionsPrefixValue[], value: VNodeOptionsPrefixValue): VNodeOptionsPrefixValue[] =>
    toArryJoin.includes(key) && isNamedAttribute(value) && list.find(el => isNamedAttribute(el) && el.name === value.name)
      ? list.map(el =>
          isNamedAttribute(el) && el.name === value.name
            ? isArrayExpression(el.value)
              ? { name: el.name, value: arrayExpression([...el.value.elements, value.value]) }
              : { name: el.name, value: arrayExpression([el.value, value.value]) }
            : el
        )
      : [...list, value]

export const buildPrefixAttribute = (key: RootPrefixKey, values: VNodeOptionsPrefixValue[]) => {
  if (values.length === 1 && !isNamedAttribute(values[0])) {
    return values[0]
  }
  return objectExpression(
    values
      .reduce(reduceVNodeOptionsPrefixValues(key), [])
      .map(value => 
        isNamedAttribute(value)
          ? objectProperty(stringLiteral(value.name), value.value)
          : spreadElement(value)
      )
  )
}

export const generateDirective = (directive: DirectiveAttribute) =>
  objectExpression([
    objectProperty(stringLiteral('name'), stringLiteral(directive.name)),
    objectProperty(stringLiteral('rawName'), stringLiteral(directive.rawName)),
    objectProperty(stringLiteral('value'), directive.value),
    (
      directive.argument
      ? objectProperty(stringLiteral('arg'), stringLiteral(directive.argument))
      : null
    ),
    (
      directive.modifiers.length > 0
      ? objectProperty(
        stringLiteral('modifiers'),
        objectExpression(
          directive.modifiers.map(modifier =>
            objectProperty(stringLiteral(modifier), booleanLiteral(true))
          )
        )
      )
      : null
    ),
  ].filter(notEmpty))

export const buildAttributeExpression = (attribute: OptimizedAttribute) => {
  if (isSpreadAttribute(attribute)) {
    return attribute.value
  } else {
    return objectExpression([
      ...rootAttributeKeys.map(key =>
        attribute[key]
          ? objectProperty(stringLiteral(key), attribute[key] as Expression)
          : null
      ).filter(notEmpty),
      ...rootPrefixKeys.map(key => 
        attribute[key]
          ? objectProperty(stringLiteral(key), buildPrefixAttribute(key, attribute[key] as VNodeOptionsPrefixValue[]))
          : null
      ).filter(notEmpty),
      (
        attribute.directives.length > 0
        ? objectProperty(stringLiteral('directives'), arrayExpression(attribute.directives.map(generateDirective)))
        : null
      )
    ].filter(notEmpty))
  }
}

export const buildAttributes = (path: NodePath<JSXElement>, attributes: ParsedAttribute[]) => {
  const builtAttributes = attributes.reduce(optimizeAttributes, [] as OptimizedAttribute[]).map(buildAttributeExpression)
  if (builtAttributes.length > 1) {
    const helper = addDefault(path, '@vue/babel-helper-vue-jsx-merge-props', { nameHint: '_mergeJSXProps' })
    return callExpression(helper, builtAttributes)
  } else if (builtAttributes.length === 1) {
    return builtAttributes[0]
  } else {
    return null
  }
}

export const getAttributes = (path: NodePath<JSXElement>) =>
  buildAttributes(path, path.get('openingElement').get('attributes').map(transformAttribute).flat().filter(notEmpty))

export const getJSXAttributeName = (path: NodePath<JSXAttribute>) => {
  const nameNode = path.node.name
  if (isJSXIdentifier(nameNode)) {
    return nameNode.name
  } else {
    return `${nameNode.namespace.name}:${nameNode.name.name}`
  }
}

export const getJSXAttributeValue = (path: NodePath<JSXAttribute>) => {
  const valuePath = path.get('value')
  if (valuePath.isJSXElement()) {
    return transformJSXElement(valuePath)
  } else if (valuePath.isStringLiteral()) {
    return valuePath.node
  } else if (valuePath.isJSXExpressionContainer()) {
    return transformJSXExpressionContainer(valuePath)
  } else {
    return null
  }
}

export const hCallArguments = (path: NodePath<JSXElement>) => {
  const args: Expression[] = [getTag(path)]
  const attributes = getAttributes(path)
  const children = getChildren(path)
  if (attributes) {
    // console.log(attributes)
    args.push(attributes)
  }
  if (children.length) {
    args.push(arrayExpression(children))
  }
  return args
}