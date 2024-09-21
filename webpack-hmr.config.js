const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
// const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");

module.exports = function (options, webpack) {
  return {
    devtool: "source-map",
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({ name: options.output.filename, autoRestart: false }),
      // sentryWebpackPlugin({
      //   authToken: process.env.SENTRY_AUTH_TOKEN,
      //   org: "guestly",
      //   project: "guestly-backend",
      // }),
    ],
  };
};