var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.UtilityModules = function(options) {
  this.size = options.size || 0; // utility modules can be added to occupy all available space

  this.modules = [];
  if (options.modules && options.modules.length > 0) {
    for (var i=0; i<options.modules.length; i++) {
      var mod = options.modules[i];
      this.modules.push(mod);
    }
  }
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
SpaceSim.Ships.UtilityModules.prototype.remove = function(id) {
  for (var i=0; i<this.modules.length; i++) {
    var mod = this.modules[i];
    if (mod.id == id) {
      this.modules.splice(i, 1);
    }
  }
};
SpaceSim.Ships.UtilityModules.prototype.isEnabled = function(id) {
  for (var i=0; i<this.modules.length; i++) {
    var mod = this.modules[i];
    if (mod.id == id) {
      return this.modules[i].enabled;
    }
  }
  return false;
};

SpaceSim.Ships.UtilityModules.prototype.setEnabled = function(id, enabled) {
  for (var i=0; i<this.modules.length; i++) {
    var mod = this.modules[i];
    if (mod.id == id) {
      this.modules[i].setEnabled(enabled);
    }
  }
};

SpaceSim.Ships.UtilityModules.prototype.getRemainingSpace = function() {
  var remaining = this.size;
  for (var i=0; i<this.modules.length; i++) {
    remaining -= this.modules[i].size;
  }
  return remaining;
};
