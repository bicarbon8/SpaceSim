var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.UtilityModules.CargoHold = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.capacity = options.capacity || 0;
  this.cargo = []; // starts out empty
};
SpaceSim.Ships.UtilityModules.CargoHold.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.UtilityModules.CargoHold.prototype.constructor = SpaceSim.Ships.UtilityModules.CargoHold;
