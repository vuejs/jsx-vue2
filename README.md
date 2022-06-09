# Babel Preset JSX

English | [简体中文](./README.zh-CN.md)

Configurable Babel preset to add Vue JSX support. See the [configuration options here](./packages/babel-preset-jsx).

## Installation

Install the preset with:

```bash
npm install @vue/babel-preset-jsx @vue/babel-helper-vue-jsx-merge-props
```

Then add the preset to `.babelrc`:

```json
{
  "presets": ["@vue/babel-preset-jsx"]
}
```

## Syntax

### Content

```jsx
render() {
  return <p>hello</p>
}
```

with dynamic content:

```jsx
render() {
  return <p>hello { this.message }</p>
}
```

when self-closing:

```jsx
render() {
  return <input />
}
```

with a component:

```jsx
import MyComponent from './my-component'

export default {
  render() {
    return <MyComponent>hello</MyComponent>
  }
}
```

### Attributes/Props

```jsx
render() {
  return <input type="email" />
}
```

with a dynamic binding:

```jsx
render() {
  return <input
    type="email"
    placeholder={this.placeholderText}
  />
}
```

with the spread operator (object needs to be compatible with [Vue Data Object](https://vuejs.org/v2/guide/render-function.html#The-Data-Object-In-Depth)):

```jsx
render() {
  const inputAttrs = {
    type: 'email',
    placeholder: 'Enter your email'
  }

  return <input {...{ attrs: inputAttrs }} />
}
```

### Slots

named slots:

```jsx
render() {
  return (
    <MyComponent>
      <header slot="header">header</header>
      <footer slot="footer">footer</footer>
    </MyComponent>
  )
}
```

scoped slots:

```jsx
render() {
  const scopedSlots = {
    header: () => <header>header</header>,
    footer: () => <footer>footer</footer>
  }

  return <MyComponent scopedSlots={scopedSlots} />
}
```

### Directives

```jsx
<input vModel="newTodoText" />
```

with a modifier:

```jsx
<input vModel_trim="newTodoText" />
```

with an argument:

```jsx
<input vOn:click="newTodoText" />
```

with an argument and modifiers:

```jsx
<input vOn:click_stop_prevent="newTodoText" />
```

v-html:

```jsx
<p domPropsInnerHTML={html} />
```

### Functional Components

Transpiles arrow functions that return JSX into functional components, when they are either default exports:

```jsx
export default ({ props }) => <p>hello { props.message }</p>
```

or PascalCase variable declarations:

```jsx
const HelloWorld = ({ props }) => <p>hello { props.message }</p>
```

## Compatibility

This repo is only compatible with:

- **Babel 7+**. For Babel 6 support, use [vuejs/babel-plugin-transform-vue-jsx](https://github.com/vuejs/babel-plugin-transform-vue-jsx)
- **Vue 2+**. JSX is not supported for older versions.
