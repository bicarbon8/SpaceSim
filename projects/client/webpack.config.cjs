const ModuleFederationPlugin = require("webpack").container.ModuleFederationPlugin;
const deps = require('./package.json').dependencies;
 
module.exports = {
  output: {
    uniqueName: "SpaceSim",
    publicPath: "auto"
  },
  optimization: {
    runtimeChunk: false
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({
        library: { type: "module" },

        // For remotes (please adjust)
        name: "SpaceSim",
        filename: "remoteEntry.js",
        exposes: {
            './Module': './src/app/space-sim/space-sim.module.ts',
            './loadRemote': './src/loadRemote.ts',
        },     
        shared: {
          "@angular/core": { requiredVersion: '^13.0.0' }, 
          "@angular/common": { requiredVersion: '^13.0.0' }, 
          "@angular/common/http": { requiredVersion: '^13.0.0' }, 
          "@angular/router": { requiredVersion: '^13.0.0' },
          bootstrap: { requiredVersion: '^5.0.0' }
        }
    })
  ],
};
