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
SpaceSim.Ships.DefenseModules.prototype.getTotalHeat = function() {
  var totalHeat = 0; // degrees Celcius

  this.modules.forEach(function(module) {
    if (module.enabled) { totalHeat += (module.active) ? module.activeHeatGenerated : module.heatGenerated; }
  });

  return totalHeat;
};
SpaceSim.Ships.DefenseModules.prototype.getTotalPowerConsumed = function() {
  var totalPower = 0; // MegaWatts

  this.modules.forEach(function(module) {
    if (module.enabled) { totalPower += (module.active) ? module.activePowerDraw : module.powerDraw; }
  });

  return totalPower;
};
