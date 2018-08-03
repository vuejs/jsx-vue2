import istanbul from 'rollup-plugin-istanbul'

export default {
  input: 'src/index.js',
  plugins: [istanbul()],
  output: [
    {
      file: 'dist/plugin.testing.js',
      format: 'cjs',
    },
  ],
}
