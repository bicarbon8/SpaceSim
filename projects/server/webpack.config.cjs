const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {
  return {
    entry: './src/app/space-sim-server.ts',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules|test/,
        }, {
          test: /environment\.ts?$/,
          loader: 'file-replace-loader',
          options: {
              condition: env.production,
              replacement: path.resolve('./src/environments/environment.prod.ts'),
              async: true
          }
        }
      ],
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
      filename: '[name].bundle.js',
      chunkFilename: '[name].chunk.js',
      path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            filename: '[name].bundle.js'
          }
        }
      }
    },
    plugins: [
      new HtmlWebpackPlugin({ gameName: 'SpaceSim', template: 'src/index.html' }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/assets', to: 'assets' }
        ]
      })
    ]
  };
};