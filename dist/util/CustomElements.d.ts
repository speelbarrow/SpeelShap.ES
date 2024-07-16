import { MutexArray } from "./Atomics.js";
interface HasLifecycle {
    connectedCallback?(): void;
    disconnectedCallback?(): void;
    adoptedCallback?(): void;
    attributeChangedCallback?(name: string, oldValue: string, newValue: string): void;
}
export declare class CustomElement extends HTMLElement implements HasLifecycle {
    protected mutexes: MutexArray;
    constructor(style?: {
        [key: string]: any;
    });
    attributeChangedCallback(name: string, oldValue: string, newValue: string): Promise<void>;
    static get observedAttributes(): string[];
    [key: `attribute_${string}`]: (oldValue: string, newValue: string) => void;
}
interface HasShadow extends HasLifecycle {
    readonly shadow: ShadowRoot;
}
interface HasInternals extends HasLifecycle {
    readonly internals: ElementInternals;
}
interface FormAssociated extends HasInternals {
    formAssociatedCallback?(form: HTMLFormElement): void;
    formDisabledCallback?(disabled: boolean): void;
    formResetCallback?(): void;
    formStateRestoreCallback?(state: string, mode: string): void;
    value: string;
    readonly form: HTMLFormElement | null;
    readonly name: string | null;
    readonly type: string;
    readonly validity?: ValidityState;
    readonly validationMessage?: string;
    readonly willValidate?: boolean;
    checkValidity?(): boolean;
    reportValidity?(): boolean;
}
export interface CustomElementConstructor<T = CustomElement> {
    new (...params: any[]): CustomElement & T;
    get observedAttributes(): string[];
}
export interface ShadowConstructor extends CustomElementConstructor<HasShadow> {
}
export interface InternalsConstructor extends CustomElementConstructor<HasInternals> {
}
export interface FormAssociatedConstructor extends CustomElementConstructor<HasInternals & FormAssociated> {
    formAssociated: true;
}
export declare function withShadow<T extends CustomElementConstructor>(C: T extends ShadowConstructor ? never : T): ShadowConstructor & T;
export declare function withInternals<T extends CustomElementConstructor>(C: T extends InternalsConstructor ? never : T): InternalsConstructor & T;
export declare function formAssociated<T extends CustomElementConstructor>(C: T extends InternalsConstructor ? never : T): FormAssociatedConstructor & T;
export declare function register(C: CustomElementConstructor): void;
export {};
