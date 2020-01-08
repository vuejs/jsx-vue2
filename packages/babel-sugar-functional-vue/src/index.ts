import { PluginObj, NodePath } from '@babel/core'

import syntaxJsx from '@babel/plugin-syntax-jsx'
import { ArrowFunctionExpression, identifier, objectProperty, booleanLiteral, arrowFunctionExpression, stringLiteral, objectExpression, VariableDeclarator, Identifier } from '@babel/types'
// import { transformJSXElement } from './transforms'

const isInMethod = (path: NodePath, parentLimitPath: NodePath): boolean => {
  if (!path || path === parentLimitPath) {
    return false
  }
  if (path.isObjectMethod()) {
    return true
  }
  return isInMethod(path.parentPath, parentLimitPath)
}

export const hasJSX = (path: NodePath) => {
  let hasJSX = false

  path.traverse({
    JSXElement(elPath) {
      if (!isInMethod(elPath, path)) {
        hasJSX = true
      }
    },
  })

  return hasJSX
}

export const convertFunctionalComponent = (path: NodePath<ArrowFunctionExpression>, name: string | null = null) => {
  const params = [identifier('h'), ...path.node.params]
  const body = path.node.body
  const props = [
    objectProperty(identifier('functional'), booleanLiteral(true)),
    objectProperty(identifier('render'), arrowFunctionExpression(params, body)),
  ]
  if (process.env.NODE_ENV === 'development' && name) {
    props.unshift(objectProperty(identifier('name'), stringLiteral(name)))
  }
  path.replaceWith(objectExpression(props))
}

export const isFunctionalComponentDeclarator = (path: NodePath<VariableDeclarator>) => {
  const id = path.get('id')
  if (!id.isIdentifier()) {
    return false
  }

  const firstCharacter = id.node.name[0]
  if (firstCharacter < 'A' || firstCharacter > 'Z') {
    return false
  }

  return hasJSX(path)
}

const plugin: PluginObj = {
  name: 'babel-plugin-transform-vue-js',
  inherits: syntaxJsx,
  visitor: {
    ExportDefaultDeclaration (path) {
      const declaration = path.get('declaration')
      if (!declaration.isArrowFunctionExpression() || !hasJSX(path)) {
        return
      }

      convertFunctionalComponent(declaration)
    },
    VariableDeclaration (path) {
      const declarations = path.get('declarations')
      const firstDeclaration = declarations[0]

      if (declarations.length !== 1 || !firstDeclaration.isVariableDeclarator()) {
        return
      }

      const init = firstDeclaration.get('init')

      if(!init.isArrowFunctionExpression()) {
        return
      }

      if (!isFunctionalComponentDeclarator(firstDeclaration)) {
        return
      }

      const name = (path.node.declarations[0].id as Identifier).name
      convertFunctionalComponent(init, name)
    }
  }
}

export default plugin