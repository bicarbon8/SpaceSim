var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.WeaponModules = function(options) {
  this.SIZE_SMALL = 1;
  this.SIZE_MEDIUM = 2;
  this.SIZE_LARGE = 3;

  this.smallCount = options.smallCount || 0;
  this.mediumCount = options.mediumCount || 0;
  this.largeCount = options.largeCount || 0;

  this.smallModules = [this.smallCount];
  this.mediumModules = [this.mediumCount];
  this.largeModules = [this.largeCount];
};
SpaceSim.Ships.WeaponModules.prototype.add = function(weapon) {
  var moduleArray = null;
  var maxModuleCount = 0;
  switch (weapon.size) {
    case SpaceSim.Ships.WeaponModules.SIZE_SMALL:
      moduleArray = this.smallModules;
      maxModuleCount = this.smallCount;
      break;
    case SpaceSim.Ships.WeaponModules.SIZE_MEDUIUM:
      moduleArray = this.mediumModules;
      maxModuleCount = this.mediumCount;
      break;
    case SpaceSim.Ships.WeaponModules.SIZE_LARGE:
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
