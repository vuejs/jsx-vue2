import babel from 'rollup-plugin-babel'
import minify from 'rollup-plugin-babel-minify'

export default {
  input: 'src/index.js',
  plugins: [
    babel({
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: [
                'IE 9', // ES5
              ],
            },
            modules: false,
            loose: true,
          },
        ],
      ],
    }),
    minify({ comments: false }),
  ],
  output: [
    {
      file: 'dist/helper.esm.js',
      format: 'es',
    },
    {
      file: 'dist/helper.js',
      format: 'cjs',
    },
  ],
}
