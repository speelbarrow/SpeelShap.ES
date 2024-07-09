import { CustomElement, register, withShadow } from "../../util/CustomElements.js"

/** This component handles displaying one view, or, "Page", at a time from a collection.
 * @see Page
 */
export default class Book extends withShadow(CustomElement) {
  #current = document.createElement("slot")
  #page: [Page, number] | null = null
  #updated: boolean = true
  #wraparound: boolean = false

  constructor() {
    super()

    this.#current.name = "current"

    const slot = document.createElement("slot")
    slot.style.display = "none"

    this.shadow.append(this.#current, slot)

    const m = new MutationObserver((records) => {
      if (this.#updated)
        return
      for (const record of records)
        if (record.type === "childList") {
          this.#updated = true
          return
        }
    })
    m.observe(this, { childList: true })
  }


  #memoPages?: Page[]
  async #pages() {
    if (!this.#memoPages || this.#updated) {
      this.#memoPages = Array.from(this.children).filter(e => e instanceof Page) as Page[]
      this.#updated = false
    }
    return this.#memoPages
  }
  async #unsetPage(page?: Page) {
    if (page)
      page.slot = ""
  }


  async #switch(pages: Page[], index: number, old: Page | undefined = this.#page?.[0]) {
    this.#unsetPage(old)

    pages[index].slot = "current"
    this.#page = [pages[index], index]
  }

  async switchByIndex(index: number, pages?: Page[]) {
    pages = pages ?? await this.#pages()
    if (isNaN(index) || index < 0 || index >= pages.length)
      throw new Error("index out of bounds")

    await this.#switch(pages, index)
  }

  async switchById(id: string) {
    const pages = await this.#pages()
    const index = pages.findIndex(page => page.id === id)
    if (index === -1)
      throw new Error(`no page with id '${id}'`)

    await this.switchByIndex(index, pages)
  }


  async previous() {
    if (this.#page === null)
      throw new Error("no page set")
    else if (this.#page[1] === 0)
      if (this.#wraparound) {
        this.switchByIndex((await this.#pages()).length - 1)
      } else
        console.warn("cannot navigate past the first page")
    else
      this.switchByIndex(this.#page[1] - 1)
  }

  async next() {
    if (this.#page === null)
      throw new Error("no page set")
    else if (this.#page[1] === (await this.#pages()).length - 1)
      if (this.#wraparound)
        this.switchByIndex(0)
      else
        console.warn("cannot navigate past the last page")
    else
      this.switchByIndex(this.#page[1] + 1)
  }


  async attribute_page(_: string | null, page: string | null) {
    if (page) {
      this.switchByIndex(parseInt(page)).catch((e: Error) => {
        if (e.message !== "index out of bounds")
          throw e
        else
          this.switchById(page)
      })
    } else
      this.#unsetPage(this.#page?.[0])
  }

  async attribute_wraparound(_: string | null, wraparound: string | null) {
    this.#wraparound = wraparound !== null
  }
}

/** This class simply serves as a container for content. It does not have any special functionality on its own.
 * @see Book
 */
export class Page extends CustomElement { }

for (const C of [Book, Page])
  register(C)
