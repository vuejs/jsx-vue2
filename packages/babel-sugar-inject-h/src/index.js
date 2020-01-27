import syntaxJsx from '@babel/plugin-syntax-jsx'

/**
 * Check if first parameter is `h`
 * @param t
 * @param path ObjectMethod | ClassMethod
 * @returns boolean
 */
const firstParamIsH = (t, path) => {
  const params = path.get('params')
  return params.length && t.isIdentifier(params[0]) && params[0].node.name === 'h'
}

/**
 * Check if body contains JSX
 * @param t
 * @param path ObjectMethod | ClassMethod
 * @returns boolean
 */
const hasJSX = (t, path) => {
  const JSXChecker = {
    hasInnerFunction: false,
    hasJSX: false,
  }
  path.traverse(
    {
      JSXElement() {
        if (!this.hasInnerFunction) {
          this.hasJSX = true
        }
      },
      Function() {
        this.hasInnerFunction = true
      }
    },
    JSXChecker,
  )
  return JSXChecker.hasJSX
}

/**
 * Check if is inside a JSX expression
 * @param t
 * @param path ObjectMethod | ClassMethod
 * @returns boolean
 */
const isInsideJSXExpression = (t, path) => {
  if (!path.parentPath) {
    return false
  }
  if (t.isJSXExpressionContainer(path.parentPath)) {
    return true
  }
  return isInsideJSXExpression(t, path.parentPath)
}

export default babel => {
  const t = babel.types

  return {
    inherits: syntaxJsx,
    visitor: {
      Program(path) {
        path.traverse({
          'Function'(path) {
            if (firstParamIsH(t, path) || !hasJSX(t, path) || isInsideJSXExpression(t, path)) {
              return
            }

            const isAddParameter = path.node.key === undefined || path.node.key.name === 'render'

            if (isAddParameter) {
              path.node.params = [t.identifier('h'), ...path.node.params]
            } else {
              path
                .get('body')
                .unshiftContainer(
                  'body',
                  t.variableDeclaration('const', [
                    t.variableDeclarator(
                      t.identifier('h'),
                      t.memberExpression(t.thisExpression(), t.identifier('$createElement')),
                    ),
                  ]),
                )
            }
          },
        })
      },
    },
  }
}
