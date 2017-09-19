var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.DefenseModules = function(options) {
  this.size = options.size || 0; // Defense modules can be added to occupy all available space

  this.modules = [];
};
SpaceSim.Ships.DefenseModules.prototype.getTotalMass = function() {
  var totalMass = 0;
  this.modules.forEach(function(module) {
    totalMass += module.mass;
  });
  return totalMass;
};
