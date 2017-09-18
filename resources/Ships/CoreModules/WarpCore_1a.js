var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.WarpCore_1a = function() {
  var options = {
    maximumMass: 20, // tonnes
    maximumFuel: 1,
    maximumRange: 10, // lightyears at 0 mass
    mass: 5,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 100,
    powerDraw: 40, // in megaWatts
    heatGenerated: 15 // in degrees Celcius
  };
  SpaceSim.Ships.CoreModules.WarpCore.call(this, options);
};
SpaceSim.Ships.CoreModules.WarpCore_1a.prototype = Object.create(SpaceSim.Ships.CoreModules.WarpCore.prototype);
SpaceSim.Ships.CoreModules.WarpCore_1a.prototype.constructor = SpaceSim.Ships.CoreModules.WarpCore_1a;
