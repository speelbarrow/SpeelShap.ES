import { MutexArray } from "./Atomics.js";
export class CustomElement extends HTMLElement {
    mutexes = new MutexArray(this.constructor.observedAttributes.length);
    constructor(style = {}) {
        super();
        for (const [key, value] of Object.entries(style))
            this.style.setProperty(key, value);
    }
    async attributeChangedCallback(name, oldValue, newValue) {
        if ("attribute_" + name in this) {
            const lock = await this.mutexes.acquire(this.constructor.observedAttributes.indexOf(name));
            // @ts-expect-error dynamic property access
            await this["attribute_" + name](oldValue, newValue);
            await this.mutexes.release(lock);
        }
    }
    static get observedAttributes() {
        return Object.getOwnPropertyNames(this.prototype).filter(prop => prop.startsWith("attribute_")).map(prop => prop.slice(10));
    }
}
export function withShadow(C) {
    return class extends C {
        #shadow;
        set shadow(arg) { this.#shadow = arg; }
        get shadow() { return this.#shadow; }
        constructor(style = {}) {
            super(style);
            this.#shadow = this.attachShadow({ mode: "open" });
        }
    };
}
export function withInternals(C) {
    return class extends C {
        #internals;
        set internals(arg) { this.#internals = arg; }
        get internals() { return this.#internals; }
        constructor(style = {}) {
            super(style);
            this.#internals = this.attachInternals();
        }
    };
}
export function formAssociated(C) {
    return class extends withInternals(C) {
        static formAssociated = true;
        set value(value) {
            this.internals.setFormValue(value);
        }
        get form() {
            return this.internals.form;
        }
        get name() {
            return this.getAttribute("name");
        }
        get type() {
            return this.localName;
        }
    };
}
export function register(C) {
    customElements.define("sp-" + C.name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(), C);
}
