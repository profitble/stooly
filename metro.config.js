const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

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
    '@env': path.resolve(__dirname, '.env.production')
  }
};

module.exports = config; 