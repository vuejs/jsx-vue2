<template>
  <div
    id="app"
    :class="`${tabNumberText}-columns`"
  >
    <Header
      :compilation-visible="compilationVisible"
      :evaluate="evaluate"
      :plugin="plugin"
      :enabled-sugars="enabledSugars"
      @toggleCompilation="compilationVisible = !compilationVisible"
      @toggleEvaluate="evaluate = !evaluate"
      @togglePlugin="plugin = !plugin"
      @toggleSugar="toggleSugaer"
    />
    <Editor v-model="code" />
    <Editor
      v-if="compilationVisible"
      v-model="compiledCode"
      readonly
    />
    <Frame
      v-if="evaluate"
      :key="compiledCode"
      :code="compiledCode"
    />
  </div>
</template>

<script>
import debounce from 'lodash.debounce'
import { transform } from '@babel/core'
import prettier from 'prettier/standalone'
import parserBabylon from 'prettier/parser-babylon'
import syntaxJsx from '@babel/plugin-syntax-jsx'

import transformPlugin from '../../babel-plugin-transform-vue-jsx/src/index'
import sugarFunctional from '../../babel-sugar-functional-vue/src/index'

import Header from '@/components/Header'
import Editor from '@/components/Editor'
import Frame from '@/components/Frame'

export default {
  components: {
    Header,
    Editor,
    Frame,
  },
  data: () => ({
    code: `new Vue({
  el: '#app',
  data: { count: 0 },
  methods: {
    inc() {
      this.count++
    },
    dec() {
      this.count--
    }
  },
  render(h) {
    return (
      <div id="app">
        <h2>{this.count}</h2>
        <button onClick={this.inc}>inc</button>
        <button onClick={this.dec}>dec</button>
      </div>
    )
  }
})
`,
    compiledCode: '',

    compilationVisible: true,
    evaluate: false,
    plugin: true,
    enabledSugars: ['functional'],
  }),
  computed: {
    tabNumber: vm => 1 + (vm.evaluate ? 1 : 0) + (vm.compilationVisible ? 1 : 0),
    tabNumberText: vm => vm.tabNumber === 1 ? 'one' : vm.tabNumber === 2 ? 'two' : 'three'
  },
  watch: {
    code (val) {
      this.onInput(val)
    },
    plugin (val) {
      this.onInput(this.code)
    }
  },
  mounted () {
    this.onInput(this.code)
    if (module.hot) {
      module.hot.accept('../../babel-plugin-transform-vue-jsx/src/index', () => {
        if (this.plugin) {
          this.transform(this.code)
        }
      })
      module.hot.accept('../../babel-sugar-functional-vue/src/index', () => {
        if (this.enabledSugars.includes('functional')) {
          this.transform(this.code)
        }
      })
    }
  },
  methods: {
    toggleSugar (sugar) {
      if (this.enabledSugars.includes(sugar)) {
        this.enabledSugars = this.enabledSugars.filter(el => el !== sugar)
      } else {
        this.enabledSugars.push(sugar)
      }
    },
    transform (code) {
      const plugins = [
        syntaxJsx,
        ...(
          this.enabledSugars
            .map(sugar =>
              sugar === 'functional'
                ? sugarFunctional
                : null
            )
            .filter(Boolean)
        ),
        ...(this.plugin ? [transformPlugin] : []),
      ]
      transform(code, { plugins }, (err, result) => {
        if (err) {
          console.error(err)
        } else {
          this.compiledCode = prettier.format(result.code, {
            parser: 'babel',
            plugins: [parserBabylon],
            tabWidth: 2,
            useTabs: false,
            semi: false,
            singleQuote: true,
            quoteProps: 'as-needed',
            trailingComma: 'all',
            bracketSpacing: true,
          })
        }
      })
    },
    onInput: debounce(function (code) {
      this.transform(code)
    }, 500),
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Ubuntu+Mono&display=swap');

* {
  margin: 0;
  padding: 0;
  font-family: 'Ubuntu Mono', monospace;
}

html, body {
  height: 100%;
  width: 100%;
}

#app {
  height: 100%;
  display: grid;
}

.one-columns {
  grid: 50px calc(100vh - 50px) / repeat(1, 1fr);
}
.one-columns .header {
  grid-column: 1 / 2;
}

.two-columns {
  grid: 50px calc(100vh - 50px) / repeat(2, 1fr);
}
.two-columns .header {
  grid-column: 1 / 3;
}

.three-columns {
  grid: 50px calc(100vh - 50px) / repeat(3, 1fr);
}
.three-columns .header {
  grid-column: 1 / 4;
}

</style>
