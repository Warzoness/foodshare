import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Disable strict any rules for external libraries
      "@typescript-eslint/no-explicit-any": "off",
      // Allow unescaped entities in JSX
      "react/no-unescaped-entities": "off",
      // Allow unused vars in development
      "@typescript-eslint/no-unused-vars": "warn",
      // Allow missing dependencies in useEffect
      "react-hooks/exhaustive-deps": "warn",
      // Allow img elements
      "@next/next/no-img-element": "warn",
      // Allow html links for pages
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
];

export default eslintConfig;
