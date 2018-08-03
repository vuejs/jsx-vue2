## JSX

A monorepo containing all jsx-related packages for Vue.js.

### Babel Compatibility Notes

- This repo is only compatible with Babel 7.x, for 6.x please use [vuejs/babel-plugin-transform-vue-jsx](https://github.com/vuejs/babel-plugin-transform-vue-jsx)

### Details

For normal usage it is recommended to use the default preset.
To do that you need to first install the preset and the helper:

```sh
# for yarn:
yarn add @vue/babel-preset-jsx @vue/babel-helper-vue-jsx-merge-props
# for npm:
npm install @vue/babel-preset-jsx @vue/babel-helper-vue-jsx-merge-props --save
```

In your `.babelrc`:

```json
{
  "presets": ["@vue/babel-preset-jsx"]
}
```

For more details please check each package's README:

- [@vue/babel-helper-vue-jsx-merge-props](packages/babel-helper-vue-jsx-merge-props/README.md) - Runtime helper for props merging
- [@vue/babel-plugin-transform-vue-jsx](packages/babel-plugin-transform-vue-jsx/README.md) - Main JSX transform plugin
- [@vue/babel-preset-jsx](packages/babel-preset-jsx/README.md) - Configurable babel preset
- [@vue/babel-sugar-functional-vue](packages/babel-sugar-functional-vue/README.md) - Functional components syntactic sugar
- [@vue/babel-sugar-inject-h](packages/babel-sugar-inject-h/README.md) - Automatic `h` injection syntactic sugar
- [@vue/babel-sugar-v-model](packages/babel-sugar-v-model/README.md) - `vModel` syntactic sugar
