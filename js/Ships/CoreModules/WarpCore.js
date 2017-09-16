var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.WarpCore = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.maximumMass = options.maximumMass || 0; // maximum mass that can be shifted. above maximum the jump range drops to 0
  this.maximumFuel = options.maximumFuel || 0; // maximum fuel used for maximum jump
  this.maximumRange = options.maximumRange || 0; // largest jump range at 0 mass
};
SpaceSim.Ships.CoreModules.WarpCore.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.WarpCore.prototype.constructor = SpaceSim.Ships.CoreModules.WarpCore;
