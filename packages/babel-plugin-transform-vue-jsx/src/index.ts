import { PluginObj } from '@babel/core'

import syntaxJsx from '@babel/plugin-syntax-jsx'
import { transformJSXElement } from './transforms'

const plugin: PluginObj = {
  name: 'babel-plugin-transform-vue-js',
  inherits: syntaxJsx,
  visitor: {
    JSXElement: {
      exit(path) {
        path.replaceWith(transformJSXElement(path))
      }
    }
  }
}

export default plugin