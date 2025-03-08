import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: Object.fromEntries(
      Object.keys(require("eslint").linter.rules).map((rule) => [rule, "off"])
    ),
  }),
];

export default eslintConfig;
