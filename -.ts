export { MutableRef as default }
export type { ValueContainer }

// TODO: Add a better TypeScript interface for EventTarget so that it has specific types
// of events. I want the IntelliSense on MutableRef::addEventListener() to be better!
class MutableRef<T> extends EventTarget implements ValueContainer<T> {
	#value: T = null
	get value() {
		return this.#value
	}
	set value(newValue: T) {
		const oldValue = this.#value
		this.#value = newValue

		// Don't know how to type the .target property on Event yet. This just
		// suppresses the error for now.
		// @ts-expect-error
		const event = new Event("change", { target: this })
		this.dispatchEvent(event)
	}

	static transform<T, U>(transformer: (value: T) => U) {
		const writable = new MutableRef<T>()
		const readable = new MutableRef<U>()
		writable.addEventListener("change", (event) => {
			const oldValue = (event.target as typeof writable).value
			const newValue = transformer(oldValue)
			readable.value = newValue
		})
		// Same names as TransformStream for familiarity
		return { writable, readable }
	}

	// TODO: Unsure if this .onchange behaviour follows the HTML spec...
	#onchange: EventListener = null
	get onchange() {
		return this.#onchange
	}
	set onchange(newOnchange) {
		// MUST be a function or null
		if (!(typeof newOnchange === "function" || newOnchange === null)) {
			return
		}

		// Handle the 2x2 matrix of possibilities
		if (newOnchange === null && this.#onchange === null) {
			// Nothing to do
		} else if (newOnchange === null && typeof this.#onchange === "function") {
			// Remove it
			this.removeEventListener("change", this.#onchange)
		} else if (typeof newOnchange === "function" && typeof this.#onchange === "function") {
			// Remove then add new one
			// TODO: Check spec and run tests on Chrome to see what it does
			this.removeEventListener("change", this.#onchange)
			this.addEventListener("change", newOnchange)
		} else if (typeof newOnchange === "function" && this.#onchange === null) {
			// Add it
			this.addEventListener("change", newOnchange)
		}

		// Perform default mutation
		this.#onchange = newOnchange
	}

	constructor(initial = null) {
		super()

		this.value = initial
	}

	// Symmetry with WeakRef#deref()
	deref() {
		return this.value
	}
}

interface ValueContainer<T> {
	value: T
}
