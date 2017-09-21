var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.WarpCores = SpaceSim.Ships.CoreModules.WarpCores || {};
SpaceSim.Ships.CoreModules.WarpCores.Size2 = SpaceSim.Ships.CoreModules.WarpCores.Size2 || {};
SpaceSim.Ships.CoreModules.WarpCores.Size2.E = function() {
  var options = {
    maximumMass: 100, // tonnes
    maximumFuel: 10, // tonnes
    maximumRange: 10, // lightyears at 0 mass
    mass: 10,
    size: 2,
    heatResistance: 0,
    impactResistance: 0,
    cost: 1000,
    powerDraw: 25, // in megaWatts
    activePowerDraw: 60,
    heatGenerated: 25, // in degrees Celcius
    activeHeatGenerated: 45
  };
  SpaceSim.Ships.CoreModules.WarpCore.call(this, options);
};
SpaceSim.Ships.CoreModules.WarpCores.Size2.E.prototype = Object.create(SpaceSim.Ships.CoreModules.WarpCore.prototype);
SpaceSim.Ships.CoreModules.WarpCores.Size2.E.prototype.constructor = SpaceSim.Ships.CoreModules.WarpCores.Size2.E;
