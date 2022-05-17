import syntaxJsx from '@babel/plugin-syntax-jsx'

const importSource = '@vue/composition-api'

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
 * Check if body has declared 'h'
 * @param t
 * @param path ObjectMethod | ClassMethod
 * @returns boolean
 */
const hasDeclareH = (t, path) => {
  const hChecker = {
    hasDeclareH: false
  }
  path.traverse({
    VariableDeclaration(varPath) {
      varPath.traverse({
        Identifier(p) {
          if (p.node.name === 'h') {
            hChecker.hasDeclareH = true
          }
        }
      })
    }
  })
  return hChecker.hasDeclareH
}

// remove `var h = this.$createElement;` in `setup()`
const remove$createElement = (t, path) => {
  path.traverse({
    ObjectMethod(p) {
      const isSetup = p.node.key.name === 'setup'
      if (!isSetup) return
      p.traverse({
        VariableDeclaration(varPath) {
          varPath.traverse({
            MemberExpression(p) {
              if (
                t.isThisExpression(p.node.object) &&
                t.isIdentifier(p.node.property) &&
                p.node.property.name === '$createElement'
              ) {
                varPath.remove()
              }
            },
          })
        },
      })
    },
  })
}

// auto import `h` from `@vue/composition-api`
const autoImportH = (t, path) => {
  path.traverse({
    'ObjectMethod|ObjectProperty|ClassMethod'(path1) {
      if (!hasJSX(t, path1)) return
      if (path1.node.key.name === 'setup') {
        if (hasDeclareH(t, path1)) return
        const importNodes = path
          .get('body')
          .filter(p => p.isImportDeclaration())
          .map(p => p.node)
        const vcaImportNodes = importNodes.filter(p => p.source.value === importSource)
        const hasVcaImportNodes = vcaImportNodes.some(p => p.specifiers.some(s => (t.isImportSpecifier(s) && s.local.name === 'getCurrentInstance')))
        if (!hasVcaImportNodes) {
          const vcaImportSpecifier = t.importSpecifier(t.identifier('getCurrentInstance'), t.identifier('getCurrentInstance'))
          if (vcaImportNodes.length > 0) {
            vcaImportNodes[0].specifiers.push(vcaImportSpecifier)
          } else {
            path.unshiftContainer('body', t.importDeclaration([vcaImportSpecifier], t.stringLiteral(importSource)))
          }
        }
        const hDeclaration = t.variableDeclarator(
          t.identifier('h'),
          t.identifier('getCurrentInstance().proxy.$createElement'
        ))
        const hNode = t.variableDeclaration('const', [hDeclaration])
        path1
          .get('body')
          .unshiftContainer(
            'body',
            hNode
          )
      } else {
        if (firstParamIsH(t, path1) || isInsideJSXExpression(t, path1) || hasDeclareH(t, path1)) return
        const isRender = path1.node.key.name === 'render'
        path1
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
    }
  })
}

export default babel => {
  const t = babel.types

  return {
    inherits: syntaxJsx,
    visitor: {
      Program(path) {
        remove$createElement(t, path)
        autoImportH(t, path)
      },
    },
  }
}
