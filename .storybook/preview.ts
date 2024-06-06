import type { Preview } from "@storybook/web-components"
import DOMPurify from "dompurify"

import "../src/components/index.js"

const config: DOMPurify.Config = {
  CUSTOM_ELEMENT_HANDLING: {
    tagNameCheck: /^sp-/,
  },
}
const preview: Preview = {
  render: (args, context) => {
    const r = new (customElements.get(context.component!)!)()
    for (const [key, value] of Object.entries(args)) {
      if (key === "children")
        r.innerHTML = DOMPurify.sanitize(value, config) as string
      else
        r.setAttribute(key, DOMPurify.sanitize(value, config) as string)
    }
    return r
  },
}

export default preview
