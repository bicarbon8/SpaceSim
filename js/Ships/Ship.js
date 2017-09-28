var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.Ship = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.manufacturer = options.manufacturer || null;

  this.coreModules = new SpaceSim.Ships.CoreModules(options.coreModules);
  this.weaponModules = new SpaceSim.Ships.WeaponModules(options.weaponModules);
  this.defenseModules = new SpaceSim.Ships.DefenseModules(options.defenseModules);
  this.utilityModules = new SpaceSim.Ships.UtilityModules(options.utilityModules);

  // simulates placement of thruster ports; used in conjunction with mass to determine speeds
  this.pitchMultiplier = options.pitchMultiplier || 0;
  this.yawMultiplier = options.yawMultiplier || 0;
  this.rollMultiplier = options.rollMultiplier || 0;
  this.forwardThrustMultiplier = options.forwardThrustMultiplier || 0; // should never go above 1 (100%)
  this.reverseThrustMultiplier = options.reverseThrustMultiplier || 0;
  this.upThrustMultiplier = options.upThrustMultiplier || 0;
  this.downThrustMultiplier = options.downThrustMultiplier || 0;
  this.leftThrustMultiplier = options.leftThrustMultiplier || 0;
  this.rightThrustMultiplier = options.rightThrustMultiplier || 0;
};
SpaceSim.Ships.Ship.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.Ship.prototype.constructor = SpaceSim.Ships.Ship;
SpaceSim.Ships.Ship.prototype.getTotalHeat = function() {
  // start by getting PowerPlant efficiency and power draw of all enabled modules
  var totalHeat = this.coreModules.getTotalHeat() +
      this.utilityModules.getTotalHeat() +
      this.coreModules.generator.getHeatGeneratedByUsage(this.utilityModules.getTotalPowerConsumed()) +
      this.defenseModules.getTotalHeat() +
      this.coreModules.generator.getHeatGeneratedByUsage(this.defenseModules.getTotalPowerConsumed()) +
      this.weaponModules.getTotalHeat() +
      this.coreModules.generator.getHeatGeneratedByUsage(this.weaponModules.getTotalPowerConsumed());

  // TODO: add heat from nearby objects (stars, gas giants, etc.)

  // reduce values by Ship's heatResistance
  totalHeat = totalHeat - (totalHeat * this.heatResistance);

  return totalHeat;
};
SpaceSim.Ships.Ship.prototype.getTotalMass = function() {
  // add up mass of ship + hull + currentFuel + all modules
  var totalMass = this.mass +
      this.coreModules.getTotalMass() +
      this.defenseModules.getTotalMass() +
      this.utilityModules.getTotalMass() +
      this.weaponModules.getTotalMass();
  return totalMass;
};
SpaceSim.Ships.Ship.prototype.getTotalCargoCapacity = function() {
  var capacity = 0;
  for (var i=0; i<this.utilityModules.modules.length; i++) {
    var uMod = this.utilityModules.modules[i];
    if (uMod.type == SpaceSim.ModuleTypes.Utility && uMod.subType == SpaceSim.ModuleSubTypes.CargoHold) {
      capacity += uMod.getCapacity();
    }
  }
  return capacity;
};
