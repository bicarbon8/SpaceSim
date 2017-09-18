var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.UtilityModules = function(options) {
  this.size = options.size || 0; // utility modules can be added to occupy all available space

  this.modules = [0];
};
SpaceSim.Ships.UtilityModules.prototype.getTotalMass = function() {
  var totalMass = 0;
  this.modules.forEach(function(module) {
    totalMass += module.mass;
  });
  return totalMass;
};
