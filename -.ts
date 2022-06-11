export { MutableRef as default }

interface ValueContainer<T> {
	value: T
}

// TODO: Add a better TypeScript interface for EventTarget so that it has specific types
// of events. I want the IntelliSense on MutableRef::addEventListener() to be better!
class MutableRef<T> extends EventTarget implements ValueContainer<T> {
	static transform<T, U>(transformer: (value: T) => U) {
		const writable = new MutableRef<T>()
		const readable = new MutableRef<U>()
		writable.addEventListener("change", (event) => void (readable.value = event.target.value))
		// Same names as TransformStream, different object types
		return { writable, readable }
	}

	#onchange = null
	#value: T = null
	constructor(initial = null) {
		this.value = null
	}

	// Symmetry with WeakRef::deref()
	deref() {
		return this.value
	}
	get value() {
		return this.#value
	}
	set value(newValue: T) {
		const oldValue = this.#value
		this.#value = newValue

		const event = new CustomEvent("change", { target: this })
		this.dispatchEvent(event)
	}

	listenTo(source: EventTarget) {
        // TODO: Use a FinalizationRegistry + WeakRef or something so that this MutableRef can
        // be garbage collected, and this event listener can be removed
		source.addEventListener("change", (event) => void (this.value = event.target.value))
	}
	pipeTo(target: ValueContainer<T>) {
        // See listenTo about garbage collection
		this.addEventListener("change", (event) => void (target.value = event.target.value))
	}

	// TODO: Unsure if this .onchange behaviour follows the HTML spec...
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
}
