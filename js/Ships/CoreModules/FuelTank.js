var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.FuelTank = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.maxCapacity = options.maxCapacity || 0; // in tonnes
  this.currentAmount = this.maxCapacity; // start with a full tank
};
SpaceSim.Ships.FuelTank.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.FuelTank.prototype.constructor = SpaceSim.Ships.FuelTank;
