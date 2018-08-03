import babelPluginTransformVueJsx from '@vuejs/babel-plugin-transform-vue-jsx'
import babelSugarFunctionalVue from '@vuejs/babel-sugar-functional-vue'
import babelSugarInjectH from '@vuejs/babel-sugar-inject-h'
import babelSugarVModel from '@vuejs/babel-sugar-v-model'

export default (_, { functional = true, injectH = true, vModel = true } = {}) => {
  return {
    plugins: [
      functional && babelSugarFunctionalVue,
      injectH && babelSugarInjectH,
      vModel && babelSugarVModel,
      babelPluginTransformVueJsx,
    ].filter(Boolean),
  }
}
