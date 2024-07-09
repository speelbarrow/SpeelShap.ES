import { Mutex } from "async-mutex"

interface HasLifecycle {
  connectedCallback?(): void
  disconnectedCallback?(): void
  adoptedCallback?(): void
  attributeChangedCallback?(name: string, oldValue: string, newValue: string): void
}
export class CustomElement extends HTMLElement implements HasLifecycle {
  connectedCallback?(): void
  disconnectedCallback?(): void
  adoptedCallback?(): void

  protected mutexes: { [key: string]: Mutex } = {}
  constructor(style: { [key: string]: any } = {}) {
    super()
    for (const attr of (this.constructor as CustomElementConstructor).observedAttributes)
      this.mutexes[attr] = new Mutex()
    for (const [key, value] of Object.entries(style))
      this.style.setProperty(key, value)
  }
  async attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if ("attribute_" + name in this) {
      // @ts-expect-error - This is a hack to call the method dynamically
      await this.mutexes[name].runExclusive(async () => this["attribute_" + name](oldValue, newValue))
    }
  }

  static get observedAttributes(): string[] {
    return Object.getOwnPropertyNames(this.prototype).filter(prop => prop.startsWith("attribute_")).map(prop => prop.slice(10))
  }

  [key: `attribute_${string}`]: (oldValue: string, newValue: string) => void
}

interface HasShadow extends HasLifecycle {
  readonly shadow: ShadowRoot
}
interface HasInternals extends HasLifecycle {
  readonly internals: ElementInternals
}
interface FormAssociated extends HasInternals {
  formAssociatedCallback?(form: HTMLFormElement): void
  formDisabledCallback?(disabled: boolean): void
  formResetCallback?(): void
  formStateRestoreCallback?(state: string, mode: string): void

  value: string
  readonly form: HTMLFormElement | null
  readonly name: string | null
  readonly type: string

  readonly validity?: ValidityState
  readonly validationMessage?: string
  readonly willValidate?: boolean
  checkValidity?(): boolean
  reportValidity?(): boolean
}
export interface CustomElementConstructor<T = CustomElement> {
  new(...params: any[]): CustomElement & T
  get observedAttributes(): string[]
}
export interface ShadowConstructor extends CustomElementConstructor<HasShadow> { }
export interface InternalsConstructor extends CustomElementConstructor<HasInternals> { }
export interface FormAssociatedConstructor extends CustomElementConstructor<HasInternals & FormAssociated> {
  formAssociated: true
}

export function withShadow<T extends CustomElementConstructor>(C: T extends ShadowConstructor ? never : T):
  ShadowConstructor & T {
  return class extends (C as CustomElementConstructor & T) implements HasShadow {
    #shadow: ShadowRoot
    private set shadow(arg) { this.#shadow = arg }
    get shadow() { return this.#shadow }

    constructor(style: { [key: string]: any } = {}) {
      super(style)
      this.#shadow = this.attachShadow({ mode: "open" })
    }
  }
}

export function withInternals<T extends CustomElementConstructor>(C: T extends InternalsConstructor ? never : T):
  InternalsConstructor & T {
  return class extends (C as CustomElementConstructor & T) implements HasInternals {
    #internals: ElementInternals
    private set internals(arg) { this.#internals = arg }
    get internals() { return this.#internals }

    constructor(style: { [key: string]: any } = {}) {
      super(style)
      this.#internals = this.attachInternals()
    }
  }
}

export function formAssociated<T extends CustomElementConstructor>(C: T extends InternalsConstructor ? never : T):
  FormAssociatedConstructor & T {
  return class extends (withInternals(C) as InternalsConstructor & T) {
    static formAssociated = true as const

    set value(value: string) {
      this.internals.setFormValue(value)
    }

    get form() {
      return this.internals.form
    }
    get name() {
      return this.getAttribute("name")
    }
    get type() {
      return this.localName
    }
  } as FormAssociatedConstructor & T
}

export function generateId(prefix?: string): string {
  let r: string
  do {
    r = prefix ? `${prefix}-` : "" + Math.random().toString(36).slice(2)
  } while (document.getElementById(r))
  return r
}
