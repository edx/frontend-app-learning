const path = require('path');
const { merge } = require('webpack-merge');
const prodConfig = require('@openedx/frontend-build/config/webpack.prod.config');

/**
 * Webpack config used by `npm run build:validate`.
 *
 * Identical to the prod build except env.config is replaced with a stub so
 * that the build succeeds without the private edX plugin packages that are
 * only available in the local development monorepo.
 */
module.exports = merge(prodConfig, {
  resolve: {
    alias: {
      'env.config': path.resolve(__dirname, './env.config.validate'),
      // TsconfigPathsPlugin doesn't hook correctly on the merged config, so
      // replicate the tsconfig "@src/*" path mapping explicitly.
      '@src': path.resolve(__dirname, 'src'),
    },
  },
});
