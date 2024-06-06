import { FlatCompat } from "@eslint/eslintrc"

import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import stylistic from "@stylistic/eslint-plugin-ts"

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.plugins("require-extensions"),
  ...compat.extends("plugin:require-extensions/recommended"),
  {
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      "@stylistic/ts": stylistic,
    },
    rules: {
      "@stylistic/ts/semi": ["warn", "never"],
      "@typescript-eslint/no-explicit-any": "off",
      // Covered by TypeScript compiler
      "@typescript-eslint/no-unused-vars": "off",

      "@stylistic/ts/quotes": ["warn", "double", {
        "avoidEscape": true,
      }],
      "@stylistic/ts/comma-dangle": ["warn", "always-multiline"],
    },
  },
]
