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
  var totalMass = 0;

  if (this.fuelTank) {
    totalMass += this.fuelTank.mass + // mass of the housing
                 this.fuelTank.currentAmount; // mass of the fuel
  }
  if (this.generator) { totalMass += this.generator.mass; }
  if (this.thrusters) { totalMass += this.thrusters.mass; }
  if (this.warpCore) { totalMass += this.warpCore.mass; }
  if (this.lifeSupport) { totalMass += this.lifeSupport.mass; }
  if (this.capacitor) { totalMass += this.capacitor.mass; }

  return totalMass;
};
SpaceSim.Ships.CoreModules.prototype.getTotalHeat = function() {
  var totalHeat = 0; // percent

  if (this.fuelTank && this.fuelTank.enabled) { totalHeat += (this.fuelTank.active) ? this.fuelTank.activeHeatGenerated : this.fuelTank.heatGenerated; }
  if (this.thrusters && this.thrusters.enabled) { totalHeat += (this.thrusters.active) ? this.thrusters.activeHeatGenerated : this.thrusters.heatGenerated; }
  if (this.warpCore && this.warpCore.enabled) { totalHeat += (this.warpCore.active) ? this.warpCore.activeHeatGenerated : this.warpCore.heatGenerated; }
  if (this.lifeSupport && this.lifeSupport.enabled) { totalHeat += (this.lifeSupport.active) ? this.lifeSupport.activeHeatGenerated : this.lifeSupport.heatGenerated; }
  if (this.capacitor && this.capacitor.enabled) { totalHeat += (this.capacitor.active) ? this.capacitor.activeHeatGenerated : this.capacitor.heatGenerated; }
  if (this.generator) {
    totalHeat += this.generator.getHeatGeneratedByUsage(this.getTotalPowerConsumed());
  }

  return totalHeat;
};
SpaceSim.Ships.CoreModules.prototype.getTotalPowerConsumed = function() {
  var totalPower = 0; // MegaWatts

  if (this.fuelTank && this.fuelTank.enabled) { totalPower += (this.fuelTank.active) ? this.fuelTank.activePowerDraw : this.fuelTank.powerDraw; }
  if (this.thrusters && this.thrusters.enabled) { totalPower += (this.thrusters.active) ? this.thrusters.activePowerDraw : this.thrusters.powerDraw; }
  if (this.warpCore && this.warpCore.enabled) { totalPower += (this.warpCore.active) ? this.warpCore.activePowerDraw : this.warpCore.powerDraw; }
  if (this.lifeSupport && this.lifeSupport.enabled) { totalPower += (this.lifeSupport.active) ? this.lifeSupport.activePowerDraw : this.lifeSupport.powerDraw; }
  if (this.capacitor && this.capacitor.enabled) { totalPower += (this.capacitor.active) ? this.capacitor.activePowerDraw : this.capacitor.powerDraw; }
  // leave off generator as it produces, not consumes power

  return totalPower;
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
