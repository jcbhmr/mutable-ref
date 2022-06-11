# `MutableRef`
A `.value` setter that emits `"change"` events
```ts
const state = new MutableRef("Hello world!")
console.debug(`Before change:`, state.value)
state.onchange = (event) => void(console.debug(`Change!`, event.target.value))
state.value += " I am a teapot!"
console.debug(`After change:`, state.value)

/**
 * Console output:
 * Before change: Hello world!
 * Change! Hello world! I am a teapot!
 * After change: Hello world! I am a teapot!
 */
```

Figure 1: Primitives are passed by value
```ts
let string = "Hello!"
mutate(string)
string // Hello!

function mutate(string) {
    // This doesn't change the original string, it just reassigns the mutable
    // variable reference which points to an immutable string
    string = string.toLocaleUpperCase()
}
```

Figure 2: Use a generic wrapper object
```ts
const mutable = new MutableRef(45)
mutable.value // 45
mutate(mutable)
mutable.value // 55

function mutate(mutable: ValueContainer<number>) {
    // This way we don't have to reassign the variable (like with primitives),
    // just a property on the object that both this function and the outer
    // scope share access to! We achieve reference passing by using a wrapper
    // object instead of a primitive value.
    mutable.value += 10
}
```

Figure 3: Combine many input changes into one value of truth, then watch that value from many places
```ts
// JSX-like component using htm and jsx-dom
// htm: https://github.com/developit/htm
// jsx-dom: https://github.com/proteriax/jsx-dom
function Form() {
    const state = new MutableRef(0)
    const increment = () => void(state.value += 1)
    return html`<div>
        <button onClick=${increment}>Button #1</button>
        <button onClick=${increment}>Another button!</button>
        <button onClick=${increment}>Press me!</button>
        <button onClick=${increment}>Counter +1</button>
        <div>First reflection: <${ReflectedOutput} state=${state} /></div>
        <div>Another reflection: <${ReflectedOutput} state=${state} /></div>
        <div>Wow more!: <${ReflectedOutput} state=${state} /></div>
        <div>Even another one: <${ReflectedOutput} state=${state} /></div>
    </>`
}

/** Listens for onchange on state and updates the output.value accordingly */
function ReflectedOutput({ state, ...rest }) {
    const output = html`<output ...${rest} />`
    state.pipeTo(output)
    return output
}
```

[mdn:weakref]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef

## How It Works

It's a wrapper object with a `.value` property setter. That's it.

Code excerpt from [`-.ts`](./-.ts)
```ts
class {
    #value: T = null
    get value() {
        return this.#value
    }
    set value(newValue: T) {
        const oldValue = this.#value
        this.#value = newValue

        const event = new Event("change", { target: this })
        this.dispatchEvent(event)
    }
}
```
