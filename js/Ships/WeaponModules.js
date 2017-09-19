var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.WeaponModules = function(options) {
  this.smallCount = options.smallCount || 0;
  this.mediumCount = options.mediumCount || 0;
  this.largeCount = options.largeCount || 0;

  this.smallModules = [];
  this.mediumModules = [];
  this.largeModules = [];
};
SpaceSim.Ships.WeaponSizes = {
  small: 1,
  medium: 2,
  large: 3
};
SpaceSim.Ships.WeaponModules.prototype.getTotalMass = function() {
  var totalMass = 0;
  this.smallModules.forEach(function(sModule) {
    totalMass += sModule.mass;
  });
  this.mediumModules.forEach(function(mModule) {
    totalMass += mModule.mass;
  });
  this.largeModules.forEach(function(lModule) {
    totalMass += lModule.mass;
  });
  return totalMass;
};
SpaceSim.Ships.WeaponModules.prototype.add = function(weapon) {
  var moduleArray = null;
  var maxModuleCount = 0;
  switch (weapon.size) {
    case SpaceSim.Ships.WeaponSizes.small:
      moduleArray = this.smallModules;
      maxModuleCount = this.smallCount;
      break;
    case SpaceSim.Ships.WeaponSizes.medium:
      moduleArray = this.mediumModules;
      maxModuleCount = this.mediumCount;
      break;
    case SpaceSim.Ships.WeaponSizes.large:
      moduleArray = this.largeModules;
      maxModuleCount = this.largeCount;
      break;
    default:
      throw "invalid weapon size specified: " + weapon.size;
  }
  if (moduleArray.length < maxModuleCount) {
    moduleArray.push(weapon);
  }
};
SpaceSim.Ships.WeaponModules.prototype.getTotalHeat = function() {
  var totalHeat = 0; // degrees Celcius

  this.smallModules.forEach(function(sModule) {
    if (sModule.enabled) { totalHeat += (sModule.active) ? sModule.activeHeatGenerated : sModule.heatGenerated; }
  });
  this.mediumModules.forEach(function(mModule) {
    if (mModule.enabled) { totalHeat += (mModule.active) ? mModule.activeHeatGenerated : mModule.heatGenerated; }
  });
  this.largeModules.forEach(function(lModule) {
    if (lModule.enabled) { totalHeat += (lModule.active) ? lModule.activeHeatGenerated : lModule.heatGenerated; }
  });

  return totalHeat;
};
SpaceSim.Ships.WeaponModules.prototype.getTotalPowerConsumed = function() {
  var totalPower = 0; // MegaWatts

  this.modules.forEach(function(module) {
    if (module.enabled) { totalPower += (module.active) ? module.activePowerDraw : module.powerDraw; }
  });

  return totalPower;
};
