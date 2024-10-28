module.exports = {
  root: true, // 阻止往父级目录查找
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "eslint:recommended", // 推荐的 ESLint 基础规则
    "plugin:vue/essential", // Vue 推荐规则
    "@vue/standard" // Vue.js 标准风格指南
  ],
  plugins: [
    "vue" // 启用 Vue 插件
  ],
  parserOptions: {
    parser: "babel-eslint", // 解析 ES6 语法
  },
  rules: {
    eqeqeq: "off",
    camelcase: "off",
    yoda: "error",
    semi: "off",
    quotes: "error",
    "one-var": "error",
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "generator-star-spacing": "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-dupe-keys": "error",
    "no-dupe-args": "error",
    "no-func-assign": "error",
    "no-duplicate-case": "error",
    "no-undef": "warn",
    "no-multi-spaces": "error",
    "no-label-var": "error",
    "no-tabs": "warn",
    "no-shadow": "off",
    "no-else-return": "off",
    "no-empty-function": "warn",
    "no-unused-vars": "warn",
    "no-return-assign": "off",
    "no-trailing-spaces": "error",
    "no-const-assign": "error",
    "no-dupe-class-members": "error",
    "no-alert": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-extra-semi": "error",
    "no-constant-condition": "error",
    "no-multiple-empty-lines": ["warn", { max: 2 }],
    "no-unused-expressions": "warn",
    "no-lone-blocks": "error",
    "no-sequences": "error",
    "no-irregular-whitespace": "error",
    "space-before-function-paren": "off",
    "handle-callback-err": "warn",
    "prefer-promise-reject-errors": "off",
    "spaced-comment": "warn",
    "keyword-spacing": "warn",
    "object-curly-spacing": "warn",
    "comma-spacing": ["error", { before: false, after: true }],
    "newline-after-var": "off",
    indent: "off",
    "vue/html-indent": "off",
    "vue/mustache-interpolation-spacing": "off",
    "vue/max-attributes-per-line": "off",
    "vue/attributes-order": "off",
    "key-spacing": "off",
    "comma-dangle": "off",
    "space-before-blocks": "off",
    "space-infix-ops": "error",
    "arrow-spacing": "error",
    "vue/order-in-components": "off",
    "vue/no-dupe-keys": "error",
    "import/no-duplicates": "error",
    "vue/valid-v-for": "error",
    "vue/require-v-for-key": "error",
    "vue/no-parsing-error": ["error", { "x-invalid-end-tag": false }],
    "vue/html-self-closing": "off",
    "vue/no-side-effects-in-computed-properties": "off",
    "vue/no-unused-vars": "warn",
    "vue/valid-v-model": "error",
    "vue/valid-template-root": "error",
  },
};
