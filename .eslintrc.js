module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Permitir require() en archivos de configuración
    "@typescript-eslint/no-var-requires": "off",
  },
  overrides: [
    {
      files: ["*.config.js", "*.config.ts", "tailwind.config.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "import/no-import-module-exports": "off",
      },
    },
  ],
}; 