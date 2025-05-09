// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
let config = getDefaultConfig(__dirname);

config = withNativeWind(config, {
    input: './global.css',
});

config.transformer = {
    ...config.transformer,
    _expoRelativeProjectRoot: __dirname,
};

module.exports = config;
