const path = require('path');

module.exports = (env) => {
  return {
    entry: {
      engine: './src/app/space-sim-server.ts'
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules|test/,
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
    }
  };
};