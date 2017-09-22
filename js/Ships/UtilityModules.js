var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.UtilityModules = function(options) {
  this.size = options.size || 0; // utility modules can be added to occupy all available space

  this.modules = options.modules || [];
};
SpaceSim.Ships.UtilityModules.prototype.getTotalMass = function() {
  var totalMass = 0;
  this.modules.forEach(function(module) {
    totalMass += module.mass;
  });
  return totalMass;
};
SpaceSim.Ships.UtilityModules.prototype.getTotalHeat = function() {
  var totalHeat = 0; // degrees Celcius

  this.modules.forEach(function(module) {
    if (module.enabled) { totalHeat += (module.active) ? module.activeHeatGenerated : module.heatGenerated; }
  });

  return totalHeat;
};
SpaceSim.Ships.UtilityModules.prototype.getTotalPowerConsumed = function() {
  var totalPower = 0; // MegaWatts

  this.modules.forEach(function(module) {
    if (module.enabled) { totalPower += (module.active) ? module.activePowerDraw : module.powerDraw; }
  });

  return totalPower;
};
SpaceSim.Ships.UtilityModules.prototype.add = function(module) {
  if (this.modules.length < this.size) {
    this.modules.push(module);
  }
};
