var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
import { Mutex } from "async-mutex";
export class CustomElement extends HTMLElement {
    constructor(style = {}) {
        super();
        this.mutexes = {};
        for (const attr of this.constructor.observedAttributes)
            this.mutexes[attr] = new Mutex();
        for (const [key, value] of Object.entries(style))
            this.style.setProperty(key, value);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        return __awaiter(this, void 0, void 0, function* () {
            if ("attribute_" + name in this) {
                // @ts-expect-error - This is a hack to call the method dynamically
                yield this.mutexes[name].runExclusive(() => __awaiter(this, void 0, void 0, function* () { return this["attribute_" + name](oldValue, newValue); }));
            }
        });
    }
    static get observedAttributes() {
        return Object.getOwnPropertyNames(this.prototype).filter(prop => prop.startsWith("attribute_")).map(prop => prop.slice(10));
    }
}
export function withShadow(C) {
    var _shadow, _a;
    return _a = class extends C {
            set shadow(arg) { __classPrivateFieldSet(this, _shadow, arg, "f"); }
            get shadow() { return __classPrivateFieldGet(this, _shadow, "f"); }
            constructor(style = {}) {
                super(style);
                _shadow.set(this, void 0);
                __classPrivateFieldSet(this, _shadow, this.attachShadow({ mode: "open" }), "f");
            }
        },
        _shadow = new WeakMap(),
        _a;
}
export function withInternals(C) {
    var _internals, _a;
    return _a = class extends C {
            set internals(arg) { __classPrivateFieldSet(this, _internals, arg, "f"); }
            get internals() { return __classPrivateFieldGet(this, _internals, "f"); }
            constructor(style = {}) {
                super(style);
                _internals.set(this, void 0);
                __classPrivateFieldSet(this, _internals, this.attachInternals(), "f");
            }
        },
        _internals = new WeakMap(),
        _a;
}
export function formAssociated(C) {
    var _a;
    return _a = class extends withInternals(C) {
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
        },
        _a.formAssociated = true,
        _a;
}
export function generateId(prefix) {
    let r;
    do {
        r = prefix ? `${prefix}-` : "" + Math.random().toString(36).slice(2);
    } while (document.getElementById(r));
    return r;
}
