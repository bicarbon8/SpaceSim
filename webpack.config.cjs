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
        },     
        shared: {
          "@angular/core": { singleton: true, eager: true, requiredVersion: '^13.0.0', version: deps["@angular/core"] }, 
          "@angular/common": { singleton: true, eager: true, requiredVersion: '^13.0.0', version: deps["@angular/common"] }, 
          "@angular/common/http": { singleton: true, eager: true, requiredVersion: '^13.0.0', version: deps["@angular/common/http"] }, 
          "@angular/router": { singleton: true, eager: true, requiredVersion: '^13.0.0', version: deps["@angular/router"] },
          bootstrap: { singleton: true, eager: true, requiredVersion: '^5.0.0', version: deps.bootstrap }
        }
    })
  ],
};
