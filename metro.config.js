const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase JS SDK + Metro package exports: Auth can initialize without registering
// the auth component, so sign-up appears to do nothing. See expo/expo#36588.
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
