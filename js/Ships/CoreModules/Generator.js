var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.Generator = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.power = options.power || 0; // in megaWatts
  this.efficiency = options.efficiency || 0; // how much heat generated per megaWatt consumed
};
SpaceSim.Ships.CoreModules.Generator.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.Generator.prototype.constructor = SpaceSim.Ships.CoreModules.Generator;
