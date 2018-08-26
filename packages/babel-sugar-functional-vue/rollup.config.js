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
              node: '8',
            },
            modules: false,
            loose: true,
          },
        ],
      ],
    }),
    minify(),
  ],
  output: [
    {
      file: 'dist/plugin.js',
      format: 'cjs',
    },
  ],
}
