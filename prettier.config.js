module.exports = {
  overrides: [
    {
      // prettier will strip newlines out of package.json files unless you tell it to use the json parser
      files: ['package.json', '**/package.json'],
      options: { parser: 'json' }
    }
  ],
  printWidth: 80,
  semi: true,
  singleQuote: true,
  trailingComma: 'none',
  tabWidth: 2,
  useTabs: false,
  xmlWhitespaceSensitivity: 'ignore'
};
