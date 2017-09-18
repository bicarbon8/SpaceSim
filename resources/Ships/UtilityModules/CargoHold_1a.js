var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.UtilityModules = SpaceSim.Ships.UtilityModules || {};
/**
 * this is the smallest and worst performing CargoHold you can buy
 */
SpaceSim.Ships.UtilityModules.CargoHold_1a = function() {
  var options = {
    mass: 1, // in tonnes
    size: 1,
    capacity: 1, // equal to amount of cargo that can be held in tonnes
    heatResistance: 0, // none
    impactResistance: 0, // none
    cost: 100,
    powerDraw: 0,
    heatGenerated: 0
  };
  SpaceSim.Ships.UtilityModules.CargoHold.call(this, options);
};
SpaceSim.Ships.UtilityModules.CargoHold_1a.prototype = Object.create(SpaceSim.Ships.UtilityModules.CargoHold.prototype);
SpaceSim.Ships.UtilityModules.CargoHold_1a.prototype.constructor = SpaceSim.Ships.UtilityModules.CargoHold_1a;
