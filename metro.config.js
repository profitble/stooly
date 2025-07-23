const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

let config = getDefaultConfig(__dirname);

// Add NativeWind support
config = withNativeWind(config, {
  input: './global.css',
});

// Basic asset plugin support (already standard with Expo)
config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
  // environmentHash and EXPO_PUBLIC_ line removed as unnecessary
};

// Metro resolver tweaks
config.resolver = {
  ...config.resolver,
  // Prioritize local node_modules (not usually needed with Expo, but harmless)
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
  ],
  // Only add extraNodeModules if you *actually* have those stubs/files
  // Remove @env and react-native-reanimated overrides if not using custom mocks
  // extraNodeModules: { ... }
};

module.exports = config;
