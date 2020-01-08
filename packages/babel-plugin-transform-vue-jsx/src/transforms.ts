import { NodePath } from '@babel/core';
import { JSXElement, callExpression, identifier, JSXText, stringLiteral, JSXExpressionContainer, isJSXEmptyExpression, JSXSpreadChild, spreadElement, JSXMemberExpression, MemberExpression, nullLiteral, memberExpression, JSXAttribute, JSXSpreadAttribute, Node, isJSXIdentifier, booleanLiteral, isIdentifier, isStringLiteral, isExpression } from '@babel/types';
import { hCallArguments, getJSXAttributeName, getJSXAttributeValue, notEmpty, } from './utils';
import { ParsedAttribute, SpreadAttribute, ParsedAttributeType, isRootAttributeKey, RootAttribute, isRootPrefixKey, rootPrefixKeys, RootPrefixKey, RootAttributeKey } from './types';

export const directiveMatchRE = /^v[-A-Z]/
export const directiveReplaceRE = /^v-?/

export const transformJSXAttribute = (path: NodePath<JSXAttribute>): ParsedAttribute => {
  let name = getJSXAttributeName(path)
  const value = getJSXAttributeValue(path) || booleanLiteral(true)
  if (name === 'class' && isStringLiteral(value)) {
    return {
      type: ParsedAttributeType.Root,
      key: RootAttributeKey.StaticClass,
      value
    }
  }
  if (isRootAttributeKey(name)) {
    return {
      type: ParsedAttributeType.Root,
      key: name,
      value
    }
  } else if (isRootPrefixKey(name)) {
    return {
      type: ParsedAttributeType.PrefixGroup,
      prefix: name,
      value
    }
  } else if (name.match(directiveMatchRE)) {
    const rawName = name
    const [nameWithArgument, ...modifiers] = name.split('_')
    const [justName, argument] = nameWithArgument.split(':')
    name = justName.replace(directiveReplaceRE, '')
    name = name[0].toLowerCase() + name.substr(1)
    return {
      type: ParsedAttributeType.Directive,
      rawName,
      name,
      value,
      modifiers,
      argument
    }
  } else {
    const prefix = rootPrefixKeys.find(el => name.startsWith(el)) || RootPrefixKey.Attrs
    if (name.startsWith(prefix)) {
      name = name.replace(new RegExp(`^${prefix}\-?`), '')
      name = name[0].toLowerCase() + name.substr(1)
    }
    return {
      type: ParsedAttributeType.PrefixSimple,
      prefix,
      name,
      value
    }
  }
}

export const transformJSXSpreadAttribute = (path: NodePath<JSXSpreadAttribute>): ParsedAttribute[] => {
  const defaultResult: SpreadAttribute = {
    type: ParsedAttributeType.Spread,
    value: path.node.argument
  }
  const argument = path.get('argument')
  if (argument.isObjectExpression()) {
    const properties = argument.get('properties')
    const result = [] as ParsedAttribute[]

    for (let property of properties) {
      if (property.isSpreadElement()) {
        result.push({
          type: ParsedAttributeType.Spread,
          value: property.node.argument
        })
      } else if (property.isObjectProperty()) {
        const { key, value } = property.node

        let name = ''
        if (isIdentifier(key)) {
          name = key.name
        } else if (isStringLiteral(key)) {
          name = key.value
        }

        if (name && !name.startsWith('on') && !name.startsWith('nativeOn') && isRootPrefixKey(name) && isExpression(value)) {
          result.push({
            type: ParsedAttributeType.PrefixGroup,
            prefix: name,
            value
          })
        } else {
          return [defaultResult]
        }
      } else {
        return [defaultResult]
      }
    }
    return result
  }
  return [defaultResult]
}

export const transformAttribute = (path: NodePath<JSXAttribute | JSXSpreadAttribute>): ParsedAttribute[] =>
  path.isJSXAttribute()
    ? [transformJSXAttribute(path)]
    : transformJSXSpreadAttribute(path as NodePath<JSXSpreadAttribute>)

export const transformJSXText = (path: NodePath<JSXText>) => {
  const node = path.node
  const lines = node.value.split(/\r\n|\n|\r/)

  let lastNonEmptyLine = 0

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/[^ \t]/)) {
      lastNonEmptyLine = i
    }
  }

  let str = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const isFirstLine = i === 0
    const isLastLine = i === lines.length - 1
    const isLastNonEmptyLine = i === lastNonEmptyLine

    // replace rendered whitespace tabs with spaces
    let trimmedLine = line.replace(/\t/g, ' ')

    // trim whitespace touching a newline
    if (!isFirstLine) {
      trimmedLine = trimmedLine.replace(/^[ ]+/, '')
    }

    // trim whitespace touching an endline
    if (!isLastLine) {
      trimmedLine = trimmedLine.replace(/[ ]+$/, '')
    }

    if (trimmedLine) {
      if (!isLastNonEmptyLine) {
        trimmedLine += ' '
      }

      str += trimmedLine
    }
  }

  return str !== '' ? stringLiteral(str) : null
}

export const transformJSXMemberExpression = (path: NodePath<JSXMemberExpression>): MemberExpression => {
  const objectPath = path.get('object')
  const propertyPath = path.get('property')
  const transformedObject = objectPath.isJSXMemberExpression()
    ? transformJSXMemberExpression(objectPath)
    : objectPath.isJSXIdentifier()
    ? identifier(objectPath.node.name)
    : nullLiteral()
  const transformedProperty = identifier(propertyPath.node.name)
  return memberExpression(transformedObject, transformedProperty)
}

export const transformJSXExpressionContainer = (path: NodePath<JSXExpressionContainer>) => {
  const expression = path.node.expression
  return isJSXEmptyExpression(expression) ? null : expression
}

export const transformJSXSpreadChild = (path: NodePath<JSXSpreadChild>) => spreadElement(path.node.expression)

export const transformJSXElement = (path: NodePath<JSXElement>) => {
  return callExpression(identifier('h'), hCallArguments(path))
}