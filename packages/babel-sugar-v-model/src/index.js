import camelCase from 'camelcase'
import syntaxJsx from '@babel/plugin-syntax-jsx'

const RANGE_TOKEN = '__r'

const cachedCamelCase = (() => {
  const cache = Object.create(null)
  return string => {
    if (!cache[string]) {
      cache[string] = camelCase(string)
    }

    return cache[string]
  }
})()
const equalCamel = (string, match) => string === match || string === cachedCamelCase(match)
const startsWithCamel = (string, match) => string.startsWith(match) || string.startsWith(cachedCamelCase(match))

export default function(babel) {
  const { types: t } = babel

  return {
    inherits: syntaxJsx,
    visitor: {
      Program(path) {
        path.traverse({
          JSXAttribute(path) {
            const parsed = parseVModel(t, path)
            if (!parsed) {
              return
            }

            const { modifiers, valuePath } = parsed

            const parent = path.parentPath
            transformModel(t, parent, valuePath, modifiers)
            path.remove()
          },
        })
      },
    },
  }
}

/**
 * Parse vModel metadata
 *
 * @param  t
 * @param  path JSXAttribute
 * @returns null | Object<{ modifiers: Set<string>, valuePath: Path<Expression>}>
 */
const parseVModel = (t, path) => {
  if (t.isJSXNamespacedName(path.get('name')) || !startsWithCamel(path.get('name.name').node, 'v-model')) {
    return null
  }
  let modifiers = null
  let _
  if (!t.isJSXExpressionContainer(path.get('value'))) {
    throw new Error('You have to use JSX Expression inside your v-model')
  } else if (t.isJSXIdentifier(path.get('name'))) {
    ;[_, ...modifiers] = path.get('name.name').node.split('_')
    modifiers = new Set(modifiers)
  }
  return {
    modifiers: modifiers,
    valuePath: path.get('value.expression'),
  }
}

/**
 * Transform vModel
 * Origin: https://github.com/vuejs/vue/blob/550c3c0d14af5485bb7e507c504664a7136e9bf9/src/platforms/web/compiler/directives/model.js#L14
 *
 * @param t
 * @param path JSXOpeningElement
 * @param valuePath Path<Expression>
 * @param modifiers Set<string>
 */
const transformModel = (t, path, valuePath, modifiers) => {
  if (isComponent(t, path)) {
    return genComponentModel(t, path, valuePath, modifiers)
  }

  const tag = getTagName(t, path)
  const type = getType(t, path)

  if (tag === 'select') {
    genSelect(t, path, valuePath, modifiers)
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(t, path, valuePath, modifiers)
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(t, path, valuePath, modifiers)
  } else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(t, path, valuePath, modifiers, type)
  } else {
    throw new Error(`vModel: ${tag}[type=${type}] is not supported`)
  }
  addModel(t, path, valuePath, modifiers)
}

/**
 * Check if a JSXOpeningElement is a component
 *
 * @param t
 * @param path JSXOpeningElement
 * @returns boolean
 */
const isComponent = (t, path) => {
  const name = path.get('name')
  if (t.isJSXMemberExpression(name)) {
    return true
  } else {
    const firstChar = name.get('name').node[0]
    return firstChar >= 'A' && firstChar <= 'Z'
  }
}

/**
 * Get JSX element tag name
 *
 * @param t
 * @param path Path<JSXOpeningElement>
 */
const getTagName = (t, path) => path.get('name.name').node

/**
 * Get JSX element type
 *
 * @param t
 * @param path Path<JSXOpeningElement>
 */
const getType = (t, path) => {
  const typePath = path
    .get('attributes')
    .find(
      attributePath =>
        t.isJSXAttribute(attributePath) &&
        t.isJSXIdentifier(attributePath.get('name')) &&
        attributePath.get('name.name').node === 'type' &&
        t.isStringLiteral(attributePath.get('value')),
    )

  return typePath ? typePath.get('value.value').node : ''
}

/**
 * Add event handler to a JSX element
 *
 * @param t
 * @param path JSXOpeningElement
 * @param event string
 * @param body Array<Statement>
 */
const addHandler = (t, path, event, body) => {
  addProp(t, path, `on-${event}`, t.arrowFunctionExpression([t.identifier('$event')], t.blockStatement(body)))
}

/**
 * Add property to a JSX element
 *
 * @param t
 * @param path JSXOpeningElement
 * @param propName string
 * @param expression Expression
 */
const addProp = (t, path, propName, expression) => {
  path.node.attributes.push(t.jSXAttribute(t.jSXIdentifier(propName), t.jSXExpressionContainer(expression)))
}

/**
 * Generate assignment code, considering reactivity caveats
 * Origin: https://github.com/vuejs/vue/blob/550c3c0d14af5485bb7e507c504664a7136e9bf9/src/compiler/directives/model.js#L36
 *
 * @param t
 * @param valuePath Path<Expression>
 * @param valueExpression Expression
 */
const genAssignmentCode = (t, valuePath, valueExpression) => {
  if (t.isMemberExpression(valuePath) && valuePath.node.computed) {
    return t.callExpression(t.memberExpression(t.thisExpression(), t.identifier('$set')), [
      valuePath.get('object').node,
      valuePath.get('property').node,
      valueExpression,
    ])
  } else {
    return t.assignmentExpression('=', valuePath.node, valueExpression)
  }
}

/**
 * Get value/expression from a JSX attribute and remove it
 * Origin: https://github.com/vuejs/vue/blob/550c3c0d14af5485bb7e507c504664a7136e9bf9/src/compiler/helpers.js#L123
 *
 * @param t
 * @param path JSXOpeningElement
 * @param attribute string
 */
const getBindingAttr = (t, path, attribute) => {
  const attributePath = path
    .get('attributes')
    .find(
      attributePath =>
        t.isJSXAttribute(attributePath) &&
        t.isJSXIdentifier(attributePath.get('name')) &&
        equalCamel(attributePath.get('name.name').node, attribute),
    )

  if (attributePath) {
    const result = t.isJSXExpressionContainer(attributePath.get('value'))
      ? attributePath.get('value.expression').node
      : attributePath.get('value').node
    attributePath.remove()
    return result
  }
  return null
}

/**
 * Generate model props for a component
 * Origin: https://github.com/vuejs/vue/blob/550c3c0d14af5485bb7e507c504664a7136e9bf9/src/compiler/directives/model.js#L6
 *
 * @param t
 * @param path JSXOpeningElement
 * @param valuePath Path<Expression>
 * @param modifiers Set<string>
 */
const genComponentModel = (t, path, valuePath, modifiers) => {
  const baseValueExpression = t.identifier('$$v')
  let valueExpression = baseValueExpression
  if (modifiers.has('trim')) {
    valueExpression = t.conditionalExpression(
      t.binaryExpression('===', t.unaryExpression('typeof', baseValueExpression), t.stringLiteral('string')),
      t.callExpression(t.memberExpression(baseValueExpression, t.identifier('trim')), []),
      baseValueExpression,
    )
  }
  if (modifiers.has('number')) {
    valueExpression = t.callExpression(t.memberExpression(t.thisExpression(), t.identifier('_n')), [valueExpression])
  }
  const assignment = genAssignmentCode(t, valuePath, valueExpression)

  path.node.attributes.push(
    t.jSXAttribute(
      t.jSXIdentifier('model'),
      t.jSXExpressionContainer(
        t.objectExpression([
          t.objectProperty(t.identifier('value'), valuePath.node),
          t.objectProperty(
            t.identifier('callback'),
            t.arrowFunctionExpression([t.identifier('$$v')], t.blockStatement([t.expressionStatement(assignment)])),
          ),
        ]),
      ),
    ),
  )
}

/**
 * Generate model props for input[type="selet"]
 * Origin: https://github.com/vuejs/vue/blob/550c3c0d14af5485bb7e507c504664a7136e9bf9/src/platforms/web/compiler/directives/model.js#L108
 *
 * @param t
 * @param path JSXOpeningElement
 * @param valuePath Path<Expression>
 * @param modifiers Set<string>
 */
const genSelect = (t, path, valuePath, modifiers) => {
  const number = modifiers.has('number')

  const selectedValReturn = t.conditionalExpression(
    t.binaryExpression('in', t.stringLiteral('_value'), t.identifier('o')),
    t.memberExpression(t.identifier('o'), t.identifier('_value')),
    t.memberExpression(t.identifier('o'), t.identifier('value')),
  )

  const selectedVal = t.callExpression(
    t.memberExpression(
      t.callExpression(
        t.memberExpression(
          t.memberExpression(
            t.memberExpression(t.identifier('Array'), t.identifier('prototype')),
            t.identifier('filter'),
          ),
          t.identifier('call'),
        ),
        [
          t.memberExpression(
            t.memberExpression(t.identifier('$event'), t.identifier('target')),
            t.identifier('options'),
          ),
          t.arrowFunctionExpression(
            [t.identifier('o')],
            t.memberExpression(t.identifier('o'), t.identifier('selected')),
          ),
        ],
      ),
      t.identifier('map'),
    ),
    [
      t.arrowFunctionExpression(
        [t.identifier('o')],
        number
          ? t.callExpression(t.memberExpression(t.thisExpression(), t.identifier('_n')), [selectedValReturn])
          : selectedValReturn,
      ),
    ],
  )

  const assignment = t.conditionalExpression(
    t.memberExpression(t.memberExpression(t.identifier('$event'), t.identifier('target')), t.identifier('multiple')),
    t.identifier('$$selectedVal'),
    t.memberExpression(t.identifier('$$selectedVal'), t.numericLiteral(0), true),
  )

  const code = t.variableDeclaration('const', [t.variableDeclarator(t.identifier('$$selectedVal'), selectedVal)])

  addHandler(t, path, 'change', [code, t.expressionStatement(genAssignmentCode(t, valuePath, assignment))])
}

/**
 * Generate model props for input[type="checkbox"]
 * Origin: https://github.com/vuejs/vue/blob/550c3c0d14af5485bb7e507c504664a7136e9bf9/src/platforms/web/compiler/directives/model.js#L65
 *
 * @param t
 * @param path JSXOpeningElement
 * @param valuePath Path<Expression>
 * @param modifiers Set<string>
 */
const genCheckboxModel = (t, path, valuePath, modifiers) => {
  const value = valuePath.node
  const number = modifiers.has('number')
  const valueBinding = getBindingAttr(t, path, 'value') || t.nullLiteral()
  const trueValueBinding = getBindingAttr(t, path, 'true-value') || t.booleanLiteral(true)
  const falseValueBinding = getBindingAttr(t, path, 'false-value') || t.booleanLiteral(false)
  addProp(
    t,
    path,
    'domProps-checked',
    t.conditionalExpression(
      t.callExpression(t.memberExpression(t.identifier('Array'), t.identifier('isArray')), [value]),
      t.binaryExpression(
        '>',
        t.callExpression(t.memberExpression(t.thisExpression(), t.identifier('_i')), [value, valueBinding]),
        t.unaryExpression('-', t.numericLiteral(1)),
      ),
      t.isBooleanLiteral(trueValueBinding) && trueValueBinding.value
        ? value
        : t.callExpression(t.memberExpression(t.thisExpression(), t.identifier('_q')), [value, trueValueBinding]),
    ),
  )
  addHandler(t, path, 'change', [
    t.variableDeclaration('const', [
      t.variableDeclarator(t.identifier('$$a'), value),
      t.variableDeclarator(t.identifier('$$el'), t.memberExpression(t.identifier('$event'), t.identifier('target'))),
      t.variableDeclarator(
        t.identifier('$$c'),
        t.conditionalExpression(
          t.memberExpression(t.identifier('$$el'), t.identifier('checked')),
          trueValueBinding,
          falseValueBinding,
        ),
      ),
    ]),
    t.ifStatement(
      t.callExpression(t.memberExpression(t.identifier('Array'), t.identifier('isArray')), [t.identifier('$$a')]),
      t.blockStatement([
        t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier('$$v'),
            number
              ? t.callExpression(t.memberExpression(t.thisExpression(), t.identifier('_n')), [valueBinding])
              : valueBinding,
          ),
          t.variableDeclarator(
            t.identifier('$$i'),
            t.callExpression(t.memberExpression(t.thisExpression(), t.identifier('_i')), [
              t.identifier('$$a'),
              t.identifier('$$v'),
            ]),
          ),
        ]),
        t.ifStatement(
          t.memberExpression(t.identifier('$$el'), t.identifier('checked')),
          t.blockStatement([
            t.expressionStatement(
              t.logicalExpression(
                '&&',
                t.binaryExpression('<', t.identifier('$$i'), t.numericLiteral(0)),
                genAssignmentCode(
                  t,
                  valuePath,
                  t.callExpression(t.memberExpression(t.identifier('$$a'), t.identifier('concat')), [
                    t.arrayExpression([t.identifier('$$v')]),
                  ]),
                ),
              ),
            ),
          ]),
          t.blockStatement([
            t.expressionStatement(
              t.logicalExpression(
                '&&',
                t.binaryExpression('>', t.identifier('$$i'), t.unaryExpression('-', t.numericLiteral(1))),
                genAssignmentCode(
                  t,
                  valuePath,
                  t.callExpression(
                    t.memberExpression(
                      t.callExpression(t.memberExpression(t.identifier('$$a'), t.identifier('slice')), [
                        t.numericLiteral(0),
                        t.identifier('$$i'),
                      ]),
                      t.identifier('concat'),
                    ),
                    [
                      t.callExpression(t.memberExpression(t.identifier('$$a'), t.identifier('slice')), [
                        t.binaryExpression('+', t.identifier('$$i'), t.numericLiteral(1)),
                      ]),
                    ],
                  ),
                ),
              ),
            ),
          ]),
        ),
      ]),
      t.blockStatement([t.expressionStatement(genAssignmentCode(t, valuePath, t.identifier('$$c')))]),
    ),
  ])
}

/**
 * Generate model props for input[type="radio"]
 * Origin: https://github.com/vuejs/vue/blob/550c3c0d14af5485bb7e507c504664a7136e9bf9/src/platforms/web/compiler/directives/model.js#L96
 *
 * @param t
 * @param path JSXOpeningElement
 * @param valuePath Path<Expression>
 * @param modifiers Set<string>
 */
const genRadioModel = (t, path, valuePath, modifiers) => {
  const number = modifiers.has('number')
  let valueBinding = getBindingAttr(t, path, 'value') || t.nullLiteral()
  valueBinding = number
    ? t.callExpression(t.memberExpression(t.thisExpression(), t.identifier('_n')), [valueBinding])
    : valueBinding

  addProp(
    t,
    path,
    'domProps-checked',
    t.callExpression(t.memberExpression(t.thisExpression(), t.identifier('_q')), [valuePath.node, valueBinding]),
  )
  addHandler(t, path, 'change', [t.expressionStatement(genAssignmentCode(t, valuePath, valueBinding))])
}

const addModel = (t, path, valuePath, modifiers) => {
  path.node.attributes.push(
    t.jSXSpreadAttribute(
      t.objectExpression([
        t.objectProperty(
          t.identifier('directives'),
          t.arrayExpression([
            t.objectExpression([
              t.objectProperty(t.identifier('name'), t.stringLiteral('model')),
              t.objectProperty(t.identifier('value'), valuePath.node),
              t.objectProperty(
                t.identifier('modifiers'),
                t.objectExpression(
                  [...modifiers].map(modifier => t.objectProperty(t.identifier(modifier), t.booleanLiteral(true))),
                ),
              ),
            ]),
          ]),
        ),
      ]),
    ),
  )
}

/**
 * Generate model props for generic input and textarea
 * Origin: https://github.com/vuejs/vue/blob/550c3c0d14af5485bb7e507c504664a7136e9bf9/src/platforms/web/compiler/directives/model.js#L125
 *
 * @param t
 * @param path JSXOpeningElement
 * @param valuePath Path<Expression>
 * @param modifiers Set<string>
 */
const genDefaultModel = (t, path, valuePath, modifiers, type) => {
  const lazy = modifiers.has('lazy')
  const number = modifiers.has('number')
  const trim = modifiers.has('trim')

  const needCompositionGuard = !lazy && type !== 'range'

  const event = lazy ? 'change' : type === 'range' ? RANGE_TOKEN : 'input'

  let valueExpression = t.memberExpression(
    t.memberExpression(t.identifier('$event'), t.identifier('target')),
    t.identifier('value'),
  )
  if (trim) {
    valueExpression = t.callExpression(t.memberExpression(valueExpression, t.identifier('trim')), [])
  }
  if (number) {
    valueExpression = t.callExpression(t.memberExpression(t.thisExpression(), t.identifier('_n')), [valueExpression])
  }

  let code = [t.expressionStatement(genAssignmentCode(t, valuePath, valueExpression))]

  if (needCompositionGuard) {
    code = [
      t.ifStatement(
        t.memberExpression(
          t.memberExpression(t.identifier('$event'), t.identifier('target')),
          t.identifier('composing'),
        ),
        t.returnStatement(),
      ),
      ...code,
    ]
  }

  addProp(t, path, 'domProps-value', valuePath.node)
  addHandler(t, path, event, code)
  if (trim || number) {
    addHandler(t, path, 'blur', [
      t.expressionStatement(t.callExpression(t.memberExpression(t.thisExpression(), t.identifier('$forceUpdate')), [])),
    ])
  }
}
