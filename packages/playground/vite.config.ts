import { defineConfig } from 'vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'css', 'html', 'json', 'typescript'],
    }),
  ],
  optimizeDeps: {
    include: ['@vue/babel-preset-jsx'],
  },
  build: {
    commonjsOptions: {
      include: [/packages\/babel-/, /node_modules/],
    },
    minify: false,
  },
  define: {
    'process.env': {},
  },
})
