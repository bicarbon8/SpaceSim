const path = require('path');

module.exports = {
  entry: './src/app/space-sim-server.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules|test/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    library: 'bundle',
    libraryTarget: 'umd',
    filename: 'space-sim-server-bundle.js',
    path: path.resolve(__dirname, 'dist'),
  }
};