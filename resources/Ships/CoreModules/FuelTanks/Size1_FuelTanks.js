var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.FuelTanks = SpaceSim.Ships.CoreModules.FuelTanks || {};
SpaceSim.Ships.CoreModules.FuelTanks.Size1 = SpaceSim.Ships.CoreModules.FuelTanks.Size1 || {};
SpaceSim.Ships.CoreModules.FuelTanks.Size1.E = function() {
  var options = {
    maxCapacity: 4,
    mass: 1,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 100,
    powerDraw: 0, // in MegaWatts
    activePowerDraw: 0, // in MegaWatts
    heatGenerated: 0, // in degrees Celcius
    activeHeatGenerated: 0
  };
  SpaceSim.Ships.CoreModules.FuelTank.call(this, options);
};
SpaceSim.Ships.CoreModules.FuelTanks.Size1.E.prototype = Object.create(SpaceSim.Ships.CoreModules.FuelTank.prototype);
SpaceSim.Ships.CoreModules.FuelTanks.Size1.E.prototype.constructor = SpaceSim.Ships.CoreModules.FuelTanks.Size1.E;

SpaceSim.Ships.CoreModules.FuelTanks.Size1.C = function() {
  var options = {
    maxCapacity: 6,
    mass: 2,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 200,
    powerDraw: 1, // in MegaWatts
    activePowerDraw: 1, // in MegaWatts
    heatGenerated: 1, // in degrees Celcius
    activeHeatGenerated: 1
  };
  SpaceSim.Ships.CoreModules.FuelTank.call(this, options);
};
SpaceSim.Ships.CoreModules.FuelTanks.Size1.C.prototype = Object.create(SpaceSim.Ships.CoreModules.FuelTank.prototype);
SpaceSim.Ships.CoreModules.FuelTanks.Size1.C.prototype.constructor = SpaceSim.Ships.CoreModules.FuelTanks.Size1.C;

SpaceSim.Ships.CoreModules.FuelTanks.Size1.A = function() {
  var options = {
    maxCapacity: 8,
    mass: 1,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 400,
    powerDraw: 4, // in MegaWatts
    activePowerDraw: 4, // in MegaWatts
    heatGenerated: 1, // in degrees Celcius
    activeHeatGenerated: 1
  };
  SpaceSim.Ships.CoreModules.FuelTank.call(this, options);
};
SpaceSim.Ships.CoreModules.FuelTanks.Size1.A.prototype = Object.create(SpaceSim.Ships.CoreModules.FuelTank.prototype);
SpaceSim.Ships.CoreModules.FuelTanks.Size1.A.prototype.constructor = SpaceSim.Ships.CoreModules.FuelTanks.Size1.A;
