import test from 'ava'
import { transform } from '@babel/core'
import syntaxJsx from '@babel/plugin-syntax-jsx'
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
    name: 'HTML tag if variable in scope',
    from: `const div = {}; render(h => <div>test</div>)`,
    to: `const div = {};
render(h => h("div", ["test"]));`,
  },
  {
    name: 'Tag & Component',
    from: `const Alpha = {}; render(h => [<Alpha>test</Alpha>, <Beta>test</Beta>])`,
    to: `const Alpha = {};
render(h => [h(Alpha, ["test"]), h("Beta", ["test"])]);`,
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
    from: `render(h => <div>
  test{test}
  <tag1 />
  <tag2 />

  Some text
  goes here

  {...test}
</div>)`,
    to: `render(h => h("div", ["test", test, h("tag1"), h("tag2"), "Some text goes here", ...test]));`,
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
    to: `import _mergeJSXProps from "@vue/babel-helper-vue-jsx-merge-props";
render(h => h("div", _mergeJSXProps([{}, spread])));`,
  },
  {
    name: 'Generic spread attributes',
    from: `render(h => <div {...spread} hello="world" />)`,
    to: `import _mergeJSXProps from "@vue/babel-helper-vue-jsx-merge-props";
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
  {
    name: 'Multiple event listeners',
    from: `<div onClick={listner1} onClick={listner2} onClick={listner3} />`,
    to: `h("div", {
  "on": {
    "click": [listner1, listner2, listner3]
  }
});`,
  },
  {
    name: 'Root attribute',
    from: `<MyComponent propsProp1="foo" props={{ prop1: 'alpha', prop2: 'beta' }} />`,
    to: `import _mergeJSXProps from "@vue/babel-helper-vue-jsx-merge-props";
h("MyComponent", _mergeJSXProps([{
  "props": {
    "prop1": "foo"
  }
}, {
  "props": {
    prop1: 'alpha',
    prop2: 'beta'
  }
}]));`,
  },
  {
    name: 'JSX comments',
    from: `<div><p>jsx</p>{/* <p>comment</p> */}</div>`,
    to: `h("div", [h("p", ["jsx"])]);`
  },
  {
    name: 'Underscore Props',
    from: `const MyComp = {}; render(h => <MyComponent attrs-my_prop="test">test</MyComponent>)`,
    to: `const MyComp = {};
render(h => h("MyComponent", {
  "attrs": {
    "my_prop": "test"
  }
}, ["test"]));`,
  }
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
        t.regex(e.message, /getAttributes \(attribute value\): JSXElement is not supported/)
        resolve()
      })
  }))


test('Allows prior plugins to traverse JSX tree throughly', t => {
  let visited = 0;
  const anotherPlugin = () => ({
    name: 'babel-plugin-another',
    inherits: syntaxJsx,
    visitor: {
      JSXElement(path) {
        visited++;

      }
    }
  })
  return new Promise(resolve => {
    transform(`render(h => <a><b/></a>)`,{ plugins: [anotherPlugin, plugin] }, (err) => {
      if (err) t.fail()
      t.is(visited, 2)
      resolve();
    })
  })
})
