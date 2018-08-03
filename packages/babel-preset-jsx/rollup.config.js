import uglify from 'rollup-plugin-uglify-es'

export default {
  input: 'src/index.js',
  plugins: [uglify()],
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
