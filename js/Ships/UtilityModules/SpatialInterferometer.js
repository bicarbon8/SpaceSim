var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.UtilityModules.SpatialInterferometer = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.range = options.range || 0; // in light minutes (525600 per light year)
};
SpaceSim.Ships.UtilityModules.SpatialInterferometer.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.UtilityModules.SpatialInterferometer.prototype.constructor = SpaceSim.Ships.UtilityModules.SpatialInterferometer;
