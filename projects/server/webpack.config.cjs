const path = require('path');

module.exports = (env) => {
  return {
    entry: './src/app/space-sim-server.ts',
    devtool: 'inline-source-map',
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
      library: 'bundle',
      libraryTarget: 'umd',
      filename: 'space-sim-server-bundle.js',
      path: path.resolve(__dirname, 'dist'),
    }
  };
};