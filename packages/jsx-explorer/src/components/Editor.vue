<template>
  <div>
    <codemirror
      :options="options"
      :value="value"
      @input="$emit('input', $event)"
    />
  </div>
</template>

<script>
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/jsx/jsx.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-dark.css'

import { codemirror } from 'vue-codemirror'

export default {
  components: {
    codemirror,
  },
  props: {
    value: String,
    readonly: Boolean,
  },
  data: () => ({
    defaultOptions: {
      tabSize: 2,
      mode: 'text/jsx',
      theme: 'base16-dark',
      lineNumbers: true,
      line: true,
    },
  }),
  computed: {
    options: vm => ({
      ...vm.defaultOptions,
      readOnly: vm.readonly,
    }),
  },
  mounted () {
    this.setHeight()
    window.addEventListener('resize', this.setHeight)
  },
  methods: {
    setHeight () {
      const mirrors = [...this.$el.querySelectorAll('.CodeMirror')]
      if (mirrors.length) {
        const top = mirrors[0].getBoundingClientRect().top
        const height = window.innerHeight - top
        mirrors.forEach(m => m.style.height = height + 'px')
      }
    },
  },
}
</script>
