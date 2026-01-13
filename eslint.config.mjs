import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        lucide: "readonly" // Define lucide as a global variable
      }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": ["error", { "varsIgnorePattern": "toggleEngineering|selectFloor|toggleUnit" }] // Ignore unused vars for these functions as they are called from HTML
    }
  }
];
