export class MutexArray extends Int32Array {
  #symbols: (symbol | null)[]
  constructor(length: number = 1) {
    super(new SharedArrayBuffer(length * 4))
    this.#symbols = new Array(length).fill(null)
  }

  async acquire(index: number = 0): Promise<symbol> { 
    const r = Symbol(index)

    const result = Atomics.waitAsync(this, index, 1)
    if (result.async)
      await result.value

    if (Atomics.compareExchange(this, index, 0, 1) !== 0)
      return this.acquire(index)
    else if (this.#symbols[index] !== null)
      throw new Error("tried to lock a mutex that is currently locked")
    else {
      this.#symbols[index] = r
      return r
    }
  }

  async release(s: symbol) {
    const index = parseInt(s.description ?? "")
    if (this.#symbols[index] === null)
      throw new Error(`no symbol (${index})`)
    else if (this.#symbols[index] !== s)
      throw new Error(`symbol does not match (${index})`)
    else {
      this.#symbols[index] = null
      if (Atomics.compareExchange(this, index, 1, 0) !== 1)
        throw new Error(`mutex is not locked (${index})`)
      Atomics.notify(this, index, 1)
    }
  }
}
