const { withPlugins, withInfoPlist } = require('@expo/config-plugins');

const withReactNativePurchases = (config) => {
  // Handle iOS configuration
  config = withInfoPlist(config, (config) => {
    // Add RevenueCat API key
    config.modResults.RCAppStoreAPIKey = config.extra.revenueCatApiKeyIos;
    
    // Add essential iOS capabilities for RevenueCat
    config.modResults.SKPaymentTransactions = true;
    
    // Add background modes for subscription status updates and remote notifications
    if (!config.modResults.UIBackgroundModes) {
      config.modResults.UIBackgroundModes = [];
    }
    if (!config.modResults.UIBackgroundModes.includes('fetch')) {
      config.modResults.UIBackgroundModes.push('fetch');
    }
    if (!config.modResults.UIBackgroundModes.includes('remote-notification')) {
      config.modResults.UIBackgroundModes.push('remote-notification');
    }

    // Enable StoreKit 2.0 capabilities
    config.modResults.ITSAppUsesNonExemptEncryption = false;

    // Add required capabilities for in-app purchases
    if (!config.modResults.UIRequiredDeviceCapabilities) {
      config.modResults.UIRequiredDeviceCapabilities = [];
    }
    if (!config.modResults.UIRequiredDeviceCapabilities.includes('armv7')) {
      config.modResults.UIRequiredDeviceCapabilities.push('armv7');
    }
    
    return config;
  });

  return config;
};

module.exports = (config) => {
  return withPlugins(config, [withReactNativePurchases]);
};