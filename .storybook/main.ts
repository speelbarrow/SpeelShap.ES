import type { StorybookConfig } from "@storybook/web-components-vite"
import { mergeConfig } from "vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*stories.@(js|ts)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@chromatic-com/storybook",
  ],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  core: {
    crossOriginIsolated: true,
  },
}
export default config
