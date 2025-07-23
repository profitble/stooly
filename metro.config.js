const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

let config = getDefaultConfig(__dirname);

config = withNativeWind(config, {
  input: './global.css',
});

// Enable context modules and add asset support
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
  environmentHash: {
    ...config.transformer.environmentHash,
    'EXPO_PUBLIC_': JSON.stringify(process.env.EXPO_PUBLIC_),
  },
};

// Configure Metro resolution
config.resolver = {
  ...config.resolver,
  // Prioritize CommonJS modules
  sourceExts: [
    'cjs.js',  // Prioritize CommonJS first
    ...config.resolver.sourceExts,
    'js',
    'json',
    'ts',
    'tsx'
  ],
  // Add JSON and asset extensions
  assetExts: [...config.resolver.assetExts, 'db', 'txt'],
  // Configure module resolution
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules')
  ],
  // Keep hierarchical lookup enabled for standard module resolution
  disableHierarchicalLookup: false,
  extraNodeModules: {
    '@env': path.resolve(__dirname, '.env.production'),
    // Force any require('react-native-reanimated') to resolve to a local stub so that
    // libraries like react-native-gesture-handler do not attempt to load the real package.
    'react-native-reanimated': path.resolve(__dirname, 'mocks', 'react-native-reanimated.js'),
  }
};

module.exports = config; 