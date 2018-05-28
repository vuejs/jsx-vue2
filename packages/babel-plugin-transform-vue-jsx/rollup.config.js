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
              node: '8',
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
      file: 'dist/plugin.js',
      format: 'cjs',
    },
  ],
}
