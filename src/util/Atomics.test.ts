import { test, expect } from "bun:test"
import { MutexArray } from "./Atomics.js"
import { print_and_flush, shuffle } from "./Test.js"

async function single(callbacks: number, mutex = new MutexArray(), mutexIndex: number = 0) {
  const times = new Int32Array(new SharedArrayBuffer(callbacks * 4))
  const promises: Promise<void>[] = []
  for (const index of await shuffle([...Array(callbacks).keys()])) {
    promises.push((async () => {
      await print_and_flush(`starting ${mutexIndex}.${index}\n`)
      const lock = await mutex.acquire(mutexIndex)
      await print_and_flush(`acquired ${mutexIndex}.${index}\n`)

      let counter = 0
      for (const newIndex of [...Array(callbacks).keys()]) {
        if (Atomics.compareExchange(times, newIndex, 0, Date.now()) === 0) {
          await print_and_flush(`${mutexIndex}.${index} -> ${newIndex}\n`)
          break
        }
        ++counter
      }
      if (counter === callbacks)
        console.warn(`failed to set time (${mutexIndex}.${index})`)

      await print_and_flush(`releasing ${mutexIndex}.${index}\n`)
      await mutex.release(lock)
      await print_and_flush(`released ${mutexIndex}.${index}\n`)
    })())
  }

  await Promise.all(await shuffle(promises))
  for (const index of [...Array(callbacks - 1).keys()])
    expect(Atomics.load(times, index)).toBeLessThanOrEqual(Atomics.load(times, index + 1))
  expect(Atomics.load(times, 0)).toBeLessThan(Atomics.load(times, callbacks - 1))
}

test("MutexArray with single entry", async () => await single(20))
test("MutexArray with multiple entries", async () => {
  const mutex = new MutexArray(20)
  const promises: Promise<void>[] = []
  for (const index of [...Array(10).keys()])
    promises.push(single(10, mutex, index))
  await Promise.all(promises)
})
