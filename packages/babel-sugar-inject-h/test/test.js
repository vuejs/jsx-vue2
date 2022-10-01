import test from 'ava'
import { transform } from '@babel/core'
import plugin from '../dist/plugin.testing'
import jsxPlugin from '../../babel-plugin-transform-vue-jsx/dist/plugin.testing'

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

const transpileWithJSXPlugin = src =>
  new Promise((resolve, reject) => {
    transform(
      src,
      {
        plugins: [plugin, jsxPlugin],
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
    name: 'Simple injection in object methods',
    from: `const obj = {
      method () {
        return <div>test</div>
      }
    }`,
    to: `const obj = {
  method() {
    const h = this.$createElement;
    return <div>test</div>;
  }

};`,
  },
  {
    name: 'Injection disabled in nested JSX expressions',
    from: `const obj = {
      method () {
        return <div foo={{
          render () {
            return <div>bar</div>
          }
        }}>test</div>
      }
    }`,
    to: `const obj = {
  method() {
    const h = this.$createElement;
    return <div foo={{
      render() {
        return <div>bar</div>;
      }

    }}>test</div>;
  }

};`,
  },
  {
    name: 'Simple injection in object getters',
    from: `const obj = {
      get method () {
        return <div>test</div>
      }
    }`,
    to: `const obj = {
  get method() {
    const h = this.$createElement;
    return <div>test</div>;
  }

};`,
  },
  {
    name: 'Simple injection in object methods with params',
    from: `const obj = {
      method (hey) {
        return <div>test</div>
      }
    }`,
    to: `const obj = {
  method(hey) {
    const h = this.$createElement;
    return <div>test</div>;
  }

};`,
  },
  {
    name: 'Arguments-based injection into render function',
    from: `const obj = {
      render () {
        return <div>test</div>
      }
    }`,
    to: `const obj = {
  render() {
    const h = arguments[0];
    return <div>test</div>;
  }

};`,
  },
  {
    name: 'Has Defined H Variable in object method',
    from: `const obj = {
      getTextNode() {
        const h = this.$createElement
        return <div>test</div>
      }
    }`,
    to: `const obj = {
  getTextNode() {
    const h = this.$createElement;
    return <div>test</div>;
  }

};`
  },
  {
    name: 'Has Defined H Variable in render method',
    from: `const obj = {
      render() {
        const h = arguments[0];
        return <div>test</div>
      }
    }`,
    to: `const obj = {
  render() {
    const h = arguments[0];
    return <div>test</div>;
  }

};`,
  },
  {
    name: 'Has Defined not H Variable in render method',
    from: `const obj = {
      render() {
        const a = arguments[0];
        return <div>test</div>
      }
    }`,
    to: `const obj = {
  render() {
    const h = arguments[0];
    const a = arguments[0];
    return <div>test</div>;
  }

};`
  }
]

tests.forEach(({ name, from, to }) => test(name, async t => t.is(await transpile(from), to)))

test('Should work with JSX plugin enabled', async t => {
  const from = `const obj = {
    render () {
      return <div>test</div>
    }
  }`
  const to = `const obj = {
  render() {
    const h = arguments[0];
    return h("div", ["test"]);
  }

};`
  t.is(await(transpileWithJSXPlugin(from)), to)
})
