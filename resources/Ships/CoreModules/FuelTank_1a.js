var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.FuelTank_1a = function() {
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
  SpaceSim.Ships.FuelTank.call(this, options);
};
SpaceSim.Ships.FuelTank_1a.prototype = Object.create(SpaceSim.Ships.Module.prototype);
SpaceSim.Ships.FuelTank_1a.prototype.constructor = SpaceSim.Ships.FuelTank_1a;
