import _mergeJSXProps from '@vuejs/babel-helper-vue-jsx-merge-props'
import test from 'ava'
require('jsdom-global')()
const { shallow, mount } = require('vue-test-utils')

// const CustomInput = {
//   model: {
//     prop: 'value',
//     event: 'change',
//   },
//   props: {
//     value: String,
//   },
//   render(h) {
//     return (
//       <input type="text" domPropsValue={this.value} onInput={$event => this.$emit('change', $event.target.value)} />
//     )
//   },
// }

// test('Generic component vModel', async t => {
//   const wrapper = shallow({
//     data: () => ({
//       hello: 'everyone',
//     }),
//     render(h) {
//       return (
//         <div>
//           <span>{this.hello}</span>
//           <CustomInput vModel={this.hello} />
//         </div>
//       )
//     },
//   })

//   t.truthy(wrapper.is('div'))
//   t.is(wrapper.text(), 'everyone')
//   const input = wrapper.find('input')
//   t.is(input.element.value, 'everyone')
//   input.element.value = 'world'
//   input.trigger('input')
//   t.is(input.element.value, 'world')
//   t.is(wrapper.text(), 'world')
// })

// test('Component vModel:number', async t => {
//   const wrapper = shallow({
//     data: () => ({
//       number: 100,
//     }),
//     render(h) {
//       return (
//         <div>
//           <span>{this.number}</span>
//           <CustomInput vModel:number={this.number} />
//         </div>
//       )
//     },
//   })

//   t.truthy(wrapper.is('div'))
//   t.is(wrapper.text(), '100')
//   const input = wrapper.find('input')
//   t.is(input.element.value, '100')
//   input.element.value = '250'
//   input.trigger('input')
//   t.is(input.element.value, '250')
//   t.is(wrapper.text(), '250')
//   t.is(wrapper.vm.number, 250)
// })

// test('Generic select vModel', async t => {
//   const wrapper = shallow({
//     data: () => ({
//       selected: 'foo',
//     }),
//     render(h) {
//       return (
//         <div>
//           <select vModel={this.selected}>
//             <option value="foo">FOO</option>
//             <option value="bar">BAR</option>
//           </select>
//         </div>
//       )
//     },
//   })
//   const select = wrapper.find('select')
//   t.is(select.element.value, 'foo')
//   select.element.value = 'bar'
//   select.trigger('change')
//   t.is(wrapper.vm.selected, 'bar')
// })

// test('Generic input[type=checkbox] vModel', async t => {
//   const wrapper = shallow({
//     data: () => ({
//       selected: true,
//     }),
//     render(h) {
//       return (
//         <div>
//           <input type="checkbox" vModel={this.selected} />
//         </div>
//       )
//     },
//   })
//   const checkbox = wrapper.find('input')
//   t.is(checkbox.element.checked, true)
//   checkbox.element.checked = false
//   checkbox.trigger('change')
//   t.is(wrapper.vm.selected, false)
// })

test('input[type="checkbox"] should work', async t => {
  const wrapper = shallow({
    data: () => ({
      test: true,
    }),
    render(h) {
      return <input type="checkbox" vModel={this.test} />
    },
  })
  t.is(wrapper.element.checked, true)
  wrapper.vm.test = false
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.checked, false)
  t.is(wrapper.vm.test, false)
  wrapper.trigger('click')
  t.is(wrapper.element.checked, true)
  t.is(wrapper.vm.test, true)
})

test('input[type="checkbox"] should respect value bindings', async t => {
  const wrapper = shallow({
    data: () => ({
      test: 1,
      a: 1,
      b: 2,
    }),
    render(h) {
      return <input type="checkbox" vModel={this.test} trueValue={this.a} falseValue={this.b} />
    },
  })

  t.is(wrapper.element.checked, true)
  wrapper.trigger('click')
  t.is(wrapper.element.checked, false)
  t.is(wrapper.vm.test, 2)
  wrapper.trigger('click')
  t.is(wrapper.element.checked, true)
  t.is(wrapper.vm.test, 1)
  wrapper.vm.test = 2
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.checked, false)
  wrapper.vm.test = 1
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.checked, true)
})

test('input[type="checkbox"] bind to Array value', async t => {
  const wrapper = shallow({
    data: () => ({
      test: ['1'],
    }),
    render(h) {
      return (
        <div>
          <input type="checkbox" vModel={this.test} value="1" />
          <input type="checkbox" vModel={this.test} value="2" />
        </div>
      )
    },
  })

  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
  wrapper.element.children[0].click()
  t.is(wrapper.vm.test.length, 0)
  wrapper.element.children[1].click()
  t.deepEqual(wrapper.vm.test, ['2'])
  wrapper.element.children[0].click()
  t.deepEqual(wrapper.vm.test, ['2', '1'])
  wrapper.vm.test = ['1']
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
})

test('input[type="checkbox"] bind to Array value ignores false-value', async t => {
  const wrapper = shallow({
    data: () => ({
      test: ['1'],
    }),
    render(h) {
      return (
        <div>
          <input type="checkbox" vModel={this.test} value="1" falseValue="true" />
          <input type="checkbox" vModel={this.test} value="2" falseValue="true" />
        </div>
      )
    },
  })

  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
  wrapper.element.children[0].click()
  t.is(wrapper.vm.test.length, 0)
  wrapper.element.children[1].click()
  t.deepEqual(wrapper.vm.test, ['2'])
  wrapper.element.children[0].click()
  t.deepEqual(wrapper.vm.test, ['2', '1'])
  wrapper.vm.test = ['1']
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
})

test('input[type="checkbox"] bind to Array value with value bindings', async t => {
  const wrapper = shallow({
    data: () => ({
      test: [1],
    }),
    render(h) {
      return (
        <div>
          <input type="checkbox" vModel={this.test} value={1} />
          <input type="checkbox" vModel={this.test} value={2} />
        </div>
      )
    },
  })

  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
  wrapper.element.children[0].click()
  t.is(wrapper.vm.test.length, 0)
  wrapper.element.children[1].click()
  t.deepEqual(wrapper.vm.test, [2])
  wrapper.element.children[0].click()
  t.deepEqual(wrapper.vm.test, [2, 1])
  wrapper.vm.test = [1]
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
})

test('input[type="checkbox"] bind to Array value with value bindings (object loose equal)', async t => {
  const wrapper = shallow({
    data: () => ({
      test: [{ a: 1 }],
    }),
    render(h) {
      return (
        <div>
          <input type="checkbox" vModel={this.test} value={{ a: 1 }} />
          <input type="checkbox" vModel={this.test} value={{ a: 2 }} />
        </div>
      )
    },
  })

  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
  wrapper.element.children[0].click()
  t.is(wrapper.vm.test.length, 0)
  wrapper.element.children[1].click()
  t.deepEqual(wrapper.vm.test, [{ a: 2 }])
  wrapper.element.children[0].click()
  t.deepEqual(wrapper.vm.test, [{ a: 2 }, { a: 1 }])
  wrapper.vm.test = [{ a: 1 }]
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
})

test('input[type="checkbox"] bind to Array value with array value bindings (object loose equal)', async t => {
  const wrapper = shallow({
    data: () => ({
      test: [{ a: 1 }],
    }),
    render(h) {
      return (
        <div>
          <input type="checkbox" vModel={this.test} value={{ a: 1 }} />
          <input type="checkbox" vModel={this.test} value={[2]} />
        </div>
      )
    },
  })

  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
  wrapper.element.children[0].click()
  t.is(wrapper.vm.test.length, 0)
  wrapper.element.children[1].click()
  t.deepEqual(wrapper.vm.test, [[2]])
  wrapper.element.children[0].click()
  t.deepEqual(wrapper.vm.test, [[2], { a: 1 }])
  wrapper.vm.test = [{ a: 1 }]
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
})

test('input[type="checkbox"] .number modifier', async t => {
  const wrapper = shallow({
    data: () => ({
      test: [],
      check: true,
    }),
    render(h) {
      return (
        <div>
          <input type="checkbox" vModel:number={this.test} value="1" />
          <input type="checkbox" vModel={this.test} value="2" />
          <input type="checkbox" vModel:number={this.check} />
        </div>
      )
    },
  })

  const checkboxInputs = wrapper.element.getElementsByTagName('input')
  t.is(checkboxInputs[0].checked, false)
  t.is(checkboxInputs[1].checked, false)
  t.is(checkboxInputs[2].checked, true)
  checkboxInputs[0].click()
  checkboxInputs[1].click()
  checkboxInputs[2].click()
  t.deepEqual(wrapper.vm.test, [1, '2'])
  t.deepEqual(wrapper.vm.check, false)
})

test('input[type="checkbox"] should respect different primitive type value', async t => {
  const wrapper = shallow({
    data: () => ({
      test: [0],
    }),
    render(h) {
      return (
        <div>
          <input type="checkbox" value="" vModel={this.test} />
          <input type="checkbox" value="0" vModel={this.test} />
          <input type="checkbox" value="1" vModel={this.test} />
          <input type="checkbox" value="false" vModel={this.test} />
          <input type="checkbox" value="true" vModel={this.test} />
        </div>
      )
    },
  })
  const checkboxInput = wrapper.element.children
  t.is(checkboxInput[0].checked, false)
  t.is(checkboxInput[1].checked, true)
  t.is(checkboxInput[2].checked, false)
  t.is(checkboxInput[3].checked, false)
  t.is(checkboxInput[4].checked, false)
  wrapper.vm.test = [1]
  await wrapper.vm.$nextTick()
  t.is(checkboxInput[0].checked, false)
  t.is(checkboxInput[1].checked, false)
  t.is(checkboxInput[2].checked, true)
  t.is(checkboxInput[3].checked, false)
  t.is(checkboxInput[4].checked, false)
  wrapper.vm.test = ['']
  await wrapper.vm.$nextTick()
  t.is(checkboxInput[0].checked, true)
  t.is(checkboxInput[1].checked, false)
  t.is(checkboxInput[2].checked, false)
  t.is(checkboxInput[3].checked, false)
  t.is(checkboxInput[4].checked, false)
  wrapper.vm.test = [false]
  await wrapper.vm.$nextTick()
  t.is(checkboxInput[0].checked, false)
  t.is(checkboxInput[1].checked, false)
  t.is(checkboxInput[2].checked, false)
  t.is(checkboxInput[3].checked, true)
  t.is(checkboxInput[4].checked, false)
  wrapper.vm.test = [true]
  await wrapper.vm.$nextTick()
  t.is(checkboxInput[0].checked, false)
  t.is(checkboxInput[1].checked, false)
  t.is(checkboxInput[2].checked, false)
  t.is(checkboxInput[3].checked, false)
  t.is(checkboxInput[4].checked, true)
  wrapper.vm.test = ['', 0, 1, false, true]
  await wrapper.vm.$nextTick()
  t.is(checkboxInput[0].checked, true)
  t.is(checkboxInput[1].checked, true)
  t.is(checkboxInput[2].checked, true)
  t.is(checkboxInput[3].checked, true)
  t.is(checkboxInput[4].checked, true)
})

// #4521
test('input[type="checkbox"] should work with click event', async t => {
  const wrapper = shallow({
    data: () => ({
      num: 1,
      checked: false,
    }),
    render(h) {
      return (
        <div onClick={this.add}>
          click {this.num}
          <input ref="checkbox" type="checkbox" vModel={this.checked} />
        </div>
      )
    },
    methods: {
      add: function() {
        this.num++
      },
    },
  })

  const checkbox = wrapper.vm.$refs.checkbox
  checkbox.click()

  await wrapper.vm.$nextTick()
  t.is(checkbox.checked, true)
  t.is(wrapper.vm.num, 2)
})

test('input[type="checkbox"] should get updated with model when in focus', async t => {
  const wrapper = shallow({
    data: () => ({
      a: 2,
    }),
    render(h) {
      return <input type="checkbox" vModel={this.a} />
    },
  })

  wrapper.trigger('click')

  await wrapper.vm.$nextTick()
  t.is(wrapper.element.checked, false)
  wrapper.vm.a = 2
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.checked, true)
})

test('input[type="checkbox"] triggers a watcher when binding to an array value in a checkbox', async t => {
  const wrapper = shallow({
    data: () => ({
      test: {
        thing: false,
        arr: [true],
      },
    }),
    render(h) {
      return (
        <div>
          <input type="checkbox" vModel={this.test.arr[0]} />
          <span>{String(this.test.arr[0])}</span>
        </div>
      )
    },
  })

  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].textContent, 'true')
  wrapper.element.children[0].click()
  t.is(wrapper.element.children[0].checked, false)

  await wrapper.vm.$nextTick()
  t.is(wrapper.element.children[1].textContent, 'false')
})

test('component should work', async t => {
  const a = {
    b: {
      props: ['value'],
      render(h) {
        return <input value={this.value} onInput={$event => this.$emit('input', $event.target.value)} />
      },
    },
  }
  const wrapper = mount({
    data: () => ({
      msg: 'hello',
    }),
    render(h) {
      return (
        <div>
          <p>{this.msg}</p>
          <a.b vModel={this.msg} />
        </div>
      )
    },
  })

  await wrapper.vm.$nextTick()
  const input = wrapper.find('input')
  input.element.value = 'world'
  input.trigger('input')
  await wrapper.vm.$nextTick()
  t.is(wrapper.vm.msg, 'world')
  t.is(wrapper.element.querySelector('p').textContent, 'world')
  wrapper.vm.msg = 'changed'
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.querySelector('p').textContent, 'changed')
  t.is(wrapper.element.querySelector('input').value, 'changed')
  await wrapper.vm.$nextTick()
})

test('component should support customization via model option', async t => {
  let caller = null
  const spy = arg => (caller = arg)
  const Test = {
    model: {
      prop: 'currentValue',
      event: 'update',
    },
    props: ['currentValue'],
    render(h) {
      return <input value={this.currentValue} onInput={$event => this.$emit('update', $event.target.value)} />
    },
  }
  const wrapper = mount({
    data: () => ({
      msg: 'hello',
    }),
    methods: {
      spy,
    },
    render(h) {
      return (
        <div>
          <p>{this.msg}</p>
          <Test vModel={this.msg} onUpdate={this.spy} />
        </div>
      )
    },
  })

  await wrapper.vm.$nextTick()
  const input = wrapper.find('input')
  input.element.value = 'world'
  input.trigger('input')
  await wrapper.vm.$nextTick()
  t.is(wrapper.vm.msg, 'world')
  t.is(wrapper.element.querySelector('p').textContent, 'world')
  t.is(caller, 'world')
  wrapper.vm.msg = 'changed'
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.querySelector('p').textContent, 'changed')
  t.is(wrapper.element.querySelector('input').value, 'changed')
  await wrapper.vm.$nextTick()
})

test('component modifier: .number', async t => {
  const MyInput = {
    render(h) {
      return <input />
    },
  }
  const wrapper = mount({
    render(h) {
      return (
        <div>
          <MyInput ref="input" vModel:number={this.text} />
        </div>
      )
    },
    data: () => ({ text: 'foo' }),
  })
  t.is(wrapper.vm.text, 'foo')
  wrapper.vm.$refs.input.$emit('input', 'bar')
  t.is(wrapper.vm.text, 'bar')
  wrapper.vm.$refs.input.$emit('input', '123')
  t.is(wrapper.vm.text, 123)
})

test('component modifier: .trim', async t => {
  const MyInput = {
    render(h) {
      return <input />
    },
  }
  const wrapper = mount({
    render(h) {
      return (
        <div>
          <MyInput ref="input" vModel:trim={this.text} />
        </div>
      )
    },
    data: () => ({ text: 'foo' }),
  })
  t.is(wrapper.vm.text, 'foo')
  wrapper.vm.$refs.input.$emit('input', '  bar  ')
  t.is(wrapper.vm.text, 'bar')
  wrapper.vm.$refs.input.$emit('input', '   foo o  ')
  t.is(wrapper.vm.text, 'foo o')
})

test('input[type="radio"] should work', async t => {
  const wrapper = mount({
    data: () => ({
      test: '1',
    }),
    render(h) {
      return (
        <div>
          <input type="radio" value="1" vModel={this.test} name="test" />
          <input type="radio" value="2" vModel={this.test} name="test" />
        </div>
      )
    },
  })

  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
  wrapper.vm.test = '2'
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.children[0].checked, false)
  t.is(wrapper.element.children[1].checked, true)
  wrapper.element.children[0].click()
  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
  t.is(wrapper.vm.test, '1')
})

test('input[type="radio"] should respect value bindings', async t => {
  const wrapper = mount({
    data: () => ({
      test: 1,
    }),
    render(h) {
      return (
        <div>
          <input type="radio" value={1} vModel={this.test} name="test" />
          <input type="radio" value={2} vModel={this.test} name="test" />
        </div>
      )
    },
  })

  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
  wrapper.vm.test = 2
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.children[0].checked, false)
  t.is(wrapper.element.children[1].checked, true)
  wrapper.element.children[0].click()
  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
  t.is(wrapper.vm.test, 1)
})

test('input[type="radio"] should respect value bindings (object loose equal)', async t => {
  const wrapper = mount({
    data: () => ({
      test: { a: 1 },
    }),
    render(h) {
      return (
        <div>
          <input type="radio" value={{ a: 1 }} vModel={this.test} name="test" />
          <input type="radio" value={{ a: 2 }} vModel={this.test} name="test" />
        </div>
      )
    },
  })

  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
  wrapper.vm.test = { a: 2 }
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.children[0].checked, false)
  t.is(wrapper.element.children[1].checked, true)
  wrapper.element.children[0].click()
  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
  t.deepEqual(wrapper.vm.test, { a: 1 })
})

test('input[type="radio"] multiple radios', async t => {
  let called = false
  const spy = () => (called = true)
  const wrapper = mount({
    data: () => ({
      selections: ['a', '1'],
      radioList: [
        {
          name: 'questionA',
          data: ['a', 'b', 'c'],
        },
        {
          name: 'questionB',
          data: ['1', '2'],
        },
      ],
    }),
    watch: {
      selections: spy,
    },
    render(h) {
      return (
        <div>
          {this.radioList.map((radioGroup, idx) => (
            <div>
              {radioGroup.data.map((item, index) => (
                <span>
                  <input name={radioGroup.name} type="radio" value={item} vModel={this.selections[idx]} />
                  <label>{item}</label>
                </span>
              ))}
            </div>
          ))}
        </div>
      )
    },
  })
  var inputs = wrapper.element.getElementsByTagName('input')
  inputs[1].click()
  await wrapper.vm.$nextTick()
  t.deepEqual(wrapper.vm.selections, ['b', '1'])
  t.is(called, true)
})

test('input[type="radio"] .number modifier', async t => {
  const wrapper = mount({
    data: () => ({
      test: 1,
    }),
    render(h) {
      return (
        <div>
          <input type="radio" value="1" vModel={this.test} name="test" />
          <input type="radio" value="2" vModel:number={this.test} name="test" />
        </div>
      )
    },
  })

  t.is(wrapper.element.children[0].checked, true)
  t.is(wrapper.element.children[1].checked, false)
  wrapper.element.children[1].click()
  t.is(wrapper.element.children[0].checked, false)
  t.is(wrapper.element.children[1].checked, true)
  t.is(wrapper.vm.test, 2)
})

test('input[type="radio"] should respect different primitive type value', async t => {
  const wrapper = mount({
    data: () => ({
      test: 1,
    }),
    render(h) {
      return (
        <div>
          <input type="radio" value="" vModel={this.test} name="test" />
          <input type="radio" value="0" vModel={this.test} name="test" />
          <input type="radio" value="1" vModel={this.test} name="test" />
          <input type="radio" value="false" vModel={this.test} name="test" />
          <input type="radio" value="true" vModel={this.test} name="test" />
        </div>
      )
    },
  })
  const radioboxInput = wrapper.element.children
  t.is(radioboxInput[0].checked, false)
  t.is(radioboxInput[1].checked, false)
  t.is(radioboxInput[2].checked, true)
  t.is(radioboxInput[3].checked, false)
  t.is(radioboxInput[4].checked, false)
  wrapper.vm.test = 0
  await wrapper.vm.$nextTick()
  t.is(radioboxInput[0].checked, false)
  t.is(radioboxInput[1].checked, true)
  t.is(radioboxInput[2].checked, false)
  t.is(radioboxInput[3].checked, false)
  t.is(radioboxInput[4].checked, false)
  wrapper.vm.test = ''
  await wrapper.vm.$nextTick()
  t.is(radioboxInput[0].checked, true)
  t.is(radioboxInput[1].checked, false)
  t.is(radioboxInput[2].checked, false)
  t.is(radioboxInput[3].checked, false)
  t.is(radioboxInput[4].checked, false)
  wrapper.vm.test = false
  await wrapper.vm.$nextTick()
  t.is(radioboxInput[0].checked, false)
  t.is(radioboxInput[1].checked, false)
  t.is(radioboxInput[2].checked, false)
  t.is(radioboxInput[3].checked, true)
  t.is(radioboxInput[4].checked, false)
  wrapper.vm.test = true
  await wrapper.vm.$nextTick()
  t.is(radioboxInput[0].checked, false)
  t.is(radioboxInput[1].checked, false)
  t.is(radioboxInput[2].checked, false)
  t.is(radioboxInput[3].checked, false)
  t.is(radioboxInput[4].checked, true)
})

// #4521
test('input[type="radio"] should work with click event', async t => {
  const wrapper = mount({
    data: () => ({
      num: 1,
      checked: 1,
    }),
    render(h) {
      return (
        <div onClick={this.add}>
          click {this.num}
          <input name="test" type="radio" value="1" vModel={this.checked} />
          <input name="test" type="radio" value="2" vModel={this.checked} />
        </div>
      )
    },
    methods: {
      add() {
        this.num++
      },
    },
  })

  const radios = wrapper.element.getElementsByTagName('input')
  radios[0].click()
  await wrapper.vm.$nextTick()
  t.is(radios[0].checked, true)
  t.is(radios[1].checked, false)
  t.is(wrapper.vm.num, 2)
  radios[0].click()
  await wrapper.vm.$nextTick()
  t.is(radios[0].checked, true)
  t.is(radios[1].checked, false)
  t.is(wrapper.vm.num, 3)
  radios[1].click()
  await wrapper.vm.$nextTick()
  t.is(radios[0].checked, false)
  t.is(radios[1].checked, true)
  t.is(wrapper.vm.num, 4)
})

test('input[type="radio"] should get updated with model when in focus', async t => {
  const wrapper = mount({
    data: () => ({
      a: '2',
    }),
    render(h) {
      return <input type="radio" value="1" vModel={this.a} />
    },
  })

  wrapper.element.click()
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.checked, true)
  wrapper.vm.a = 2
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.checked, false)
})

test('select should work', async t => {
  const wrapper = mount({
    data: () => ({
      test: 'b',
    }),
    render(h) {
      return (
        <select vModel={this.test}>
          <option>a</option>
          <option>b</option>
          <option>c</option>
        </select>
      )
    },
  })

  t.is(wrapper.vm.test, 'b')
  t.is(wrapper.element.value, 'b')
  t.is(wrapper.element.childNodes[1].selected, true)
  wrapper.vm.test = 'c'
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.value, 'c')
  t.is(wrapper.element.childNodes[2].selected, true)
  wrapper.element.value = 'a'
  wrapper.trigger('change')
  t.is(wrapper.vm.test, 'a')
})

test('select should work with value bindings', async t => {
  const wrapper = mount({
    data: () => ({
      test: 2,
    }),
    render(h) {
      return (
        <select vModel={this.test}>
          <option value="1">a</option>
          <option value={2}>b</option>
          <option value={3}>c</option>
        </select>
      )
    },
  })

  t.is(wrapper.element.value, '2')
  t.is(wrapper.element.childNodes[1].selected, true)
  wrapper.vm.test = 3
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.value, '3')
  t.is(wrapper.element.childNodes[2].selected, true)

  wrapper.element.value = '1'
  wrapper.trigger('change')
  t.is(wrapper.vm.test, '1')

  wrapper.element.value = '2'
  wrapper.trigger('change')
  t.is(wrapper.vm.test, 2)
})

test('select should work with value bindings (object loose equal)', async t => {
  const wrapper = mount({
    data: () => ({
      test: { a: 2 },
    }),
    render(h) {
      return (
        <select vModel={this.test}>
          <option value="1">a</option>
          <option value={{ a: 2 }}>b</option>
          <option value={{ a: 3 }}>c</option>
        </select>
      )
    },
  })

  t.is(wrapper.element.childNodes[1].selected, true)
  wrapper.vm.test = { a: 3 }
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.childNodes[2].selected, true)

  wrapper.element.value = '1'
  wrapper.trigger('change')
  t.is(wrapper.vm.test, '1')

  wrapper.element.value = { a: 2 }
  wrapper.trigger('change')
  t.deepEqual(wrapper.vm.test, { a: 2 })
})

test('select should work with value bindings (Array loose equal)', async t => {
  const wrapper = mount({
    data: () => ({
      test: [{ a: 2 }],
    }),
    render(h) {
      return (
        <select vModel={this.test}>
          <option value="1">a</option>
          <option value={[{ a: 2 }]}>b</option>
          <option value={[{ a: 3 }]}>c</option>
        </select>
      )
    },
  })
  t.is(wrapper.element.childNodes[1].selected, true)
  wrapper.vm.test = [{ a: 3 }]
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.childNodes[2].selected, true)

  wrapper.element.value = '1'
  wrapper.trigger('change')
  t.is(wrapper.vm.test, '1')

  wrapper.element.value = [{ a: 2 }]
  wrapper.trigger('change')
  t.deepEqual(wrapper.vm.test, [{ a: 2 }])
})

test('select should work with v-for', async t => {
  const wrapper = mount({
    data: () => ({
      test: 'b',
      opts: ['a', 'b', 'c'],
    }),
    render(h) {
      return <select vModel={this.test}>{this.opts.map(o => <option>{o}</option>)}</select>
    },
  })
  t.is(wrapper.vm.test, 'b')
  t.is(wrapper.element.value, 'b')
  t.is(wrapper.element.childNodes[1].selected, true)
  wrapper.vm.test = 'c'
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.value, 'c')
  t.is(wrapper.element.childNodes[2].selected, true)
  wrapper.element.value = 'a'
  wrapper.trigger('change')
  t.is(wrapper.vm.test, 'a')
  // update v-for opts
  wrapper.vm.opts = ['d', 'a']
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.childNodes[0].selected, false)
  t.is(wrapper.element.childNodes[1].selected, true)
})

test('select should work with v-for & value bindings', async t => {
  const wrapper = mount({
    data: () => ({
      test: 2,
      opts: [1, 2, 3],
    }),
    render(h) {
      return <select vModel={this.test}>{this.opts.map(o => <option value={o}>option {o}</option>)}</select>
    },
  })
  t.is(wrapper.element.value, '2')
  t.is(wrapper.element.childNodes[1].selected, true)
  wrapper.vm.test = 3
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.value, '3')
  t.is(wrapper.element.childNodes[2].selected, true)
  wrapper.element.value = 1
  wrapper.trigger('change')
  t.is(wrapper.vm.test, 1)
  // update v-for opts
  wrapper.vm.opts = [0, 1]
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.childNodes[0].selected, false)
  t.is(wrapper.element.childNodes[1].selected, true)
})

test('select should work with select which has no default selected options', async t => {
  let calls = 0
  const spy = () => ++calls
  const wrapper = mount({
    data: () => ({
      id: 4,
      list: [1, 2, 3],
      testChange: 5,
    }),
    render(h) {
      return (
        <div>
          <select onChange={this.test} vModel={this.id}>
            {this.list.map(item => <option value={item}>{item}</option>)}
          </select>
          {this.testChange}
        </div>
      )
    },
    methods: {
      test: spy,
    },
  })
  wrapper.vm.testChange = 10
  await wrapper.vm.$nextTick()
  t.is(calls, 0)
})

test('select multiple', async t => {
  const wrapper = mount({
    data: () => ({
      test: ['b'],
    }),
    render(h) {
      return (
        <select vModel={this.test} multiple>
          <option>a</option>
          <option>b</option>
          <option>c</option>
        </select>
      )
    },
  })
  var opts = wrapper.element.options
  t.is(opts[0].selected, false)
  t.is(opts[1].selected, true)
  t.is(opts[2].selected, false)
  wrapper.vm.test = ['a', 'c']
  await wrapper.vm.$nextTick()
  t.is(opts[0].selected, true)
  t.is(opts[1].selected, false)
  t.is(opts[2].selected, true)
  opts[0].selected = false
  opts[1].selected = true
  wrapper.trigger('change')
  t.deepEqual(wrapper.vm.test, ['b', 'c'])
})

test('select multiple + v-for', async t => {
  const wrapper = mount({
    data: () => ({
      test: ['b'],
      opts: ['a', 'b', 'c'],
    }),
    render(h) {
      return (
        <select vModel={this.test} multiple>
          {this.opts.map(o => <option>{o}</option>)}
        </select>
      )
    },
  })
  var opts = wrapper.element.options
  t.is(opts[0].selected, false)
  t.is(opts[1].selected, true)
  t.is(opts[2].selected, false)
  wrapper.vm.test = ['a', 'c']
  await wrapper.vm.$nextTick()
  t.is(opts[0].selected, true)
  t.is(opts[1].selected, false)
  t.is(opts[2].selected, true)
  opts[0].selected = false
  opts[1].selected = true
  wrapper.trigger('change')
  t.deepEqual(wrapper.vm.test, ['b', 'c'])
  // update v-for opts
  wrapper.vm.opts = ['c', 'd']
  await wrapper.vm.$nextTick()
  t.is(opts[0].selected, true)
  t.is(opts[1].selected, false)
  t.deepEqual(wrapper.vm.test, ['c']) // should remove 'd' which no longer has a matching option
})

test('select should work with multiple binding', async t => {
  let called = false
  const spy = () => (called = true)
  const wrapper = mount({
    data: () => ({
      isMultiple: true,
      selections: ['1'],
    }),
    render(h) {
      return (
        <select vModel={this.selections} multiple={this.isMultiple}>
          <option value="1">item 1</option>
          <option value="2">item 2</option>
        </select>
      )
    },
    watch: {
      selections: spy,
    },
  })

  wrapper.element.options[1].selected = true
  wrapper.trigger('change')
  await wrapper.vm.$nextTick()
  t.is(called, true)
  t.deepEqual(wrapper.vm.selections, ['1', '2'])
})

test('select multiple selects', async t => {
  let called = false
  const spy = () => (called = true)
  const wrapper = mount({
    data: () => ({
      selections: ['', ''],
      selectBoxes: [
        [{ value: 'foo', text: 'foo' }, { value: 'bar', text: 'bar' }],
        [{ value: 'day', text: 'day' }, { value: 'night', text: 'night' }],
      ],
    }),
    watch: {
      selections: spy,
    },
    render(h) {
      return (
        <div>
          {this.selectBoxes.map((item, index) => (
            <select vModel={this.selections[index]}>
              {item.map(element => <option value={element.value}>{element.text}</option>)}
            </select>
          ))}
          <span ref="rs">{this.selections}</span>
        </div>
      )
    },
  })
  document.body.appendChild(wrapper.element)
  var selects = wrapper.findAll('select')
  var select0 = selects.at(0)
  select0.element.options[0].selected = true
  select0.trigger('change')
  await wrapper.vm.$nextTick()
  t.is(called, true)
  t.deepEqual(wrapper.vm.selections, ['foo', ''])
})

test('select .number modifier', async t => {
  const wrapper = mount({
    data: () => ({
      test: 2,
    }),
    render(h) {
      return (
        <select vModel:number={this.test}>
          <option value="1">a</option>
          <option value={2}>b</option>
          <option value={3}>c</option>
        </select>
      )
    },
  })
  wrapper.element.value = '1'
  wrapper.trigger('change')
  t.is(wrapper.vm.test, 1)
})

test('select should respect different primitive type value', async t => {
  const wrapper = mount({
    data: () => ({
      test: 0,
    }),
    render(h) {
      return (
        <select vModel:number={this.test}>
          <option value="">a</option>
          <option value="0">b</option>
          <option value="1">c</option>
          <option value="false">c</option>
          <option value="true">c</option>
        </select>
      )
    },
  })
  var opts = wrapper.element.options
  t.is(opts[0].selected, false)
  t.is(opts[1].selected, true)
  t.is(opts[2].selected, false)
  t.is(opts[3].selected, false)
  t.is(opts[4].selected, false)
  wrapper.vm.test = 1
  await wrapper.vm.$nextTick()
  t.is(opts[0].selected, false)
  t.is(opts[1].selected, false)
  t.is(opts[2].selected, true)
  t.is(opts[3].selected, false)
  t.is(opts[4].selected, false)
  wrapper.vm.test = ''
  await wrapper.vm.$nextTick()
  t.is(opts[0].selected, true)
  t.is(opts[1].selected, false)
  t.is(opts[2].selected, false)
  t.is(opts[3].selected, false)
  t.is(opts[4].selected, false)
  wrapper.vm.test = false
  await wrapper.vm.$nextTick()
  t.is(opts[0].selected, false)
  t.is(opts[1].selected, false)
  t.is(opts[2].selected, false)
  t.is(opts[3].selected, true)
  t.is(opts[4].selected, false)
  wrapper.vm.test = true
  await wrapper.vm.$nextTick()
  t.is(opts[0].selected, false)
  t.is(opts[1].selected, false)
  t.is(opts[2].selected, false)
  t.is(opts[3].selected, false)
  t.is(opts[4].selected, true)
})

test('select should work with option value that has circular reference', async t => {
  const circular = {}
  circular.self = circular

  const wrapper = mount({
    data: () => ({
      test: 'b',
      circular,
    }),
    render(h) {
      return (
        <select vModel={this.test}>
          <option value={this.circular}>a</option>
          <option>b</option>
          <option>c</option>
        </select>
      )
    },
  })
  t.is(wrapper.vm.test, 'b')
  t.is(wrapper.element.value, 'b')
  t.is(wrapper.element.childNodes[1].selected, true)
  wrapper.vm.test = circular
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.childNodes[0].selected, true)
})

// #6112
test('select should not set non-matching value to undefined if options did not change', async t => {
  const wrapper = mount({
    data: () => ({
      test: '1',
    }),
    render(h) {
      return (
        <select vModel={this.test}>
          <option>a</option>
        </select>
      )
    },
  })

  wrapper.vm.test = '2'
  await wrapper.vm.$nextTick()
  t.is(wrapper.vm.test, '2')
})

// #6193
test('select should not trigger change event when matching option can be found for each value', async t => {
  let called = false
  const spy = () => (called = true)
  const wrapper = mount({
    data: () => ({
      options: ['1'],
    }),
    computed: {
      test: {
        get() {
          return '1'
        },
        set() {
          spy()
        },
      },
    },
    render(h) {
      return (
        <select vModel={this.test}>
          {this.options.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )
    },
  })

  wrapper.vm.options = ['1', '2']
  await wrapper.vm.$nextTick()
  t.is(called, false)
})

test('textarea should update value both ways', async t => {
  const wrapper = mount({
    data: () => ({
      test: 'b',
    }),
    render(h) {
      return <textarea vModel={this.test} />
    },
  })
  t.is(wrapper.element.value, 'b')
  wrapper.vm.test = 'a'
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.value, 'a')
  wrapper.element.value = 'c'
  wrapper.trigger('input')
  t.is(wrapper.vm.test, 'c')
})

test('input[type="text"] should update value both ways', async t => {
  const wrapper = mount({
    data: () => ({
      test: 'b',
    }),
    render(h) {
      return <input vModel={this.test} />
    },
  })
  t.is(wrapper.element.value, 'b')
  wrapper.vm.test = 'a'
  await wrapper.vm.$nextTick()
  t.is(wrapper.element.value, 'a')
  wrapper.element.value = 'c'
  wrapper.trigger('input')
  t.is(wrapper.vm.test, 'c')
})

test('input[type="text"] .lazy modifier', async t => {
  const wrapper = mount({
    data: () => ({
      test: 'b',
    }),
    render(h) {
      return <input vModel:lazy={this.test} />
    },
  })
  t.is(wrapper.element.value, 'b')
  t.is(wrapper.vm.test, 'b')
  wrapper.element.value = 'c'
  wrapper.trigger('input')
  t.is(wrapper.vm.test, 'b')
  wrapper.element.value = 'c'
  wrapper.trigger('change')
  t.is(wrapper.vm.test, 'c')
})

test('input[type="text"] .number modifier', async t => {
  const wrapper = mount({
    data: () => ({
      test: 1,
    }),
    render(h) {
      return <input vModel:number={this.test} />
    },
  })
  t.is(wrapper.vm.test, 1)
  wrapper.element.value = '2'
  wrapper.trigger('input')
  t.is(wrapper.vm.test, 2)
  // should let strings pass through
  wrapper.element.value = 'f'
  wrapper.trigger('input')
  t.is(wrapper.vm.test, 'f')
})

test('input[type="text"] .trim modifier', async t => {
  const wrapper = mount({
    data: () => ({
      test: 'hi',
    }),
    render(h) {
      return <input vModel:trim={this.test} />
    },
  })
  t.is(wrapper.vm.test, 'hi')
  wrapper.element.value = ' what '
  wrapper.trigger('input')
  t.is(wrapper.vm.test, 'what')
})

test('input[type="text"] .number focus and typing', async t => {
  const wrapper = mount({
    data: () => ({
      test: 0,
      update: 0,
    }),
    render(h) {
      return (
        <div>
          <input ref="input" vModel:number={this.test} />
          {this.update}
          <input ref="blur" />
        </div>
      )
    },
  })
  wrapper.vm.$refs.input.focus()
  t.is(wrapper.vm.test, 0)
  wrapper.vm.$refs.input.value = '1.0'
  wrapper.find('input').trigger('input')
  t.is(wrapper.vm.test, 1)
  wrapper.vm.update++
  await wrapper.vm.$nextTick()
  t.is(wrapper.vm.$refs.input.value, '1')
})

test('input[type="text"] .trim focus and typing', async t => {
  const wrapper = mount({
    data: () => ({
      test: 'abc',
      update: 0,
    }),
    render(h) {
      return (
        <div>
          <input ref="input" vModel:trim={this.test} type="text" />
          {this.update}
          <input ref="blur" />
        </div>
      )
    },
  })

  wrapper.vm.$refs.input.focus()
  wrapper.vm.$refs.input.value = ' abc '
  wrapper.find('input').trigger('input')
  t.is(wrapper.vm.test, 'abc')
  wrapper.vm.update++
  await wrapper.vm.$nextTick()
  t.is(wrapper.vm.$refs.input.value, ' abc ')
  wrapper.vm.$refs.blur.focus()
  wrapper.vm.update++
  await wrapper.vm.$nextTick()
  t.is(wrapper.vm.$refs.input.value, 'abc')
})

test('input[type="text"] multiple inputs', async t => {
  let called = false
  const spy = () => (called = true)
  const wrapper = mount({
    data: () => ({
      selections: [[1, 2, 3], [4, 5]],
      inputList: [
        {
          name: 'questionA',
          data: ['a', 'b', 'c'],
        },
        {
          name: 'questionB',
          data: ['1', '2'],
        },
      ],
    }),
    watch: {
      selections: spy,
    },
    render(h) {
      return (
        <div>
          {this.inputList.map((inputGroup, idx) => (
            <div>
              <div>
                {inputGroup.data.map((item, index) => (
                  <span>
                    <input name={item} type="text" vModel:number={this.selections[idx][index]} id={idx + '-' + index} />
                    <label>{item}</label>
                  </span>
                ))}
              </div>
            </div>
          ))}
          <span ref="rs">{this.selections}</span>
        </div>
      )
    },
  })
  var inputs = wrapper.element.getElementsByTagName('input')
  inputs[1].value = 'test'
  wrapper
    .findAll('input')
    .at(1)
    .trigger('input')
  await wrapper.vm.$nextTick()
  t.is(called, true)
  t.deepEqual(wrapper.vm.selections, [[1, 'test', 3], [4, 5]])
})
