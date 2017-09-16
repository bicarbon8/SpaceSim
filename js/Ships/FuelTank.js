var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.FuelTank = function(options) {
  SpaceSim.Ships.Module.call(this, options);

  this.maxCapacity = options.maxCapacity || 0; // in tonnes
  this.currentAmount = options.currentAmount || 0; // in tonnes
};
SpaceSim.Ships.FuelTank.prototype = Object.create(SpaceSim.Ships.Module.prototype);
SpaceSim.Ships.FuelTank.prototype.constructor = SpaceSim.Ships.FuelTank;
