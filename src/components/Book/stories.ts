import type { Meta, StoryObj } from "@storybook/web-components"
import type Book from "./index.js"
import { expect as _expect, waitFor, within, userEvent, getDefaultNormalizer } from "@storybook/test"
import { html } from "lit"

async function toHaveCurrent(book: Book, current: string) {
  const elements = book.querySelectorAll("sp-page[slot='current']")
  if (elements.length === 0)
    return {
      message: () => "failed to find any current page",
      pass: false,
    }
  else {
    const r = {
      message: elements.length > 1 ? () => "found multiple current pages" : () => "",
      pass: false,
    }
    for (const element of Array.from(elements)) {
      if (element.id === current)
        r.pass = true
    }
    return r
  }
}

const expect = _expect as unknown as {
  <T = unknown>(actual: T): {
    toHaveCurrent: (current: string) => Promise<void>
  } & ReturnType<typeof _expect>;
} & typeof _expect
expect.extend({ toHaveCurrent })


export default {
  title: "Components/Book",
  component: "sp-book",
  argTypes: {
    page: {
      control: "inline-radio",
      options: ["foo", "bar", "baz"],
    },
    wraparound: {
      control: "boolean",
      table: {
        disable: true,
      },
    },
    children: {
      table: {
        readonly: true,
      },
    },
  },
  args: {
    page: "",
    wraparound: false,
    children: `<sp-page id="foo"> 
  <span>Foo</span>
</sp-page>
<sp-page id="bar">
  <span>Bar</span>
</sp-page>
<sp-page id="baz">
  <span>Baz</span>
</sp-page>`,
  },
} as Meta

export const Index: StoryObj = {
  args: {
    page: "0",
  },
  argTypes: {
    page: {
      options: ["0", "1", "2"],
    },
  },
}

export const ID: StoryObj = {
  args: {
    page: "foo",
  },
}


export const Navigation: StoryObj = {
  args: {
    page: "foo",
  },
  argTypes: {
    wraparound: {
      table: {
        disable: false,
      },
    },
    page: {
      table: {
        disable: true,
      },
    },
  },
  decorators: [
    (story) => {
      const [book, previous, next] = [
        story() as Book,
        document.createElement("button"),
        document.createElement("button"),
      ]

      previous.textContent = "Previous"
      previous.onclick = book.previous.bind(book)
      next.textContent = "Next"
      next.onclick = book.next.bind(book)

      return html`${book}<br>${previous}${next}`
    },
  ],
  async play({ argTypes, args, canvasElement, step }) {
    const canvas = within(canvasElement)
    const list = argTypes.page.options as string[]

    const book = canvas.getByTestId("sp-book") as Book
    book.removeAttribute("wraparound")

    async function click(getByText: string) {
      await userEvent.click(canvas.getByText(getByText, {
        normalizer: (text) => getDefaultNormalizer()(text).toLowerCase(),
      }))
    }

    for (const direction of ["next", "previous"]) {
      await step(`Cycle through pages using "${direction}" method`, async () => {
        await step(`Set initial "page" value to "${list[0]}"`, async () => {
          book.setAttribute("page", list[0])
          await waitFor(async () => await expect(book).toHaveCurrent(list[0]))
        })
        for (const page of list.slice(1))
          await step(`Navigate to ${direction} page, ${page}`, async () => {
            await click(direction)
            await waitFor(async () => await expect(book).toHaveCurrent(page))
          })
      })
      list.reverse()
    }
    await step("Try to navigate to the last page using the `previous` method (expected to fail because wraparound is " +
      "not yet enabled)", async () => {
        await expect(book).toHaveCurrent(list[0])
      })
    await step("Enable wraparound", async () => book.setAttribute("wraparound", ""))
    await step("Navigate to the last page using the `previous` method", async () => {
      await book.previous()
      await waitFor(async () => await expect(book).toHaveCurrent(list[list.length - 1]))
    })
    await step("Navigate to the first page using the `next` method", async () => {
      await book.next()
      await waitFor(async () => await expect(book).toHaveCurrent(list[0]))
    })

    if (!args.wraparound) {
      book.removeAttribute("wraparound")
    }
  },
}
