import Vue, { h, reactive } from 'vue'

type VueJSXPresetOptions = {
  functional?: boolean
  injectH?: boolean
  vModel?: boolean
  vOn?: boolean
  compositionAPI?: true | 'auto' | 'native' | 'plugin' | 'vue-demi' | false | { importSource: string }
}

export { type VueJSXPresetOptions }

export const compilerOptions: VueJSXPresetOptions = reactive({
  functional: true,
  injectH: true,
  vModel: true,
  vOn: true,
  compositionAPI: false,
})

const App = {
  setup() {
    return () => [
      h('div', { attrs: { id: 'header' } }, [
        h('h1', 'JSX-Vue2 Playground'),
        h(
          'a',
          {
            attrs: {
              href: 'https://app.netlify.com/sites/jsx-vue2-playground/deploys',
              target: '_blank',
            },
          },
          'History',
        ),

        h('div', { attrs: { id: 'options-wrapper' } }, [
          h('div', { attrs: { id: 'options-label' } }, 'Options ↘'),
          h('ul', { attrs: { id: 'options' } }, [
            h('li', [
              h('input', {
                attrs: {
                  type: 'checkbox',
                  id: 'functional',
                  name: 'functional',
                },
                domProps: {
                  checked: compilerOptions.functional,
                },
                on: {
                  change: (e: Event) => {
                    compilerOptions.functional = (e.target as HTMLInputElement).checked
                  },
                },
              }),
              h('label', { attrs: { for: 'functional' } }, ['functional']),
            ]),

            h('li', [
              h('input', {
                attrs: {
                  type: 'checkbox',
                  id: 'injectH',
                  name: 'injectH',
                },
                domProps: {
                  checked: compilerOptions.injectH,
                },
                on: {
                  change: (e: Event) => {
                    compilerOptions.injectH = (e.target as HTMLInputElement).checked
                  },
                },
              }),
              h('label', { attrs: { for: 'injectH' } }, ['injectH']),
            ]),

            h('li', [
              h('input', {
                attrs: {
                  type: 'checkbox',
                  id: 'vModel',
                  name: 'vModel',
                },
                domProps: {
                  checked: compilerOptions.vModel,
                },
                on: {
                  change: (e: Event) => {
                    compilerOptions.vModel = (e.target as HTMLInputElement).checked
                  },
                },
              }),
              h('label', { attrs: { for: 'vModel' } }, ['vModel']),
            ]),

            h('li', [
              h('input', {
                attrs: {
                  type: 'checkbox',
                  id: 'vOn',
                  name: 'vOn',
                },
                domProps: {
                  checked: compilerOptions.vOn,
                },
                on: {
                  change: (e: Event) => {
                    compilerOptions.vOn = (e.target as HTMLInputElement).checked
                  },
                },
              }),
              h('label', { attrs: { for: 'vOn' } }, ['vOn']),
            ]),

            h('li', [
              h(
                'span',
                {
                  class: 'label',
                },
                ['compositionAPI:'],
              ),
              h('input', {
                attrs: {
                  type: 'radio',
                  name: 'compositionAPI',
                  id: 'compositionAPI-false',
                },
                domProps: {
                  checked: compilerOptions.compositionAPI === false,
                },
                on: {
                  change: () => (compilerOptions.compositionAPI = false),
                },
              }),
              h(
                'label',
                {
                  attrs: {
                    for: 'compositionAPI-false',
                  },
                },
                ['false'],
              ),
              h('input', {
                attrs: {
                  type: 'radio',
                  name: 'compositionAPI',
                  id: 'compositionAPI-auto',
                },
                domProps: {
                  checked: compilerOptions.compositionAPI === true || compilerOptions.compositionAPI === 'auto',
                },
                on: {
                  change: () => (compilerOptions.compositionAPI = 'auto'),
                },
              }),
              h(
                'label',
                {
                  attrs: {
                    for: 'compositionAPI-auto',
                  },
                },
                ['auto'],
              ),
              h('input', {
                attrs: {
                  type: 'radio',
                  name: 'compositionAPI',
                  id: 'compositionAPI-native',
                },
                domProps: {
                  checked: compilerOptions.compositionAPI === 'native',
                },
                on: {
                  change: () => (compilerOptions.compositionAPI = 'native'),
                },
              }),
              h(
                'label',
                {
                  attrs: {
                    for: 'compositionAPI-native',
                  },
                },
                ['native'],
              ),
              h('input', {
                attrs: {
                  type: 'radio',
                  name: 'compositionAPI',
                  id: 'compositionAPI-plugin',
                },
                domProps: {
                  checked: compilerOptions.compositionAPI === 'plugin',
                },
                on: {
                  change: () => (compilerOptions.compositionAPI = 'plugin'),
                },
              }),
              h(
                'label',
                {
                  attrs: {
                    for: 'compositionAPI-plugin',
                  },
                },
                ['plugin'],
              ),
              h('input', {
                attrs: {
                  type: 'radio',
                  name: 'compositionAPI',
                  id: 'compositionAPI-vue-demi',
                },
                domProps: {
                  checked: compilerOptions.compositionAPI === 'vue-demi',
                },
                on: {
                  change: () => (compilerOptions.compositionAPI = 'vue-demi'),
                },
              }),
              h(
                'label',
                {
                  attrs: {
                    for: 'compositionAPI-vue-demi',
                  },
                },
                ['vue-demi'],
              ),
            ]),
          ]),
        ]),
      ]),
    ]
  },
}

export function initOptions() {
  new Vue({
    render: h => h(App),
  }).$mount(document.getElementById('header')!)
}
