import test from 'ava'
import helper from '../dist/helper.testing'

test('Complete merge scenario', t => {
  let counter = 0
  const merged = helper([
    {
      attrs: {
        a: 1,
        b: 3,
      },
      class: 'hello',
      on: {
        click: 'hey',
      },
      ref: 'beta',
      hook: {
        insert() {
          counter++
        },
      },
    },
    {
      attrs: {
        a: 2,
      },
      class: 'world',
      on: {
        click: 'you',
        hover: 'woohoo',
      },
      ref: 'delta',
      hook: {
        insert() {
          counter += 2
        },
        next: 'anotherHook',
      },
    },
    {
      class: ['alpha', 'beta'],
      on: {
        click: ['how', 'you', 'doin'],
      },
    },
  ])
  t.deepEqual(merged, {
    attrs: {
      a: 2,
      b: 3,
    },
    class: ['hello', 'world', 'alpha', 'beta'],
    on: {
      click: ['hey', 'you', 'how', 'you', 'doin'],
      hover: 'woohoo',
    },
    ref: 'delta',
    hook: {
      insert: merged.hook.insert,
      next: 'anotherHook',
    },
  })
  t.is(counter, 0)
  merged.hook.insert()
  t.is(counter, 3)
})
