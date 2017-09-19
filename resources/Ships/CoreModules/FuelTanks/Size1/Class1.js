var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.FuelTanks = SpaceSim.Ships.CoreModules.FuelTanks || {};
SpaceSim.Ships.CoreModules.FuelTanks.Size1 = SpaceSim.Ships.CoreModules.FuelTanks.Size1 || {};
SpaceSim.Ships.CoreModules.FuelTanks.Size1.Class1 = function() {
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
SpaceSim.Ships.CoreModules.FuelTanks.Size1.Class1.prototype = Object.create(SpaceSim.Ships.CoreModules.FuelTank.prototype);
SpaceSim.Ships.CoreModules.FuelTanks.Size1.Class1.prototype.constructor = SpaceSim.Ships.CoreModules.FuelTanks.Size1.Class1;
