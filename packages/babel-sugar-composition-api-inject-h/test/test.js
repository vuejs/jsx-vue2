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
    name: "Don't inject without JSX",
    from: `const obj = {
      setup () {
        return {}
      },
      method () {
        return () => {}
      }
    }`,
    to: `const obj = {
  setup() {
    return {};
  },

  method() {
    return () => {};
  }

};`,
  },
  {
    name: "Don't re-inject",
    from: `import { getCurrentInstance } from "@vue/composition-api";
const obj = {
      setup () {
        return <div>test</div>
      }
    }`,
    to: `import { getCurrentInstance } from "@vue/composition-api";
const obj = {
  setup() {
    const h = getCurrentInstance().proxy.$createElement;
    return <div>test</div>;
  }

};`,
  },
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
    name: 'Remove classical h',
    from: `
  const obj = {
    setup() {
      var h = this.$createElement;
      const h2 = this.$createElement;
      return () => {
        return <div>test</div>
      }
    }
    }`,
    to: `import { getCurrentInstance } from "@vue/composition-api";
const obj = {
  setup() {
    const h = getCurrentInstance().proxy.$createElement;
    return () => {
      return <div>test</div>;
    };
  }

};`,
  },
  {
    name: "Don't remove classical h outside of setup()",
    from: `
  const obj = {
    setup2() {
      var h = this.$createElement;
      return () => {
        return <div>test</div>
      }
    }
    }`,
    to: `const obj = {
  setup2() {
    var h = this.$createElement;
    return () => {
      return <div>test</div>;
    };
  }

};`,
  },
  {
    name: '$createElement out setup and getCurrentInstance().proxy.$createElement in setup',
    from: `
  const obj = {
    setup() {
      return <div>test</div>
    },
    method() {
      return <div>test</div>
    }
  }`,
    to: `import { getCurrentInstance } from "@vue/composition-api";
const obj = {
  setup() {
    const h = getCurrentInstance().proxy.$createElement;
    return <div>test</div>;
  },

  method() {
    const h = this.$createElement;
    return <div>test</div>;
  }

};`
  }
]

tests.forEach(({ name, from, to }) => test(name, async t => t.is(await transpile(from), to)))
