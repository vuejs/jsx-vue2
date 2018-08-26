import camelCase from 'camelcase'
import syntaxJsx from '@babel/plugin-syntax-jsx'

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

const keyModifiers = ['ctrl', 'shift', 'alt', 'meta']
const keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  delete: [8, 46],
}
// KeyboardEvent.key aliases
const keyNames = {
  // #7880: IE11 and Edge use `Esc` for Escape key name.
  esc: ['Esc', 'Escape'],
  tab: 'Tab',
  enter: 'Enter',
  space: ' ',
  // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
  up: ['Up', 'ArrowUp'],
  left: ['Left', 'ArrowLeft'],
  right: ['Right', 'ArrowRight'],
  down: ['Down', 'ArrowDown'],
  delete: ['Backspace', 'Delete'],
}

export default function(babel) {
  const t = babel.types

  function genGuard(expression) {
    return t.ifStatement(expression, t.returnStatement(t.nullLiteral()))
  }

  function genCallExpression(expression, args = []) {
    return t.callExpression(expression, args)
  }

  function genEventExpression(name) {
    return t.memberExpression(t.identifier('$event'), t.identifier(name))
  }

  function not(expression) {
    return t.unaryExpression('!', expression)
  }

  function notEq(left, right) {
    return t.binaryExpression('!==', left, right)
  }

  function and(left, right) {
    return t.logicalExpression('&&', left, right)
  }

  function or(left, right) {
    return t.logicalExpression('||', left, right)
  }

  function hasButton() {
    return t.binaryExpression('in', t.stringLiteral('button'), t.identifier('$event'))
  }

  const modifierCode = {
    // stop: '$event.stopPropagation();',
    stop: () => genCallExpression(genEventExpression('stopPropagation')),
    // prevent: '$event.preventDefault();',
    prevent: () => genCallExpression(genEventExpression('preventDefault')),
    // self: genGuard(`$event.target !== $event.currentTarget`),
    self: () => genGuard(notEq(genEventExpression('target'), genEventExpression('currentTarget'))),
    // ctrl: genGuard(`!$event.ctrlKey`),
    ctrl: () => genGuard(not(genEventExpression('ctrlKey'))),
    // shift: genGuard(`!$event.shiftKey`),
    shift: () => genGuard(not(genEventExpression('shiftKey'))),
    // alt: genGuard(`!$event.altKey`),
    alt: () => genGuard(not(genEventExpression('altKey'))),
    // meta: genGuard(`!$event.metaKey`),
    meta: () => genGuard(not(genEventExpression('metaKey'))),
    // left: genGuard(`'button' in $event && $event.button !== 0`),
    left: () => genGuard(and(hasButton(), notEq(genEventExpression('button'), t.numericLiteral(0)))),
    // middle: genGuard(`'button' in $event && $event.button !== 1`),
    middle: () => genGuard(and(hasButton(), notEq(genEventExpression('button'), t.numericLiteral(1)))),
    // right: genGuard(`'button' in $event && $event.button !== 2`)
    right: () => genGuard(and(hasButton(), notEq(genEventExpression('button'), t.numericLiteral(2)))),
  }

  function genHandlerFunction(body) {
    return t.arrowFunctionExpression([t.identifier('$event')], t.blockStatement(body instanceof Array ? body : [body]))
  }

  /**
   * @param {Path<JSXAttribute>} handlerPath
   */
  function parse(handlerPath) {
    const namePath = handlerPath.get('name')
    let name = t.isJSXNamespacedName(namePath)
      ? `${namePath.get('namespace.name').node}:${namePath.get('name.name').node}`
      : namePath.get('name').node

    const normalizedName = camelCase(name)

    let modifiers
    let argument
    ;[name, ...modifiers] = name.split('_')
    ;[name, argument] = name.split(':')

    if (!equalCamel(name, 'v-on') || !argument) {
      return {
        isInvalid: false,
      }
    }

    if (!t.isJSXExpressionContainer(handlerPath.get('value'))) {
      throw new Error('Only expression container is allowed on v-on directive.')
    }

    const expressionPath = handlerPath.get('value.expression')

    return {
      expression: expressionPath.node,
      modifiers,
      event: argument,
    }
  }

  /**
   * @param {Path<JSXAttribute>} handlerPath
   */
  function genHandler(handlerPath) {
    let { modifiers, isInvalid, expression, event } = parse(handlerPath)
    if (event === 'click' && modifiers.includes('right')) {
      modifiers = modifiers.filter(modifier => modifier !== 'right')
      event = 'contextmenu'
    }
    if (event === 'click' && modifiers.includes('middle')) {
      event = 'mouseup'
    }
    let isNative = false

    if (isInvalid) return

    if (!modifiers || modifiers.length === 0) {
      return {
        event,
        expression,
        isNative,
      }
    }

    const code = []
    const genModifierCode = []
    const keys = []

    for (const key of modifiers) {
      if (modifierCode[key]) {
        const modifierStatement = modifierCode[key]()
        genModifierCode.push(
          t.isExpression(modifierStatement) ? t.expressionStatement(modifierStatement) : modifierStatement,
        )
        if (keyCodes[key]) {
          keys.push(key)
        }
      } else if (key === 'exact') {
        genModifierCode.push(
          genGuard(
            keyModifiers
              .filter(keyModifier => !modifiers.includes(keyModifier))
              .map(keyModifier => genEventExpression(keyModifier + 'Key'))
              .reduce((acc, item) => (acc ? or(acc, item) : item)),
          ),
        )
      } else if (key === 'capture') {
        event = '!' + event
      } else if (key === 'once') {
        event = '~' + event
      } else if (key === 'native') {
        isNative = true
      } else {
        keys.push(key)
      }
    }

    if (keys.length) {
      code.push(genKeyFilter(keys))
    }

    if (genModifierCode.length) {
      code.push(...genModifierCode)
    }

    if (code.length === 0) {
      return {
        event,
        expression,
        isNative,
      }
    }

    code.push(t.returnStatement(genCallExpression(expression, [t.identifier('$event')])))

    return {
      event,
      expression: genHandlerFunction(code),
      isNative,
    }
  }

  function genKeyFilter(keys) {
    return genGuard(keys.map(genFilterCode).reduce((acc, item) => and(acc, item), not(hasButton())))
  }

  function genFilterCode(key) {
    const keyVal = parseInt(key, 10)

    if (keyVal) {
      return notEq(genEventExpression('keyCode'), t.numericLiteral(keyVal))
    }

    const keyCode = keyCodes[key]
    const keyName = keyNames[key]

    return t.callExpression(t.memberExpression(t.thisExpression(), t.identifier('_k')), [
      genEventExpression('keyCode'),
      t.stringLiteral(`${key}`),
      keyCode
        ? Array.isArray(keyCode)
          ? t.arrayExpression(keyCode.map(number => t.numericLiteral(number)))
          : t.numericLiteral(keyCode)
        : t.identifier('undefined'),
      genEventExpression('key'),
      keyName
        ? Array.isArray(keyName)
          ? t.arrayExpression(keyName.map(number => t.stringLiteral(number)))
          : t.stringLiteral(`${keyName}`)
        : t.identifier('undefined'),
    ])
  }

  function addEvent(event, expression, isNative, attributes) {
    if (event[0] !== '~' && event[0] !== '!') {
      attributes.push(
        t.jSXAttribute(
          t.jSXIdentifier(`${isNative ? 'nativeOn' : 'on'}-${event}`),
          t.jSXExpressionContainer(expression),
        ),
      )
    } else {
      attributes.push(
        t.jSXSpreadAttribute(
          t.objectExpression([
            t.objectProperty(
              t.identifier('on'),
              t.objectExpression([t.objectProperty(t.stringLiteral(event), expression)]),
            ),
          ]),
        ),
      )
    }
  }

  return {
    inherits: syntaxJsx,
    visitor: {
      Program(path) {
        path.traverse({
          JSXAttribute(path) {
            const { event, expression, isNative } = genHandler(path)

            if (event) {
              path.remove()

              addEvent(event, expression, isNative, path.parentPath.node.attributes)
            }
          },
        })
      },
    },
  }
}
