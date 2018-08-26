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
    name: 'Basic v-on:click',
    from: `render(h => <div v-on:click={foo}>test</div>)`,
    to: `render(h => <div on-click={foo}>test</div>);`,
  },
  {
    name: 'Native v-on:click',
    from: `render(h => <div v-on:click_native={foo}>test</div>)`,
    to: `render(h => <div nativeOn-click={foo}>test</div>);`,
  },
  {
    name: 'v-on:click with arrow function expression',
    from: `render(h => <div v-on:click={myEvent => foo(1, 2, 3, $myEvent)}>test</div>)`,
    to: `render(h => <div on-click={myEvent => foo(1, 2, 3, $myEvent)}>test</div>);`,
  },
  {
    name: 'v-on:click_prevent',
    from: `render(h => <div v-on:click_prevent={foo}>test</div>)`,
    to: `render(h => <div on-click={$event => {
  $event.preventDefault();
  return foo($event);
}}>test</div>);`,
  },
  {
    name: 'v-on:click_stop',
    from: `render(h => <div v-on:click_stop={foo}>test</div>)`,
    to: `render(h => <div on-click={$event => {
  $event.stopPropagation();
  return foo($event);
}}>test</div>);`,
  },
  {
    name: 'v-on:click_capture',
    from: `render(h => <div v-on:click_capture={foo}>test</div>)`,
    to: `render(h => <div {...{
  on: {
    "!click": foo
  }
}}>test</div>);`,
  },
  {
    name: 'v-on:click_once',
    from: `render(h => <div v-on:click_once={foo}>test</div>)`,
    to: `render(h => <div {...{
  on: {
    "~click": foo
  }
}}>test</div>);`,
  },
  {
    name: 'v-on:click_capture_once',
    from: `render(h => <div v-on:click_capture_once={foo}>test</div>)`,
    to: `render(h => <div {...{
  on: {
    "~!click": foo
  }
}}>test</div>);`,
  },
  {
    name: 'v-on:click_once and other modifier',
    from: `render(h => <div v-on:click_once_self={foo}>test</div>)`,
    to: `render(h => <div {...{
  on: {
    "~click": $event => {
      if ($event.target !== $event.currentTarget) return null;
      return foo($event);
    }
  }
}}>test</div>);`,
  },
  {
    name: 'keyCode',
    from: `render(h => <input v-on:keyup_enter={foo} />)`,
    to: `render(h => <input on-keyup={$event => {
  if (!("button" in $event) && this._k($event.keyCode, "enter", 13, $event.key, "Enter")) return null;
  return foo($event);
}} />);`,
  },
  {
    name: 'automatic key name inference',
    from: `render(h => <input v-on:keyup_arrow-right={foo} />)`,
    to: `render(h => <input on-keyup={$event => {
  if (!("button" in $event) && this._k($event.keyCode, "arrow-right", undefined, $event.key, undefined)) return null;
  return foo($event);
}} />);`,
  },
  {
    name: 'system modifers',
    from: `render(h => <div>
  <input ref="ctrl" v-on:keyup_ctrl={foo} />
  <input ref="shift" v-on:keyup_shift={foo} />
  <input ref="alt" v-on:keyup_alt={foo} />
  <input ref="meta" v-on:keyup_meta={foo} />
</div>)`,
    to: `render(h => <div>
  <input ref="ctrl" on-keyup={$event => {
    if (!$event.ctrlKey) return null;
    return foo($event);
  }} />
  <input ref="shift" on-keyup={$event => {
    if (!$event.shiftKey) return null;
    return foo($event);
  }} />
  <input ref="alt" on-keyup={$event => {
    if (!$event.altKey) return null;
    return foo($event);
  }} />
  <input ref="meta" on-keyup={$event => {
    if (!$event.metaKey) return null;
    return foo($event);
  }} />
</div>);`,
  },
  {
    name: 'exact modifier',
    from: `render(h => <input v-on:keyup_exact={foo} />)`,
    to: `render(h => <input on-keyup={$event => {
  if ($event.ctrlKey || $event.shiftKey || $event.altKey || $event.metaKey) return null;
  return foo($event);
}} />);`,
  },
  {
    name: 'system + exact modifier',
    from: `render(h => <input v-on:keyup_ctrl_exact={foo} />)`,
    to: `render(h => <input on-keyup={$event => {
  if (!$event.ctrlKey) return null;
  if ($event.shiftKey || $event.altKey || $event.metaKey) return null;
  return foo($event);
}} />);`,
  },
  {
    name: 'number keyCode',
    from: `render(h => <input v-on:keyup_13={foo} />)`,
    to: `render(h => <input on-keyup={$event => {
  if (!("button" in $event) && $event.keyCode !== 13) return null;
  return foo($event);
}} />);`,
  },
  {
    name: 'mouse modifier',
    from: `render(h => <div>
  <div ref="left" v-on:mousedown_left={foo}>left</div>
  <div ref="right" v-on:mousedown_right={foo1}>right</div>
  <div ref="middle" v-on:mousedown_middle={foo2}>right</div>
</div>)`,
    to: `render(h => <div>
  <div ref="left" on-mousedown={$event => {
    if (!("button" in $event) && this._k($event.keyCode, "left", 37, $event.key, ["Left", "ArrowLeft"])) return null;
    if ("button" in $event && $event.button !== 0) return null;
    return foo($event);
  }}>left</div>
  <div ref="right" on-mousedown={$event => {
    if (!("button" in $event) && this._k($event.keyCode, "right", 39, $event.key, ["Right", "ArrowRight"])) return null;
    if ("button" in $event && $event.button !== 2) return null;
    return foo1($event);
  }}>right</div>
  <div ref="middle" on-mousedown={$event => {
    if ("button" in $event && $event.button !== 1) return null;
    return foo2($event);
  }}>right</div>
</div>);`,
  },
  {
    name: 'KeyboardEvent.key for built in aliases',
    from: `render(h => <div>
  <input ref="enter" v-on:keyup_enter={foo} />
  <input ref="space" v-on:keyup_space={foo} />
  <input ref="esc" v-on:keyup_esc={foo} />
  <input ref="left" v-on:keyup_left={foo} />
  <input ref="delete" v-on:keyup_delete={foo} />
</div>)`,
    to: `render(h => <div>
  <input ref="enter" on-keyup={$event => {
    if (!("button" in $event) && this._k($event.keyCode, "enter", 13, $event.key, "Enter")) return null;
    return foo($event);
  }} />
  <input ref="space" on-keyup={$event => {
    if (!("button" in $event) && this._k($event.keyCode, "space", 32, $event.key, " ")) return null;
    return foo($event);
  }} />
  <input ref="esc" on-keyup={$event => {
    if (!("button" in $event) && this._k($event.keyCode, "esc", 27, $event.key, ["Esc", "Escape"])) return null;
    return foo($event);
  }} />
  <input ref="left" on-keyup={$event => {
    if (!("button" in $event) && this._k($event.keyCode, "left", 37, $event.key, ["Left", "ArrowLeft"])) return null;
    if ("button" in $event && $event.button !== 0) return null;
    return foo($event);
  }} />
  <input ref="delete" on-keyup={$event => {
    if (!("button" in $event) && this._k($event.keyCode, "delete", [8, 46], $event.key, ["Backspace", "Delete"])) return null;
    return foo($event);
  }} />
</div>);`,
  },
]

tests.forEach(({ name, from, to }) => test(name, async t => t.is(await transpile(from), to)))

// test('JSXElement attribute value throws error', t =>
//   new Promise(resolve => {
//     transpile(`render(h => <a key=<b/> />)`)
//       .then(() => {
//         t.fail()
//         resolve()
//       })
//       .catch(e => {
//         t.is(e.message, 'getAttributes (attribute value): JSXElement is not supported')
//         resolve()
//       })
//   }))
