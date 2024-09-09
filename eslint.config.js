module.exports = [
    {
      files: ['**/*.js'],
      languageOptions: {
        ecmaVersion: 2021, // Set the ECMAScript version you are targeting
        sourceType: 'module',
      },
      rules: {
        'no-unused-vars': 'warn',
        'no-console': 'off',
        // Other rules as needed
      },
    },
  ];
  