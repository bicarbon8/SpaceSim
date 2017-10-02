var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.DefenseModules = function(options) {
  SpaceSim.Ships.ModulesContainer.call(this, options);
};
SpaceSim.Ships.DefenseModules.prototype = Object.create(SpaceSim.Ships.ModulesContainer.prototype);
SpaceSim.Ships.DefenseModules.prototype.constructor = SpaceSim.Ships.DefenseModules;
