export default {
  input: 'src/index.js',
  plugins: [],
  output: [
    {
      file: 'dist/plugin.js',
      format: 'cjs',
    },
    {
      file: 'dist/plugin.esm.js',
      format: 'es',
    },
  ],
}
