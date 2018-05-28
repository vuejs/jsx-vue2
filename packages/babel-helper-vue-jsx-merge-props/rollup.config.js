import { rollup } from 'rollup'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify-es'

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
                'ie 11', // es5
              ],
            },
            modules: false,
            loose: true,
          },
        ],
      ],
    }),
    uglify(),
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
