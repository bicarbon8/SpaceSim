var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.FuelTank = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.maxCapacity = options.maxCapacity || 0; // in tonnes
  this.currentAmount = this.maxCapacity; // start with a full tank
};
SpaceSim.Ships.CoreModules.FuelTank.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.FuelTank.prototype.constructor = SpaceSim.Ships.CoreModules.FuelTank;

SpaceSim.Ships.CoreModules.FuelTank.prototype.refuel = function() {
  this.addFuel(this.maxCapacity - this.currentAmount);
};

SpaceSim.Ships.CoreModules.FuelTank.prototype.addFuel = function(amount) {
  if (amount && SpaceSim.Utilities.isNumeric(amount) && amount <= this.maxCapacity - this.currentAmount) {
    this.currentAmount += amount;
  }
};

SpaceSim.Ships.CoreModules.FuelTank.prototype.consumeFuel = function (amount) {
  if (amount && SpaceSim.Utilities.isNumeric(amount) && amount <= this.currentAmount) {
    this.currentAmount -= amount;
  }
};