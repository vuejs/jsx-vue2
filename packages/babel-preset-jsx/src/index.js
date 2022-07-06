import babelPluginTransformVueJsx from '@vue/babel-plugin-transform-vue-jsx'
import babelSugarFunctionalVue from '@vue/babel-sugar-functional-vue'
import babelSugarInjectH from '@vue/babel-sugar-inject-h'
import babelSugarCompositionApiInjectH from '@vue/babel-sugar-composition-api-inject-h'
import babelSugarCompositionApiRenderInstance from '@vue/babel-sugar-composition-api-render-instance'
import babelSugarVModel from '@vue/babel-sugar-v-model'
import babelSugarVOn from '@vue/babel-sugar-v-on'

export default (_, {
  functional = true,
  injectH = true,
  vModel = true,
  vOn = true,
  compositionAPI = false
} = {}) => {
  // compositionAPI: 'auto' | 'native' | 'plugin' | false
  // legacy: compositionAPI: true (equivalent to 'auto')
  // bonus:  compositionAPI: 'naruto' (equivalent to 'native')
  let injectHPlugin = babelSugarInjectH
  let importSource = '@vue/composition-api'

  if (compositionAPI) {
    if (compositionAPI === 'native' || compositionAPI === 'naruto') {
      importSource = 'vue'
    }

    if (compositionAPI === 'auto' || compositionAPI === true) {
      try {
        const vueVersion = require('vue/package.json').version
        if (vueVersion.startsWith('2.7')) {
          importSource = 'vue'
        }
      } catch (e) {}
    }

    injectHPlugin = [babelSugarCompositionApiInjectH, { importSource }]
  }

  return {
    plugins: [
      functional && babelSugarFunctionalVue,
      injectH && injectHPlugin,
      vModel && babelSugarVModel,
      vOn && babelSugarVOn,
      compositionAPI && [babelSugarCompositionApiRenderInstance, { importSource }],
      babelPluginTransformVueJsx,
    ].filter(Boolean),
  }
}
