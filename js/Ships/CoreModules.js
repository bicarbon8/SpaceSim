var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = function(options) {
  this.generatorMaxSize = options.generatorMaxSize || 0;
  this.generator = null;

  this.thrustersMaxSize = options.thrustersMaxSize || 0;
  this.thrusters = null;

  this.warpCoreMaxSize = options.warpCoreMaxSize || 0;
  this.warpCore = null;

  this.lifeSupportMaxSize = options.lifeSupportMaxSize || 0;
  this.lifeSupport = null;

  this.capacitorMaxSize = options.capacitorMaxSize || 0;
  this.capacitor = null;

  this.fuelTankMaxSize = options.fuelTankMaxSize || 0;
  this.fuelTank = null;
};
SpaceSim.Ships.CoreModules.prototype.getTotalMass = function() {
  var totalMass = this.fuelTank.mass +
      this.fuelTank.currentAmount +
      this.generator.mass +
      this.thrusters.mass +
      this.warpCore.mass +
      this.lifeSupport.mass +
      this.capacitor.mass;
};
SpaceSim.Ships.CoreModules.prototype.updateGenerator = function(generator) {
  if (generator && generator.size > this.generatorMaxSize) {
    throw "ship cannot equip a Generator larger than: " + this.generatorMaxSize;
  }
  this.generator = generator;
};
SpaceSim.Ships.CoreModules.prototype.updateThrusters = function(thrusters) {
  if (thrusters && thrusters.size > this.thrustersMaxSize) {
    throw "ship cannot equip Thrusters larger than: " + this.thrustersMaxSize;
  }
  this.thrusters = thrusters;
};
SpaceSim.Ships.CoreModules.prototype.updateWarpCore = function(warpCore) {
  if (warpCore && warpCore.size > this.warpCoreMaxSize) {
    throw "ship cannot equip a Warp Core larger than: " + this.warpCoreMaxSize;
  }
  this.warpCore = warpCore;
};
SpaceSim.Ships.CoreModules.prototype.updateLifeSupport = function(lifeSupport) {
  if (lifeSupport && lifeSupport.size > this.lifeSupportMaxSize) {
    throw "ship cannot equip Life Support larger than: " + this.lifeSupportMaxSize;
  }
  this.lifeSupport = lifeSupport;
};
SpaceSim.Ships.CoreModules.prototype.updateCapacitor = function(capacitor) {
  if (capacitor && capacitor.size > this.capacitorMaxSize) {
    throw "ship cannot equip a Capacitor larger than: " + this.capacitorMaxSize;
  }
  this.capacitor = capacitor;
};
SpaceSim.Ships.CoreModules.prototype.updateFuelTank = function(fuelTank) {
  if (fuelTank && fuelTank.size > this.fuelTankMaxSize) {
    throw "ship cannot equip a Fuel Tank larger than: " + this.fuelTankMaxSize;
  }
  this.fuelTank = fuelTank;
};
