var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules.FuelTank_1a = function() {
  var options = {
    maxCapacity: 4,
    mass: 1,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 100,
    powerDraw: 0, // in megaWatts
    heatGenerated: 0 // in degrees Celcius
  };
  SpaceSim.Ships.CoreModules.FuelTank.call(this, options);
};
SpaceSim.Ships.CoreModules.FuelTank_1a.prototype = Object.create(SpaceSim.Ships.CoreModules.FuelTank.prototype);
SpaceSim.Ships.CoreModules.FuelTank_1a.prototype.constructor = SpaceSim.Ships.CoreModules.FuelTank_1a;
