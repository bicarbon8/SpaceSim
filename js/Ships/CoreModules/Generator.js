var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.Generator = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.power = options.power || 0; // in megaWatts
  this.heatEfficiency = options.heatEfficiency || 0; // how much heat generated per MegaWatt produced; 100% means no heat
  this.fuelEfficiency = options.fuelEfficiency || 0; // how much fuel consumed per MegaWatt produced; 100% means no fuel (impossible)
};
SpaceSim.Ships.CoreModules.Generator.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.Generator.prototype.constructor = SpaceSim.Ships.CoreModules.Generator;
