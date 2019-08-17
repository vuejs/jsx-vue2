import syntaxJsx from '@babel/plugin-syntax-jsx'

const entry = 'vue-function-api'

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
    hasJSX: false,
  }
  path.traverse(
    {
      JSXElement() {
        this.hasJSX = true
      },
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
          'ObjectMethod|ClassMethod'(path) {
            if (firstParamIsH(t, path) || !hasJSX(t, path) || isInsideJSXExpression(t, path)) {
              return
            }

            const isRender = path.node.key.name === 'render'
            const isSetup = path.type === 'ObjectMethod' && path.node.key.name === 'setup'

            path
              .get('body')
              .unshiftContainer(
                'body',
                t.variableDeclaration('const', [
                  t.variableDeclarator(
                    t.identifier('h'),
                    isSetup
                      ? t.memberExpression(
                          t.callExpression(t.identifier('require'), [t.stringLiteral(entry)]),
                          t.identifier('createElement'),
                        )
                      : isRender
                      ? t.memberExpression(t.identifier('arguments'), t.numericLiteral(0), true)
                      : t.memberExpression(t.thisExpression(), t.identifier('$createElement')),
                  ),
                ]),
              )
          },
        })
      },
    },
  }
}
