import * as monaco from 'monaco-editor'
import { watchEffect } from 'vue'
import { transform } from '@babel/standalone'
import babelPresetJsx from '@vue/babel-preset-jsx'
import { compilerOptions, initOptions } from './options'

const sharedEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  theme: 'vs-dark',
  fontSize: 14,
  wordWrap: 'on',
  scrollBeyondLastLine: false,
  renderWhitespace: 'selection',
  contextmenu: false,
  minimap: {
    enabled: false,
  },
}

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  allowJs: true,
  allowNonTsExtensions: true,
  jsx: monaco.languages.typescript.JsxEmit.Preserve,
  target: monaco.languages.typescript.ScriptTarget.Latest,
})

const editor = monaco.editor.create(document.getElementById('source')!, {
  value: decodeURIComponent(window.location.hash.slice(1)) || 'const App = () => <div>Hello World</div>',
  language: 'typescript',
  tabSize: 2,
  ...sharedEditorOptions,
})

const output = monaco.editor.create(document.getElementById('output')!, {
  value: '',
  language: 'javascript',
  readOnly: true,
  tabSize: 2,
  ...sharedEditorOptions,
})

const reCompile = () => {
  const src = editor.getValue()
  window.location.hash = encodeURIComponent(src)
  // console.clear()
  try {
    const result = transform(src, {
      // somehow the transform function won't actually rerun
      // if the options are the same object, thus we have to spread it
      presets: [[babelPresetJsx, { ...compilerOptions }]],
      ast: true,
    })
    console.log('AST', result.ast!)
    output.setValue(result.code!)
  } catch (err) {
    output.setValue((err as Error).message!)
    console.error(err)
  }
}

initOptions()
watchEffect(reCompile)
// update compile output when input changes
editor.onDidChangeModelContent(debounce(reCompile))

function debounce<T extends (...args: any[]) => any>(fn: T, delay = 300): T {
  let prevTimer: number | null = null
  return ((...args: any[]) => {
    if (prevTimer) {
      clearTimeout(prevTimer)
    }
    prevTimer = window.setTimeout(() => {
      fn(...args)
      prevTimer = null
    }, delay)
  }) as any
}
