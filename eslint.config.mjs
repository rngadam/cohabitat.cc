import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        lucide: "readonly", // Define lucide as a global variable
        define: "readonly"
      }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": ["error", {
        "varsIgnorePattern": "^(toggleEngineering|selectFloor|toggleUnit|loadComponent|toggleMobileMenu)$",
        "argsIgnorePattern": "^_"
      }]
    }
  }
];
