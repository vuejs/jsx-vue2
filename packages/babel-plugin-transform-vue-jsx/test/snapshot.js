import test from 'ava'
import { transform } from '@babel/core'
import plugin from '../dist/plugin.testing'

const transpile = src =>
  new Promise((resolve, reject) => {
    transform(
      src,
      {
        plugins: [plugin],
      },
      (err, result) => {
        if (err) {
          return reject(err)
        }
        resolve(result.code)
      },
    )
  })

const tests = [
  {
    name: 'HTML tag',
    from: `render(h => <div>test</div>)`,
    to: `render(h => h("div", ["test"]));`,
  },
  {
    name: 'Uppercase component',
    from: `render(h => <Div>test</Div>)`,
    to: `render(h => h(Div, ["test"]));`,
  },
  {
    name: 'MemberExpression component',
    from: `render(h => <a.b.c>test</a.b.c>)`,
    to: `render(h => h(a.b.c, ["test"]));`,
  },
  {
    name: 'Variable as content',
    from: `render(h => <div>{test}</div>)`,
    to: `render(h => h("div", [test]));`,
  },
  {
    name: 'Spread content',
    from: `render(h => <div>{...test}</div>)`,
    to: `render(h => h("div", [...test]));`,
  },
  {
    name: 'Self-closing html tag',
    from: `render(h => <div><br/></div>)`,
    to: `render(h => h("div", [h("br")]));`,
  },
  {
    name: 'Combined content',
    from: `render(h => <div>test{test}{...test}<br/></div>)`,
    to: `render(h => h("div", ["test", test, ...test, h("br")]));`,
  },
  {
    name: 'Plain attrs',
    from: `render(h => <div id="hi" dir="ltr"></div>)`,
    to: `render(h => h("div", {
  "attrs": {
    "id": "hi",
    "dir": "ltr"
  }
}));`,
  },
  {
    name: 'Expression attrss',
    from: `render(h => <div id={id}></div>)`,
    to: `render(h => h("div", {
  "attrs": {
    "id": id
  }
}));`,
  },
  {
    name: 'Special root attributes',
    from: `render(h => (
      <div
        class="foo"
        style="bar"
        key="key"
        ref="ref"
        refInFor
        slot="slot"
        model={{
          value: this.txt,
          callback: $$v => {
            this.txt = $$v
          }
        }}>
      </div>
    ))`,
    to: `render(h => h("div", {
  "class": "foo",
  "style": "bar",
  "key": "key",
  "ref": "ref",
  "refInFor": true,
  "slot": "slot",
  "model": {
    value: this.txt,
    callback: $$v => {
      this.txt = $$v;
    }
  }
}));`,
  },
  {
    name: 'Special snake-case attributes',
    from: `render(h => (
      <div
        props-on-success={noop}
        on-click={noop}
        on-kebab-case={noop}
        domProps-innerHTML="<p>hi</p>"
        hook-insert={noop}>
      </div>
    ))`,
    to: `render(h => h("div", {
  "props": {
    "on-success": noop
  },
  "on": {
    "click": noop,
    "kebab-case": noop
  },
  "domProps": {
    "innerHTML": "<p>hi</p>"
  },
  "hook": {
    "insert": noop
  }
}));`,
  },
  {
    name: 'Special camelCase attributes',
    from: `render(h => (
      <div
        propsOnSuccess={noop}
        onClick={noop}
        onCamelCase={noop}
        domPropsInnerHTML="<p>hi</p>"
        hookInsert={noop}>
      </div>
    ))`,
    to: `render(h => h("div", {
  "props": {
    "onSuccess": noop
  },
  "on": {
    "click": noop,
    "camelCase": noop
  },
  "domProps": {
    "innerHTML": "<p>hi</p>"
  },
  "hook": {
    "insert": noop
  }
}));`,
  },
  {
    name: 'Data attributes',
    from: `render(h => (
      <div data-id="1"></div>
    ))`,
    to: `render(h => h("div", {
  "attrs": {
    "data-id": "1"
  }
}));`,
  },
  {
    name: 'Inline spread attributes',
    from: `const props = {
      innerHTML: 2
    }
    const otherName = {
      someAttr: 'hey'
    }
    const vnode = render(h => (
      <div propsHello="test" {...{ props, attrs: otherName }}/>
    ))`,
    to: `const props = {
  innerHTML: 2
};
const otherName = {
  someAttr: 'hey'
};
const vnode = render(h => h("div", {
  "props": {
    "hello": "test",
    ...props
  },
  "attrs": { ...otherName
  }
}));`,
  },
  {
    name: 'Only spread attributes',
    from: `render(h => <div {...spread} />)`,
    to: `import _mergeJSXProps from "@vuejs/babel-helper-vue-jsx-merge-props";
render(h => h("div", _mergeJSXProps([{}, spread])));`,
  },
  {
    name: 'Generic spread attributes',
    from: `render(h => <div {...spread} hello="world" />)`,
    to: `import _mergeJSXProps from "@vuejs/babel-helper-vue-jsx-merge-props";
render(h => h("div", _mergeJSXProps([{}, spread, {
  "attrs": {
    "hello": "world"
  }
}])));`,
  },
  {
    name: 'Directives',
    from: `render(h => <div v-test={ 123 } vSomething_modifier={ 1234 } vOtherStuff:argument_modifier1_modifier2={ 234 } />)`,
    to: `render(h => h("div", {
  "directives": [{
    name: "test",
    value: 123
  }, {
    name: "something",
    value: 1234,
    modifiers: {
      "modifier": true
    }
  }, {
    name: "other-stuff",
    value: 234,
    arg: "argument",
    modifiers: {
      "modifier1": true,
      "modifier2": true
    }
  }]
}));`,
  },
  {
    name: 'xlink',
    from: `<use xlinkHref={'#name'} />`,
    to: `h("use", {
  "attrs": {
    "xlink:href": '#name'
  }
});`,
  },
  {
    name: 'Magic domProps input[value]',
    from: `<input type="text" value={val} />`,
    to: `h("input", {
  "attrs": {
    "type": "text"
  },
  "domProps": {
    "value": val
  }
});`,
  },
  {
    name: 'Magic domProps option[selected]',
    from: `<option selected={val} />`,
    to: `h("option", {
  "domProps": {
    "selected": val
  }
});`,
  },
  {
    name: 'Magic domProps input[checked]',
    from: `<input checked={val} />`,
    to: `h("input", {
  "domProps": {
    "checked": val
  }
});`,
  },
  {
    name: 'Magic domProps video[muted]',
    from: `<video muted={val} />`,
    to: `h("video", {
  "domProps": {
    "muted": val
  }
});`,
  },
]

tests.forEach(({ name, from, to }) => test(name, async t => t.is(await transpile(from), to)))

test('JSXElement attribute value throws error', t =>
  new Promise(resolve => {
    transpile(`render(h => <a key=<b/> />)`)
      .then(() => {
        t.fail()
        resolve()
      })
      .catch(e => {
        t.is(e.message, 'getAttributes (attribute value): JSXElement is not supported')
        resolve()
      })
  }))
