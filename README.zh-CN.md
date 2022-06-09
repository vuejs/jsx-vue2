# Babel Preset JSX
[English](./README.md) | 简体中文

添加babel预设， 让Vue支持JSX语法. 查看插件[配置项](./packages/babel-preset-jsx).

## 兼容性

当前插件仅兼容如下版本:

- **Babel 7+**. 对于babel 6, 请使用 [vuejs/babel-plugin-transform-vue-jsx](https://github.com/vuejs/babel-plugin-transform-vue-jsx)
- **Vue 2+**. JSX不支持低于vue2 以下版本. 对于Vue3, 有一个实验性插件可用 [@ant-design-vue/babel-plugin-jsx](https://github.com/vueComponent/jsx).

## 安装

安装如下依赖:

```bash
npm install @vue/babel-preset-jsx @vue/babel-helper-vue-jsx-merge-props
```

添加 preset 配置 `babel.config.js`:

```js
module.exports = {
  presets: ['@vue/babel-preset-jsx'],
}
```

**tips**: 如果出现 `Duplicate declaration "h" (This is an error on an internal node. Probably an internal error.)`

请调整配置如下
``````JS
module.exports = {
  presets: [
    [
      '@vue/babel-preset-jsx',
      // 不自动注入h
      {
        "injectH": false
      }
    ]
  ],
}
```

```

## 语法

### Content

```jsx
render() {
  return <p>hello</p>
}
```

动态值:

```jsx
render() {
  return <p>hello { this.message }</p>
}
```

自闭合标签:

```jsx
render() {
  return <input />
}
```

使用组件:
> 注意： JSX使用组件时， 不需要在components中注册

```jsx
import MyComponent from './my-component'

export default {
  render() {
    return <MyComponent>hello</MyComponent>
  },
}
```

条件渲染

```jsx
export default {
  render() {
    let DOMList = []
    let a = 1

    if(a === 1) {
      let HeadCom = (<div>头部</div>)
      DOMList.push(HeadCom)
    }

    let ContentCom = (<div>内容主体</div>)

    DOMList.push(ContentCom)

    // 直接返回即可
    return (
      <div>
        {DOMList}
      </div>
    )
  }
}
```

### Attributes/Props

```jsx
render() {
  return <input type="email" />
}
```

动态绑定值:

```jsx
render() {
  return <input
    type="email"
    placeholder={this.placeholderText}
  />
}
```

使用展开符号 (使用对象需要兼容Vue对象数据结构 [Vue Data Object](https://vuejs.org/v2/guide/render-function.html#The-Data-Object-In-Depth)):

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

具名插槽:

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

### 指令

```jsx
<input vModel={this.newTodoText} />
```

修饰符:

```jsx
<input vModel_trim={this.newTodoText} />
```

参数:

```jsx
<input vOn:click={this.newTodoText} />
```

指令带 **参数**和**修饰符**写法:

```jsx
<input vOn:click_stop_prevent={this.newTodoText} />
```

v-html:

```jsx
<p domPropsInnerHTML={html} />
```

### 事件

```jsx
<script>
import tipCom from '@/components/tipsCom'

export defualt {
  methods: {
    // 传递参数
    sendParams(params) {},
    noParamsFn() {}
  },
  render() {
    let a = 2

    // 条件判断
    if (a === 1) {
      return (
        <div>
          <tipCom></tipCom>
          <button onClick={() => this.sendParams(1)}>详情</button>
        </div>
      )
    } else {
      return (
        <div>
          <button onClick={() => this.sendParams(1)}>详情</button>
          <button onClick={this.noParamsFn}>复制</button>
        </div>
      )
    }
  }
}
</script>
```

### 函数式组件

如果是默认导出，则将箭头函数自动转换为函数式组件:

```jsx
export default ({ props }) => <p>hello {props.message}</p>
```

或使用PascalCase声明变量:

```jsx
const HelloWorld = ({ props }) => <p>hello {props.message}</p>
```
