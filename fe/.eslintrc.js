module.exports = {
  extends: ['next/core-web-vitals', 'eslint:recommended'],
  rules: {
    'no-unused-vars': 'off', // Temporarily disable unused vars warnings
    'no-console': 'off', // Temporarily disable console warnings
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'off', // Temporarily disable unescaped entities warnings
    '@next/next/no-img-element': 'off', // Temporarily disable img element warnings
    'react-hooks/exhaustive-deps': 'off', // Temporarily disable exhaustive deps warnings
    '@next/next/no-html-link-for-pages': 'off', // Temporarily disable html link warnings
    'no-unreachable': 'off', // Temporarily disable unreachable code warnings
    'import/no-anonymous-default-export': 'off', // Temporarily disable anonymous default export warnings
  },
}