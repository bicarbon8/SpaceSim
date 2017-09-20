var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.UtilityModules = SpaceSim.Ships.UtilityModules || {};
SpaceSim.Ships.UtilityModules.CargoHolds = SpaceSim.Ships.UtilityModules.CargoHolds || {};
SpaceSim.Ships.UtilityModules.CargoHolds.Size1 = SpaceSim.Ships.UtilityModules.CargoHolds.Size1 || {};
/**
 * this is the smallest and worst performing CargoHold you can buy
 */
SpaceSim.Ships.UtilityModules.CargoHolds.Size1.E = function() {
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
SpaceSim.Ships.UtilityModules.CargoHolds.Size1.E.prototype = Object.create(SpaceSim.Ships.UtilityModules.CargoHold.prototype);
SpaceSim.Ships.UtilityModules.CargoHolds.Size1.E.prototype.constructor = SpaceSim.Ships.UtilityModules.CargoHolds.Size1.E;

SpaceSim.Ships.UtilityModules.CargoHolds.Size1.C = function() {
  var options = {
    mass: 2, // in tonnes
    size: 1,
    capacity: 2, // equal to amount of cargo that can be held in tonnes
    heatResistance: 0, // none
    impactResistance: 0, // none
    cost: 250,
    powerDraw: 5,
    heatGenerated: 5
  };
  SpaceSim.Ships.UtilityModules.CargoHold.call(this, options);
};
SpaceSim.Ships.UtilityModules.CargoHolds.Size1.C.prototype = Object.create(SpaceSim.Ships.UtilityModules.CargoHold.prototype);
SpaceSim.Ships.UtilityModules.CargoHolds.Size1.C.prototype.constructor = SpaceSim.Ships.UtilityModules.CargoHolds.Size1.C;

SpaceSim.Ships.UtilityModules.CargoHolds.Size1.A = function() {
  var options = {
    mass: 1, // in tonnes
    size: 1,
    capacity: 3, // equal to amount of cargo that can be held in tonnes
    heatResistance: 0, // none
    impactResistance: 0, // none
    cost: 500,
    powerDraw: 5,
    heatGenerated: 5
  };
  SpaceSim.Ships.UtilityModules.CargoHold.call(this, options);
};
SpaceSim.Ships.UtilityModules.CargoHolds.Size1.A.prototype = Object.create(SpaceSim.Ships.UtilityModules.CargoHold.prototype);
SpaceSim.Ships.UtilityModules.CargoHolds.Size1.A.prototype.constructor = SpaceSim.Ships.UtilityModules.CargoHolds.Size1.A;
