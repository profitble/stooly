module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["module-resolver", {
        root: ["."],
        alias: {
          "@": ".",
          "~": "."
        }
      }],
      [
        '@gluestack-style/babel-plugin-styled-resolver',
        {
          configPath: './styles/gluestack-ui.config.ts',
        },
      ],
      'transform-remove-console'
    ],
  };
}; 