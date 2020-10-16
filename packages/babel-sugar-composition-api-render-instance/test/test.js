import test from 'ava'
import { transform } from '@babel/core'
import plugin from '../dist/plugin.testing'
import vModelPlugin from '../../babel-sugar-v-model/dist/plugin.testing'

const transpile = src =>
  new Promise((resolve, reject) => {
    transform(
      src,
      {
        plugins: [vModelPlugin],
      },
      (err, result) => {
        if (err) {
          return reject(err)
        }
        transform(
          result.code,
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
      },
    )
  })

const tests = [
  {
    name: 'Ignores non vModel arguments',
    from: `const a = { setup: () => { return () => <A x="y" a:b={c} /> } }`,
    to: `const a = {
  setup: () => {
    return () => <A x="y" a:b={c} />;
  }
};`,
  },
  {
    name: 'Generic component vModel',
    from: `const a = { setup: () => { return () => <MyComponent vModel={a.b} /> } }`,
    to: `import { getCurrentInstance } from "@vue/composition-api";
const a = {
  setup: () => {
    return () => <MyComponent model={{
      value: a.b,
      callback: $$v => {
        getCurrentInstance().$set(a, "b", $$v);
      }
    }} />;
  }
};`,
  },
  {
    name: 'Component vModel_number',
    from: `const a = { setup: () => { return () => <MyComponent vModel_number={a.b} /> } }`,
    to: `import { getCurrentInstance } from "@vue/composition-api";
const a = {
  setup: () => {
    return () => <MyComponent model={{
      value: a.b,
      callback: $$v => {
        getCurrentInstance().$set(a, "b", getCurrentInstance()._n($$v));
      }
    }} />;
  }
};`,
  },
  {
    name: 'Ignore outside of setup()',
    from: `const A = <MyComponent vModel={a[b]} />`,
    to: `const A = <MyComponent model={{
  value: a[b],
  callback: $$v => {
    this.$set(a, b, $$v);
  }
}} />;`,
  },
]

tests.map(({ name, from, to, NODE_ENV }) => {
  test.serial(name, async t => {
    const nodeEnvCopy = process.env.NODE_ENV
    if (NODE_ENV) {
      process.env.NODE_ENV = NODE_ENV
    }
    t.is(await transpile(from), to)
    if (NODE_ENV) {
      process.env.NODE_ENV = nodeEnvCopy
    }
  })
})
