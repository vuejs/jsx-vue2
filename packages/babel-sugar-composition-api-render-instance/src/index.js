import syntaxJsx from '@babel/plugin-syntax-jsx'

const autoImportGetCurrentInstance = (t, path, importSource) => {
  const importNodes = path
    .get('body')
    .filter(p => p.isImportDeclaration())
    .map(p => p.node)
  const vcaImportNodes = importNodes.filter(p => p.source.value === importSource)
  const hasH = vcaImportNodes.some(p =>
    p.specifiers.some(s => t.isImportSpecifier(s) && s.local.name === 'getCurrentInstance'),
  )
  if (!hasH) {
    const vcaImportSpecifier = t.importSpecifier(t.identifier('getCurrentInstance'), t.identifier('getCurrentInstance'))
    if (vcaImportNodes.length > 0) {
      vcaImportNodes[0].specifiers.push(vcaImportSpecifier)
    } else {
      path.unshiftContainer('body', t.importDeclaration([vcaImportSpecifier], t.stringLiteral(importSource)))
    }
  }
}

const injectInstanceId = '__currentInstance'

export default ({ types: t }, { importSource = '@vue/composition-api' } = {}) => {
  return {
    inherits: syntaxJsx,
    visitor: {
      Program(p) {
        p.traverse({
          'ObjectMethod|ObjectProperty'(path1) {
            if (path1.node.key.name !== 'setup') {
              return
            }

            let instanceInjected = false

            path1.traverse({
              JSXAttribute(path2) {
                const n = path2.get('name')
                const isInputOrModel = ['v-on', 'on-input', 'on-change', 'model'].includes(n.node.name)
                if (!isInputOrModel) return
                path2.traverse({
                  MemberExpression(path3) {
                    const obj = path3.get('object')
                    const prop = path3.get('property')
                    if (t.isThisExpression(obj) && t.isIdentifier(prop) && ['$', '_'].includes(prop.node.name[0])) {
                      autoImportGetCurrentInstance(t, p, importSource)
                      if (!instanceInjected) {
                        path1.node.value.body.body.unshift(
                          t.variableDeclaration('const', [
                            t.variableDeclarator(
                              t.identifier(injectInstanceId),
                              t.callExpression(t.identifier('getCurrentInstance'), []),
                            ),
                          ]),
                        )
                        instanceInjected = true
                      }
                      obj.replaceWith(t.identifier(injectInstanceId))
                    }
                  },
                })
              },
            })
          },
        })
      },
    },
  }
}
