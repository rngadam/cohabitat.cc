import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        lucide: "readonly"
      }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": ["error", { "varsIgnorePattern": "toggleEngineering|selectFloor|toggleUnit" }]
    }
  },
  {
      files: ["validate-allocations.js"],
      rules: {
          "no-undef": "off"
      }
  }
];
