const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {
  return {
    entry: {
      engine: './src/app/space-sim-game-engine.ts',
      // server: './src/server.ts'
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules|test/,
        }, {
          test: /server\.config\.json?$/,
          loader: 'file-replace-loader',
          options: {
              condition: env.production,
              replacement: path.resolve('./server.config.prod.json'),
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
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/assets', to: 'assets' }
        ]
      })
    ]
  };
};