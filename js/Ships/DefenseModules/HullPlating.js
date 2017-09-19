var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.DefenseModules.HullPlating = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);
};
SpaceSim.Ships.DefenseModules.HullPlating.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.DefenseModules.HullPlating.prototype.constructor = SpaceSim.Ships.DefenseModules.HullPlating;
