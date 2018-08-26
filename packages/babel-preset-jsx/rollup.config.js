import minify from 'rollup-plugin-babel-minify'

export default {
  input: 'src/index.js',
  plugins: [minify({ comments: false })],
  output: [
    {
      file: 'dist/plugin.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/plugin.js',
      format: 'esm',
    },
  ],
}
