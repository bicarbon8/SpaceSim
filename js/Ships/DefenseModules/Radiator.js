var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.DefenseModules.Radiator = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);
};
SpaceSim.Ships.DefenseModules.Radiator.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.DefenseModules.Radiator.prototype.constructor = SpaceSim.Ships.DefenseModules.Radiator;
