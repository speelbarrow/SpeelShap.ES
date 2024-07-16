export declare class MutexArray extends Int32Array {
    #private;
    constructor(length?: number);
    acquire(index?: number): Promise<symbol>;
    release(s: symbol): Promise<void>;
}
