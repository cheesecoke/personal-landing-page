/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: [
    '**/node_modules/**',
    '**/build/**',
    '**/dist/**',
    '**/storybook-static/**',
    '**/.react-router/**',
    '**/.vercel/**',
    'packages/tokens/generated/**',
  ],
  rules: {
    // Tailwind v4 at-rules.
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'theme',
          'source',
          'utility',
          'variant',
          'custom-variant',
          'apply',
          'reference',
          'plugin',
          'config',
        ],
      },
    ],
    'import-notation': null,
    // CSS Modules use camelCase class names; plain CSS uses kebab-case.
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'custom-property-empty-line-before': null,
    // Motion ships inside `prefers-reduced-motion: no-preference` (reduced is the default).
    'media-feature-range-notation': 'context',
  },
};
