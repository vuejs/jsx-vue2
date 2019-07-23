import 'jsdom-global/register'
import avaTest from 'ava'
import { mount, createLocalVue } from '@vue/test-utils'
import ninos from 'ninos'

const test = ninos(avaTest)

test('should bind event to a method', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: stub,
    },
    render(h) {
      return <div vOn:click={this.foo} />
    },
  })
  wrapper.trigger('click')

  t.is(stub.calls.length, 1)
  t.is(stub.calls[0].arguments[0].type, 'click')
})

test('should bind event to a inline statement', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: stub,
    },
    render(h) {
      return <div vOn:click={$event => this.foo(1, 2, 3, $event)} />
    },
  })

  wrapper.trigger('click')
  t.is(stub.calls.length, 1)

  const args = stub.calls[0].arguments
  t.is(args.length, 4)
  t.is(args[0], 1)
  t.is(args[1], 2)
  t.is(args[2], 3)
  t.is(args[3].type, 'click')
})

test('should support stop propagation', t => {
  const parentStub = t.context.stub()
  const childStub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: parentStub,
      bar: childStub,
    },
    render(h) {
      return (
        <div vOn:click={this.foo}>
          <button vOn:click_stop={this.bar} />
        </div>
      )
    },
  })

  wrapper.find('button').trigger('click')
  t.is(parentStub.calls.length, 0)
  t.is(childStub.calls.length, 1)
})

test('should support prevent default', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo($event) {
        stub($event.defaultPrevented)
      },
    },
    render(h) {
      return <button vOn:click_prevent={this.foo} />
    },
  })

  wrapper.trigger('click')
  t.is(stub.calls.length, 1)
  t.is(stub.calls[0].arguments[0], true)
})

test('should support capture', t => {
  const calls = []
  const wrapper = mount({
    methods: {
      foo() {
        calls.push(1)
      },
      bar() {
        calls.push(2)
      },
    },
    render(h) {
      return (
        <div vOn:click_capture={this.foo}>
          <button vOn:click={this.bar} />
        </div>
      )
    },
  })

  wrapper.find('button').trigger('click')
  t.deepEqual(calls, [1, 2])
})

test('should support once', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: stub,
    },
    render(h) {
      return <button vOn:click_once={this.foo} />
    },
  })

  t.is(stub.calls.length, 0)
  wrapper.trigger('click')
  t.is(stub.calls.length, 1)
  wrapper.trigger('click')
  t.is(stub.calls.length, 1)
})

test('should handle _once on multiple elements properly', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: stub,
    },
    render(h) {
      return (
        <div>
          <button id="foo" vOn:click_once={this.foo} />
          <button id="bar" vOn:click_once={this.foo} />
        </div>
      )
    },
  })

  const foo = wrapper.find('#foo')
  const bar = wrapper.find('#bar')

  t.is(stub.calls.length, 0)
  foo.trigger('click')
  t.is(stub.calls.length, 1)
  foo.trigger('click')
  t.is(stub.calls.length, 1)
  bar.trigger('click')
  t.is(stub.calls.length, 2)
  bar.trigger('click')
  t.is(stub.calls.length, 2)
  foo.trigger('click')
  bar.trigger('click')
  t.is(stub.calls.length, 2)
})

test('should support capture and once', t => {
  const calls = []
  const wrapper = mount({
    methods: {
      foo() {
        calls.push(1)
      },
      bar() {
        calls.push(2)
      },
    },
    render(h) {
      return (
        <div vOn:click_capture_once={this.foo}>
          <button vOn:click={this.bar} />
        </div>
      )
    },
  })

  t.deepEqual(calls, [])
  wrapper.find('button').trigger('click')
  t.deepEqual(calls, [1, 2])
  wrapper.find('button').trigger('click')
  t.deepEqual(calls, [1, 2, 2])
})

test('should support once and other modifiers', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: stub,
    },
    render(h) {
      return (
        <div vOn:click_once_self={this.foo}>
          <button />
        </div>
      )
    },
  })

  t.is(stub.calls.length, 0)
  wrapper.find('button').trigger('click')
  t.is(stub.calls.length, 0)
  wrapper.trigger('click')
  t.is(stub.calls.length, 1)
  wrapper.trigger('click')
  t.is(stub.calls.length, 1)
})

test('should support passive', t => {
  const arr = []
  const wrapper = mount({
    methods: {
      foo(e) {
        arr.push(e.defaultPrevented) // will be false
        e.preventDefault()
        arr.push(e.defaultPrevented) // will be true
      },
      bar(e) {
        arr.push(e.defaultPrevented) // will be false
        e.preventDefault() // does nothing since the listener is passive
        arr.push(e.defaultPrevented) // still false
      },
    },
    render(h) {
      return (
        <section>
          <div vOn:click={this.foo} />
          <div vOn:click_passive={this.bar} />
        </section>
      )
    },
  })
  const divs = wrapper.findAll('div')
  divs.at(0).trigger('click')
  divs.at(1).trigger('click')
  t.deepEqual(arr, [false, true, false, false])
})

test('should support passive and once', t => {
  const arr = []
  const wrapper = mount({
    methods: {
      bar(e) {
        arr.push(e.defaultPrevented) // will be false
        e.preventDefault() // does nothing since the listener is passive
        arr.push(e.defaultPrevented) // still false
      },
    },
    render(h) {
      return <div vOn:click_passive_once={this.bar} />
    },
  })

  wrapper.trigger('click')
  t.deepEqual(arr, [false, false])

  wrapper.trigger('click')
  t.deepEqual(arr, [false, false])
})

test('should support passive and other modifiers', t => {
  const arr = []
  const wrapper = mount({
    methods: {
      bar(e) {
        arr.push(e.defaultPrevented) // will be false
        e.preventDefault() // does nothing since the listener is passive
        arr.push(e.defaultPrevented) // still false
      },
    },
    render(h) {
      return (
        <section vOn:click_passive_self={this.bar}>
          <div />
        </section>
      )
    },
  })

  wrapper.trigger('click')
  t.deepEqual(arr, [false, false])

  wrapper.find('div').trigger('click')
  t.deepEqual(arr, [false, false])
})

test("should respect vue' order on special modifer markers", t => {
  // This test is especially for `.passive` working with other modifiers
  const fn = t.context.stub()
  const FC = h => (
    <section>
      <div vOn:click_once_passive={fn} />
      <div vOn:click_passive_once={fn} />
      <div vOn:click_passive_capture={fn} />
      <div vOn:click_capture_passive={fn} />
    </section>
  )

  const mockCreateElement = (tag, props, children) => {
    if (tag === 'div') {
      // `&` is always the first if `.passive` present
      t.is(Object.keys(props.on)[0].indexOf('&'), 0)
    }
  }

  FC(mockCreateElement)
})

test('should support keyCode', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: stub,
    },
    render(h) {
      return <input vOn:keyup_enter={this.foo} />
    },
  })

  t.is(stub.calls.length, 0)
  wrapper.trigger('keyup')
  t.is(stub.calls.length, 0)
  wrapper.trigger('keyup.enter')
  t.is(stub.calls.length, 1)
})

test('should support automatic key name inference', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: stub,
    },
    render(h) {
      return <input vOn:keyup_arrow-right={this.foo} />
    },
  })

  t.is(stub.calls.length, 0)
  wrapper.trigger('keyup', {
    key: 'ArrowLeft',
  })
  t.is(stub.calls.length, 0)
  wrapper.trigger('keyup', {
    key: 'ArrowRight',
  })
  t.is(stub.calls.length, 1)
})

test('should support system modifers', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: stub,
    },
    render(h) {
      return (
        <div>
          <input id="ctrl" vOn:keyup_ctrl={this.foo} />
          <input id="shift" vOn:keyup_shift={this.foo} />
          <input id="alt" vOn:keyup_alt={this.foo} />
          <input id="meta" vOn:keyup_meta={this.foo} />
        </div>
      )
    },
  })

  t.is(stub.calls.length, 0)
  wrapper.find('#ctrl').trigger('keyup')
  t.is(stub.calls.length, 0)
  wrapper.find('#ctrl').trigger('keyup', { ctrlKey: true })
  t.is(stub.calls.length, 1)

  wrapper.find('#shift').trigger('keyup')
  t.is(stub.calls.length, 1)
  wrapper.find('#shift').trigger('keyup', { shiftKey: true })
  t.is(stub.calls.length, 2)

  wrapper.find('#alt').trigger('keyup')
  t.is(stub.calls.length, 2)
  wrapper.find('#alt').trigger('keyup', { altKey: true })
  t.is(stub.calls.length, 3)

  wrapper.find('#meta').trigger('keyup')
  t.is(stub.calls.length, 3)
  wrapper.find('#meta').trigger('keyup', { metaKey: true })
  t.is(stub.calls.length, 4)
})

test('should support exact modifer', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: stub,
    },
    render(h) {
      return <input vOn:keyup_exact={this.foo} />
    },
  })

  t.is(stub.calls.length, 0)
  wrapper.trigger('keyup')
  t.is(stub.calls.length, 1)
  wrapper.trigger('keyup', { ctrlKey: true })
  t.is(stub.calls.length, 1)
})

test('should support system modifers with exact', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: stub,
    },
    render(h) {
      return <input vOn:keyup_ctrl_exact={this.foo} />
    },
  })

  t.is(stub.calls.length, 0)
  wrapper.trigger('keyup')
  t.is(stub.calls.length, 0)
  wrapper.trigger('keyup', { ctrlKey: true })
  t.is(stub.calls.length, 1)
  wrapper.trigger('keyup', { ctrlKey: true, altKey: true })
  t.is(stub.calls.length, 1)
})

test('should support number keyCode', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: stub,
    },
    render(h) {
      return <input vOn:keyup_13={this.foo} />
    },
  })

  t.is(stub.calls.length, 0)
  wrapper.trigger('keyup')
  t.is(stub.calls.length, 0)
  wrapper.trigger('keyup.enter')
  t.is(stub.calls.length, 1)
})

test('should support mouse modifier', t => {
  const left = 0
  const middle = 1
  const right = 2
  const stubLeft = t.context.stub()
  const stubMiddle = t.context.stub()
  const stubRight = t.context.stub()

  const wrapper = mount({
    methods: {
      foo: stubLeft,
      foo1: stubRight,
      foo2: stubMiddle,
    },
    render(h) {
      return (
        <div>
          <div id="left" vOn:mousedown_left={this.foo}>
            left
          </div>
          <div id="right" vOn:mousedown_right={this.foo1}>
            right
          </div>
          <div id="middle" vOn:mousedown_middle={this.foo2}>
            middle
          </div>
        </div>
      )
    },
  })

  t.is(stubLeft.calls.length, 0)
  wrapper.find('#left').trigger('mousedown', { button: left })
  t.is(stubLeft.calls.length, 1)
  wrapper.find('#left').trigger('mousedown', { button: right })
  t.is(stubLeft.calls.length, 1)
  wrapper.find('#left').trigger('mousedown', { button: middle })
  t.is(stubLeft.calls.length, 1)

  t.is(stubRight.calls.length, 0)
  wrapper.find('#right').trigger('mousedown', { button: left })
  t.is(stubRight.calls.length, 0)
  wrapper.find('#right').trigger('mousedown', { button: right })
  t.is(stubRight.calls.length, 1)
  wrapper.find('#right').trigger('mousedown', { button: middle })
  t.is(stubRight.calls.length, 1)

  t.is(stubMiddle.calls.length, 0)
  wrapper.find('#middle').trigger('mousedown', { button: left })
  t.is(stubMiddle.calls.length, 0)
  wrapper.find('#middle').trigger('mousedown', { button: right })
  t.is(stubMiddle.calls.length, 0)
  wrapper.find('#middle').trigger('mousedown', { button: middle })
  t.is(stubMiddle.calls.length, 1)
})

test('should support KeyboardEvent.key for built in aliases', t => {
  const stub = t.context.stub()
  const wrapper = mount({
    methods: { foo: stub },
    render(h) {
      return (
        <div>
          <input id="enter" vOn:keyup_enter={this.foo} />
          <input id="space" vOn:keyup_space={this.foo} />
          <input id="esc" vOn:keyup_esc={this.foo} />
          <input id="left" vOn:keyup_left={this.foo} />
          <input id="delete" vOn:keyup_delete={this.foo} />
        </div>
      )
    },
  })

  t.is(stub.calls.length, 0)
  wrapper.find('#enter').trigger('keyup', { key: 'Enter' })
  t.is(stub.calls.length, 1)
  wrapper.find('#space').trigger('keyup', { key: ' ' })
  t.is(stub.calls.length, 2)
  wrapper.find('#esc').trigger('keyup', { key: 'Escape' })
  t.is(stub.calls.length, 3)
  wrapper.find('#left').trigger('keyup', { key: 'ArrowLeft' })
  t.is(stub.calls.length, 4)
  wrapper.find('#delete').trigger('keyup', { key: 'Backspace' })
  t.is(stub.calls.length, 5)
  wrapper.find('#delete').trigger('keyup', { key: 'Delete' })
  t.is(stub.calls.length, 6)
})

test('should support custom keyCode', t => {
  const localVue = createLocalVue()
  localVue.config.keyCodes.test = 1
  const stub = t.context.stub()
  const wrapper = mount(
    {
      methods: { foo: stub },
      render(h) {
        return <input vOn:keyup_test={this.foo} />
      },
    },
    { localVue },
  )

  t.is(stub.calls.length, 0)
  wrapper.trigger('keyup', { keyCode: 1 })
  t.is(stub.calls.length, 1)
})

test('should bind to a child component', t => {
  const stub = t.context.stub()
  const Bar = {
    render(h) {
      return <span>Hello</span>
    },
  }
  const wrapper = mount({
    methods: { foo: stub },
    render(h) {
      return <Bar vOn:custom={this.foo} />
    },
  })

  wrapper.vm.$children[0].$emit('custom', 'foo', 'bar')
  t.deepEqual(stub.calls[0].arguments, ['foo', 'bar'])
})

test('should be able to bind native events for a child component', t => {
  const stub = t.context.stub()
  const Bar = {
    render(h) {
      return <span>Hello</span>
    },
  }
  const wrapper = mount({
    methods: { foo: stub },
    render(h) {
      return <Bar vOn:click_native={this.foo} />
    },
  })

  wrapper.vm.$children[0].$emit('click')
  t.is(stub.calls.length, 0)
  wrapper.find('span').trigger('click')
  t.is(stub.calls.length, 1)
})

test('_once modifier should work with child components', t => {
  const stub = t.context.stub()
  const Bar = {
    render(h) {
      return <span>Hello</span>
    },
  }
  const wrapper = mount({
    methods: { foo: stub },
    render(h) {
      return <Bar vOn:custom_once={this.foo} />
    },
  })

  t.is(stub.calls.length, 0)
  wrapper.vm.$children[0].$emit('custom')
  t.is(stub.calls.length, 1)
  wrapper.vm.$children[0].$emit('custom')
  t.is(stub.calls.length, 1)
})

test('should support keyboard modifier for direction keys', t => {
  const stubLeft = t.context.stub()
  const stubRight = t.context.stub()
  const stubUp = t.context.stub()
  const stubDown = t.context.stub()
  const wrapper = mount({
    methods: {
      foo: stubLeft,
      foo1: stubRight,
      foo2: stubUp,
      foo3: stubDown,
    },
    render(h) {
      return (
        <div>
          <input id="left" vOn:keydown_left={this.foo} />
          <input id="right" vOn:keydown_right={this.foo1} />
          <input id="up" vOn:keydown_up={this.foo2} />
          <input id="down" vOn:keydown_down={this.foo3} />
        </div>
      )
    },
  })
  wrapper.find('#left').trigger('keydown.left')
  wrapper.find('#left').trigger('keydown.right')

  wrapper.find('#right').trigger('keydown.right')
  wrapper.find('#right').trigger('keydown.up')

  wrapper.find('#up').trigger('keydown.up')
  wrapper.find('#up').trigger('keydown.left')

  wrapper.find('#down').trigger('keydown.down')
  wrapper.find('#down').trigger('keydown.right')

  t.is(stubLeft.calls.length, 1)
  t.is(stubRight.calls.length, 1)
  t.is(stubUp.calls.length, 1)
  t.is(stubDown.calls.length, 1)
})
