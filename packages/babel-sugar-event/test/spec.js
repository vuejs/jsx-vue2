import test from 'ava'
import {
  transform
} from '@babel/core'
import plugin from '../dist/plugin.testing'

const transpile = src =>
  new Promise((resolve, reject) => {
    transform(
      src, {
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

const tests = [{
  name: 'HTML tag',
  from: `render(h => <div v-on:click={event => event.ok}>test</div>)`,
  to: `render(h => h("div", ["test"]));`,
}]

tests.forEach(({
  name,
  from,
  to
}) => test(name, async t => t.is(await transpile(from), to)))

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