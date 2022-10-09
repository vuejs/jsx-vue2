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

/**
 * check if has Defined H Variable And assigned $createElement in method or arguments[0] in render
 * @param t
 * @param path ObjectMethod | ClassMethod
 * @returns boolean
 */
const hasDefinedHVariable = (t, path) => {
  let result = {
    hasDefined: false
  }

  const inRender = path.node.key.name === 'render'

  path.traverse(
    {
      VariableDeclarator(path, state) {
        if (state.hasDefined || path.node.id.name !== 'h') {
          return
        }

        const { init } = path.node
        state.hasDefined = t.isMemberExpression(init) &&
          (inRender ?
            t.isIdentifier(init.object) && init.object.name === 'arguments' && t.isNumericLiteral(init.property) && init.property.value === 0 :
            t.isThisExpression(init.object) && t.isIdentifier(init.property) && init.property.name === '$createElement'
          )
      }
    },
    result
  )

  return result.hasDefined
}

export default babel => {
  const t = babel.types

  return {
    inherits: syntaxJsx,
    visitor: {
      Program(path1) {
        path1.traverse({
          'ObjectMethod|ClassMethod'(path) {
            if (firstParamIsH(t, path) || !hasJSX(t, path) || isInsideJSXExpression(t, path) || hasDefinedHVariable(t, path)) {
              return
            }

            const isRender = path.node.key.name === 'render'

            path
              .get('body')
              .unshiftContainer(
                'body',
                t.variableDeclaration('const', [
                  t.variableDeclarator(
                    t.identifier('h'),
                    isRender
                      ? t.memberExpression(t.identifier('arguments'), t.numericLiteral(0), true)
                      : t.memberExpression(t.thisExpression(), t.identifier('$createElement')),
                  ),
                ]),
              )
          }
        })
      }
    },
  }
}
