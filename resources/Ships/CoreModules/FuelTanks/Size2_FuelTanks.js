var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.FuelTanks = SpaceSim.Ships.CoreModules.FuelTanks || {};
SpaceSim.Ships.CoreModules.FuelTanks.Size2 = SpaceSim.Ships.CoreModules.FuelTanks.Size2 || {};
SpaceSim.Ships.CoreModules.FuelTanks.Size2.E = function() {
  var options = {
    maxCapacity: 8,
    mass: 2,
    size: 2,
    heatResistance: 0,
    impactResistance: 0,
    cost: 500,
    powerDraw: 0, // in MegaWatts
    activePowerDraw: 0, // in MegaWatts
    heatGenerated: 0, // in degrees Celcius
    activeHeatGenerated: 0
  };
  SpaceSim.Ships.CoreModules.FuelTank.call(this, options);
};
SpaceSim.Ships.CoreModules.FuelTanks.Size2.E.prototype = Object.create(SpaceSim.Ships.CoreModules.FuelTank.prototype);
SpaceSim.Ships.CoreModules.FuelTanks.Size2.E.prototype.constructor = SpaceSim.Ships.CoreModules.FuelTanks.Size2.E;

SpaceSim.Ships.CoreModules.FuelTanks.Size2.C = function() {
  var options = {
    maxCapacity: 12,
    mass: 4,
    size: 2,
    heatResistance: 0,
    impactResistance: 0,
    cost: 1000,
    powerDraw: 5, // in MegaWatts
    activePowerDraw: 5, // in MegaWatts
    heatGenerated: 5, // in degrees Celcius
    activeHeatGenerated: 5
  };
  SpaceSim.Ships.CoreModules.FuelTank.call(this, options);
};
SpaceSim.Ships.CoreModules.FuelTanks.Size2.C.prototype = Object.create(SpaceSim.Ships.CoreModules.FuelTank.prototype);
SpaceSim.Ships.CoreModules.FuelTanks.Size2.C.prototype.constructor = SpaceSim.Ships.CoreModules.FuelTanks.Size2.C;

SpaceSim.Ships.CoreModules.FuelTanks.Size2.A = function() {
  var options = {
    maxCapacity: 16,
    mass: 3,
    size: 2,
    heatResistance: 0,
    impactResistance: 0,
    cost: 2500,
    powerDraw: 5, // in MegaWatts
    activePowerDraw: 5, // in MegaWatts
    heatGenerated: 2, // in degrees Celcius
    activeHeatGenerated: 2
  };
  SpaceSim.Ships.CoreModules.FuelTank.call(this, options);
};
SpaceSim.Ships.CoreModules.FuelTanks.Size2.A.prototype = Object.create(SpaceSim.Ships.CoreModules.FuelTank.prototype);
SpaceSim.Ships.CoreModules.FuelTanks.Size2.A.prototype.constructor = SpaceSim.Ships.CoreModules.FuelTanks.Size2.A;
