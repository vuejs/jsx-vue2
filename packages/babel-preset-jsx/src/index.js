import babelPluginTransformVueJsx from '@vue/babel-plugin-transform-vue-jsx'
import babelSugarFunctionalVue from '@vue/babel-sugar-functional-vue'
import babelSugarInjectH from '@vue/babel-sugar-inject-h'
import babelSugarVModel from '@vue/babel-sugar-v-model'
import babelSugarVOn from '@vue/babel-sugar-v-on'

export default (_, { functional = true, injectH = true, vModel = true, vOn = true } = {}) => {
  return {
    plugins: [
      functional && babelSugarFunctionalVue,
      injectH && babelSugarInjectH,
      vModel && babelSugarVModel,
      vOn && babelSugarVOn,
      babelPluginTransformVueJsx,
    ].filter(Boolean),
  }
}
