const path = require('path');
const config = require('./webpack.prod.config');

// Override env.config alias to use the stub that omits private edX plugins,
// allowing CI-style validation builds without the local monorepo packages.
config.resolve.alias['env.config'] = path.resolve(__dirname, 'env.config.validate');

module.exports = config;
