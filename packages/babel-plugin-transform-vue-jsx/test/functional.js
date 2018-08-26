import 'jsdom-global/register'
import test from 'ava'
import { shallowMount } from '@vue/test-utils'
import Vue from 'vue'

const it = () => {}

test('Contains text', t => {
  const wrapper = shallowMount({
    render(h) {
      return <div>test</div>
    },
  })

  t.truthy(wrapper.is('div'))
  t.is(wrapper.text(), 'test')
})

test('Binds text', t => {
  const text = 'foo'
  const wrapper = shallowMount({
    render(h) {
      return <div>{text}</div>
    },
  })

  t.truthy(wrapper.is('div'))
  t.is(wrapper.text(), 'foo')
})

test('Extracts attrs', t => {
  const wrapper = shallowMount({
    render(h) {
      return <div id="hi" dir="ltr" />
    },
  })

  t.is(wrapper.element.id, 'hi')
  t.is(wrapper.element.dir, 'ltr')
})

test('Binds attrs', t => {
  const id = 'foo'
  const wrapper = shallowMount({
    render(h) {
      return <div id={id} />
    },
  })

  t.is(wrapper.element.id, 'foo')
})

test('Omits attrs if possible', t => {
  const wrapper = shallowMount({
    render(h) {
      return <div>test</div>
    },
  })

  t.is(wrapper.vnode.data, undefined)
})

test('Omits children if possible', t => {
  const wrapper = shallowMount({
    render(h) {
      return <div />
    },
  })

  t.is(wrapper.vnode.children, undefined)
})

test('Handles top-level special attrs', t => {
  const wrapper = shallowMount({
    render(h) {
      return <div class="foo" style="bar" key="key" ref="ref" refInFor slot="slot" />
    },
  })
  t.is(wrapper.vnode.data.class, 'foo')
  t.is(wrapper.vnode.data.style, 'bar')
  t.is(wrapper.vnode.data.key, 'key')
  t.is(wrapper.vnode.data.ref, 'ref')
  t.is(wrapper.vnode.data.refInFor, true)
  t.is(wrapper.vnode.data.slot, 'slot')
})

test('Handles nested properties', t => {
  const noop = _ => _
  const wrapper = shallowMount({
    render(h) {
      return (
        <div
          props-on-success={noop}
          on-click={noop}
          on-kebab-case={noop}
          domProps-innerHTML="<p>hi</p>"
          hook-insert={noop}
        />
      )
    },
  })
  t.is(wrapper.vnode.data.props['on-success'], noop)
  t.is(wrapper.vnode.data.on.click.fns, noop)
  t.is(wrapper.vnode.data.on['kebab-case'].fns, noop)
  t.is(wrapper.vnode.data.domProps.innerHTML, '<p>hi</p>')
  t.is(wrapper.vnode.data.hook.insert, noop)
})

test('Handles nested properties (camelCase)', t => {
  const noop = _ => _
  const wrapper = shallowMount({
    render(h) {
      return (
        <div propsOnSuccess={noop} onClick={noop} onCamelCase={noop} domPropsInnerHTML="<p>hi</p>" hookInsert={noop} />
      )
    },
  })
  t.is(wrapper.vnode.data.props.onSuccess, noop)
  t.is(wrapper.vnode.data.on.click.fns, noop)
  t.is(wrapper.vnode.data.on.camelCase.fns, noop)
  t.is(wrapper.vnode.data.domProps.innerHTML, '<p>hi</p>')
  t.is(wrapper.vnode.data.hook.insert, noop)
})

test('Supports data attribute', t => {
  const wrapper = shallowMount({
    render(h) {
      return <div data-id="1" />
    },
  })

  t.is(wrapper.vnode.data.attrs['data-id'], '1')
})

test('Handles identifier tag name as components', t => {
  const Test = { render: () => null }
  const wrapper = shallowMount({
    render(h) {
      return <Test />
    },
  })

  t.truthy(wrapper.vnode.tag.startsWith('vue-component'))
})

test('Works for components with children', t => {
  const Test = {
    render(h) {
      h('div')
    },
  }
  const wrapper = shallowMount({
    render(h) {
      return (
        <Test>
          <div>hi</div>
        </Test>
      )
    },
  })

  const children = wrapper.vnode.componentOptions.children
  t.is(children[0].tag, 'div')
})

test('Binds things in thunk with correct this context', t => {
  const Test = {
    render(h) {
      return <div>{this.$slots.default}</div>
    },
  }
  const wrapper = shallowMount({
    data: () => ({ test: 'foo' }),
    render(h) {
      return <Test>{this.test}</Test>
    },
  })

  t.is(wrapper.html(), '<div>foo</div>')
})

test('Spread (single object expression)', t => {
  const props = {
    innerHTML: 2,
  }
  const wrapper = shallowMount({
    render(h) {
      return <div {...{ props }} />
    },
  })

  t.is(wrapper.vnode.data.props.innerHTML, 2)
})

test('Spread (mixed)', t => {
  const calls = []
  const data = {
    attrs: {
      id: 'hehe',
    },
    on: {
      click: function() {
        calls.push(3)
      },
    },
    props: {
      innerHTML: 2,
    },
    hook: {
      insert: function() {
        calls.push(1)
      },
    },
    class: ['a', 'b'],
  }
  const wrapper = shallowMount({
    render(h) {
      return (
        <div
          href="huhu"
          {...data}
          class={{ c: true }}
          on-click={() => calls.push(4)}
          hook-insert={() => calls.push(2)}
        />
      )
    },
  })

  t.is(wrapper.vnode.data.attrs.id, 'hehe')
  t.is(wrapper.vnode.data.attrs.href, 'huhu')
  t.is(wrapper.vnode.data.props.innerHTML, 2)
  t.deepEqual(wrapper.vnode.data.class, ['a', 'b', { c: true }])
  t.deepEqual(calls, [1, 2])
  wrapper.vnode.data.on.click()
  t.deepEqual(calls, [1, 2, 3, 4])
})

test('Custom directives', t => {
  const directive = {
    inserted() {},
  }
  Vue.directive('test', directive)
  Vue.directive('other', directive)

  const wrapper = shallowMount({
    render(h) {
      return <div v-test={123} vOther={234} />
    },
  })

  t.is(wrapper.vnode.data.directives.length, 2)
  t.deepEqual(wrapper.vnode.data.directives[0], { def: directive, modifiers: {}, name: 'test', value: 123 })
  t.deepEqual(wrapper.vnode.data.directives[1], { def: directive, modifiers: {}, name: 'other', value: 234 })
})

test('xlink:href', t => {
  const wrapper = shallowMount({
    render(h) {
      return <use xlinkHref={'#name'} />
    },
  })

  t.is(wrapper.vnode.data.attrs['xlink:href'], '#name')
})

test('Merge class', t => {
  const wrapper = shallowMount({
    render(h) {
      return <div class="a" {...{ class: 'b' }} />
    },
  })

  t.deepEqual(wrapper.vnode.data.class, ['a', 'b'])
})

test('JSXMemberExpression', t => {
  const a = {
    b: {
      cmp: {
        render(h) {
          return <div />
        },
      },
    },
  }
  const wrapper = shallowMount({
    render(h) {
      return <a.b.cmp />
    },
  })

  t.is(wrapper.html(), '<div></div>')
})

test('JSXSpreadChild', t => {
  const a = ['1', '2']
  const wrapper = shallowMount({
    render(h) {
      return <div>{...a}</div>
    },
  })

  t.is(wrapper.html(), '<div>12</div>')
})

test('domProps input[value]', t => {
  const val = 'foo'
  const wrapper = shallowMount({
    render(h) {
      return <input type="text" value={val} />
    },
  })

  t.is(wrapper.html(), '<input type="text">')
  t.is(wrapper.vnode.data.domProps.value, 'foo')
})

test('domProps option[selected]', t => {
  const val = 'foo'
  const wrapper = shallowMount({
    render(h) {
      return <option selected={val} />
    },
  })

  t.is(wrapper.vnode.data.domProps.selected, 'foo')
})

test('domProps input[checked]', t => {
  const val = 'foo'
  const wrapper = shallowMount({
    render(h) {
      return <input checked={val} />
    },
  })

  t.is(wrapper.vnode.data.domProps.checked, 'foo')
})

test('domProps video[muted]', t => {
  const val = 'foo'
  const wrapper = shallowMount({
    render(h) {
      return <video muted={val} />
    },
  })

  t.is(wrapper.vnode.data.domProps.muted, 'foo')
})
