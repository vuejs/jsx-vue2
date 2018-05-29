import syntaxJsx from '@babel/plugin-syntax-jsx'

/**
 * Check if expression is in method
 * @param t
 * @param path
 * @param parentLimitPath
 * @returns boolean
 */
const isInMethod = (t, path, parentLimitPath) => {
  if (!path || path === parentLimitPath) {
    return false
  }
  if (t.isObjectMethod(path)) {
    return true
  }
  return isInMethod(t, path.parentPath, parentLimitPath)
}

/**
 * Check if it's a functional componet declarator
 * @param t
 * @param path
 * @returns boolean
 */
const isFunctionalComponentDeclarator = (t, path) => {
  const firstCharacter = path.get('id.name').node[0]
  if (firstCharacter < 'A' || firstCharacter > 'Z') {
    return false
  }

  let hasJSX = false

  path.traverse({
    JSXElement(elPath) {
      if (!isInMethod(t, elPath, path)) {
        hasJSX = true
      }
    },
  })

  if (!hasJSX) {
    return false
  }
  return true
}

export default babel => {
  const { types: t } = babel

  return {
    inherits: syntaxJsx,
    visitor: {
      Program(path) {
        path.traverse({
          VariableDeclaration(path) {
            if (
              path.node.declarations.length !== 1 ||
              !t.isVariableDeclarator(path.node.declarations[0]) ||
              !t.isArrowFunctionExpression(path.node.declarations[0].init)
            ) {
              return
            }

            const declarator = path.get('declarations')[0]

            if (!isFunctionalComponentDeclarator(t, declarator)) {
              return
            }

            const name = path.node.declarations[0].id.name
            const params = [t.identifier('h'), ...path.node.declarations[0].init.params]
            const body = path.node.declarations[0].init.body
            const isDevEnv = process.env.NODE_ENV === 'development'
            const props = [
              t.objectProperty(t.identifier('functional'), t.booleanLiteral(true)),
              t.objectProperty(t.identifier('render'), t.arrowFunctionExpression(params, body)),
            ]
            if (isDevEnv) {
              props.unshift(t.objectProperty(t.identifier('name'), t.stringLiteral(name)))
            }
            path.replaceWith(
              t.variableDeclaration('const', [t.variableDeclarator(t.identifier(name), t.objectExpression(props))]),
              [],
            )
          },
        })
      },
    },
  }
}
