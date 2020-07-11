## @vue/babel-sugar-composition-api-render-instance

> Ported from [luwanquan/babel-preset-vca-jsx](https://github.com/luwanquan/babel-preset-vca-jsx) by [@luwanquan](https://github.com/luwanquan)

Babel syntactic sugar for replaceing `this` with `getCurrentInstance()` in Vue JSX with @vue/composition-api

### Babel Compatibility Notes

- This repo is only compatible with Babel 7.x

### Usage

Install the dependencies:

```sh
# for yarn:
yarn add @vue/babel-sugar-composition-api-render-instance
# for npm:
npm install @vue/babel-sugar-composition-api-render-instance --save
```

In your `.babelrc`:

```json
{
  "plugins": ["@vue/babel-sugar-composition-api-render-instance"]
}
```

However it is recommended to use the [configurable preset](../babel-preset-jsx/README.md) instead.

### Details

This plugin automatically injects `h` in every method that has JSX. By using this plugin you don't have to always specifically declare `h` as first parameter in your `render()` function.

```js
// Without @vue/babel-sugar-inject-h
import { h } from '@vue/composition-api'

export default {
  setup() {
    return () => <button />
  },
}

// With @vue/babel-sugar-inject-h
export default {
  setup() {
    return () => <button />
  },
}
```
