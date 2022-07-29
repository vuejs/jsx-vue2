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
    name: 'Ignores non vModel arguments',
    from: `const A = <A x="y" a:b={c} />`,
    to: `const A = <A x="y" a:b={c} />;`,
  },
  {
    name: 'Generic component vModel',
    from: `const A = <MyComponent vModel={a.b} />`,
    to: `const A = <MyComponent model={{
  value: a.b,
  callback: $$v => {
    this.$set(a, "b", $$v);
  }
}} />;`,
  },
  {
    name: 'Kebab case component vModel',
    from: `const A = <my-component vModel={a.b} />`,
    to: `const A = <my-component model={{
  value: a.b,
  callback: $$v => {
    this.$set(a, "b", $$v);
  }
}} />;`,
  },
  {
    name: 'MemberExpression component vModel',
    from: `const A = <a.b vModel={a.b} />`,
    to: `const A = <a.b model={{
  value: a.b,
  callback: $$v => {
    this.$set(a, "b", $$v);
  }
}} />;`,
  },
  {
    name: 'Component vModel_number',
    from: `const A = <MyComponent vModel_number={a.b} />`,
    to: `const A = <MyComponent model={{
  value: a.b,
  callback: $$v => {
    this.$set(a, "b", this._n($$v));
  }
}} />;`,
  },
  {
    name: 'Component vModel_trim',
    from: `const A = <MyComponent vModel_trim={a.b} />`,
    to: `const A = <MyComponent model={{
  value: a.b,
  callback: $$v => {
    this.$set(a, "b", typeof $$v === "string" ? $$v.trim() : $$v);
  }
}} />;`,
  },
  {
    name: 'Component vModel_number_trim',
    from: `const A = <MyComponent vModel_number_trim={a.b} />`,
    to: `const A = <MyComponent model={{
  value: a.b,
  callback: $$v => {
    this.$set(a, "b", this._n(typeof $$v === "string" ? $$v.trim() : $$v));
  }
}} />;`,
  },
  {
    name: 'Component with $set',
    from: `const A = <MyComponent vModel={a[b]} />`,
    to: `const A = <MyComponent model={{
  value: a[b],
  callback: $$v => {
    this.$set(a, b, $$v);
  }
}} />;`,
  },
  {
    name: 'Generic select vModel',
    from: `const A = <select vModel={a.b} />`,
    to: `const A = <select on-change={$event => {
  const $$selectedVal = Array.prototype.filter.call($event.target.options, o => o.selected).map(o => "_value" in o ? o._value : o.value);
  this.$set(a, "b", $event.target.multiple ? $$selectedVal : $$selectedVal[0]);
}} {...{
  directives: [{
    name: "model",
    value: a.b,
    modifiers: {}
  }]
}} />;`,
  },
  {
    name: 'select vModel_number',
    from: `const A = <select vModel_number={a.b} />`,
    to: `const A = <select on-change={$event => {
  const $$selectedVal = Array.prototype.filter.call($event.target.options, o => o.selected).map(o => this._n("_value" in o ? o._value : o.value));
  this.$set(a, "b", $event.target.multiple ? $$selectedVal : $$selectedVal[0]);
}} {...{
  directives: [{
    name: "model",
    value: a.b,
    modifiers: {
      number: true
    }
  }]
}} />;`,
  },
  {
    name: 'Generic input[type="checkbox"] vModel',
    from: `const A = <input type="checkbox" vModel={a.b} />`,
    to: `const A = <input on-change={$event => {
  const $$a = a.b,
        $$el = $event.target,
        $$c = $$el.checked ? true : false;

  if (Array.isArray($$a)) {
    const $$v = null,
          $$i = this._i($$a, $$v);

    if ($$el.checked) {
      $$i < 0 && this.$set(a, "b", $$a.concat([$$v]));
    } else {
      $$i > -1 && this.$set(a, "b", $$a.slice(0, $$i).concat($$a.slice($$i + 1)));
    }
  } else {
    this.$set(a, "b", $$c);
  }
}} type="checkbox" domProps-checked={Array.isArray(a.b) ? this._i(a.b, null) > -1 : a.b} {...{
  directives: [{
    name: "model",
    value: a.b,
    modifiers: {}
  }]
}} />;`,
  },
  {
    name: 'input[type="checkbox"] vModel_number',
    from: `const A = <input type="checkbox" vModel_number={a.b} />`,
    to: `const A = <input on-change={$event => {
  const $$a = a.b,
        $$el = $event.target,
        $$c = $$el.checked ? true : false;

  if (Array.isArray($$a)) {
    const $$v = this._n(null),
          $$i = this._i($$a, $$v);

    if ($$el.checked) {
      $$i < 0 && this.$set(a, "b", $$a.concat([$$v]));
    } else {
      $$i > -1 && this.$set(a, "b", $$a.slice(0, $$i).concat($$a.slice($$i + 1)));
    }
  } else {
    this.$set(a, "b", $$c);
  }
}} type="checkbox" domProps-checked={Array.isArray(a.b) ? this._i(a.b, null) > -1 : a.b} {...{
  directives: [{
    name: "model",
    value: a.b,
    modifiers: {
      number: true
    }
  }]
}} />;`,
  },
  {
    name: 'input[type="checkbox"] vModel with value, trueValue and falseValue',
    from: `const A = <input type="checkbox" vModel={a.b} value="abc" trueValue={trueVal} falseValue={falseVal} />`,
    to: `const A = <input on-change={$event => {
  const $$a = a.b,
        $$el = $event.target,
        $$c = $$el.checked ? trueVal : falseVal;

  if (Array.isArray($$a)) {
    const $$v = "abc",
          $$i = this._i($$a, $$v);

    if ($$el.checked) {
      $$i < 0 && this.$set(a, "b", $$a.concat([$$v]));
    } else {
      $$i > -1 && this.$set(a, "b", $$a.slice(0, $$i).concat($$a.slice($$i + 1)));
    }
  } else {
    this.$set(a, "b", $$c);
  }
}} type="checkbox" domProps-checked={Array.isArray(a.b) ? this._i(a.b, "abc") > -1 : this._q(a.b, trueVal)} {...{
  directives: [{
    name: "model",
    value: a.b,
    modifiers: {}
  }]
}} />;`,
  },
  {
    name: 'Generic input[type="radio"] vModel',
    from: `const A = <input type="radio" vModel={a.b} />`,
    to: `const A = <input on-change={$event => {
  this.$set(a, "b", null);
}} type="radio" domProps-checked={this._q(a.b, null)} {...{
  directives: [{
    name: "model",
    value: a.b,
    modifiers: {}
  }]
}} />;`,
  },
  {
    name: 'input[type="radio"] vModel_number',
    from: `const A = <input type="radio" vModel_number={a.b} value="10" />`,
    to: `const A = <input on-change={$event => {
  this.$set(a, "b", this._n("10"));
}} type="radio" domProps-checked={this._q(a.b, this._n("10"))} {...{
  directives: [{
    name: "model",
    value: a.b,
    modifiers: {
      number: true
    }
  }]
}} />;`,
  },
  {
    name: 'Generic input[type="text"] vModel',
    from: `const A = <input type="text" vModel={a.b} />`,
    to: `const A = <input on-input={$event => {
  if ($event.target.composing) return;
  this.$set(a, "b", $event.target.value);
}} type="text" domProps-value={a.b} {...{
  directives: [{
    name: "model",
    value: a.b,
    modifiers: {}
  }]
}} />;`,
  },
  {
    name: 'Generic textarea vModel',
    from: `const A = <textarea vModel={a.b} />`,
    to: `const A = <textarea on-input={$event => {
  if ($event.target.composing) return;
  this.$set(a, "b", $event.target.value);
}} domProps-value={a.b} {...{
  directives: [{
    name: "model",
    value: a.b,
    modifiers: {}
  }]
}} />;`,
  },
  {
    name: 'input[type="text"] vModel_lazy_trim_number',
    from: `const A = <input type="text" vModel_lazy_trim_number={a.b} />`,
    to: `const A = <input on-blur={$event => {
  this.$forceUpdate();
}} on-change={$event => {
  this.$set(a, "b", this._n($event.target.value.trim()));
}} type="text" domProps-value={a.b} {...{
  directives: [{
    name: "model",
    value: a.b,
    modifiers: {
      lazy: true,
      trim: true,
      number: true
    }
  }]
}} />;`,
  },
  {
    name: 'input[type="range"] vModel',
    from: `const A = <input type="range" vModel={a.b} />`,
    to: `const A = <input on-__r={$event => {
  this.$set(a, "b", $event.target.value);
}} type="range" domProps-value={a.b} {...{
  directives: [{
    name: "model",
    value: a.b,
    modifiers: {}
  }]
}} />;`,
  },
  {
    name: 'event listener added before other listeners',
    from: `const A = <input onInput={this.someMethod} vModel={this.model} />`,
    to: `const A = <input on-input={$event => {
  if ($event.target.composing) return;
  this.model = $event.target.value;
}} onInput={this.someMethod} domProps-value={this.model} {...{
  directives: [{
    name: "model",
    value: this.model,
    modifiers: {}
  }]
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

test('div[vModel] throws an error', t =>
  new Promise(resolve => {
    transpile(`render(h => <div vModel={test} />)`)
      .then(() => {
        t.fail()
        resolve()
      })
      .catch(e => {
        t.true(e.message.includes('vModel: div[type=] is not supported'))
        resolve()
      })
  }))

test('static vModel throws an error', t =>
  new Promise(resolve => {
    transpile(`render(h => <div vModel="test" />)`)
      .then(() => {
        t.fail()
        resolve()
      })
      .catch(e => {
        t.true(e.message.includes( 'You have to use JSX Expression inside your v-model'))
        resolve()
      })
  }))
