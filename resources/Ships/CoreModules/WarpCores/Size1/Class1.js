var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.WarpCores = SpaceSim.Ships.CoreModules.WarpCores || {};
SpaceSim.Ships.CoreModules.WarpCores.Size1 = SpaceSim.Ships.CoreModules.WarpCores.Size1 || {};
SpaceSim.Ships.CoreModules.WarpCores.Size1.Class1 = function() {
  var options = {
    maximumMass: 40, // tonnes
    maximumFuel: 3, // tonnes
    maximumRange: 30, // lightyears at 0 mass
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
SpaceSim.Ships.CoreModules.WarpCores.Size1.Class1.prototype = Object.create(SpaceSim.Ships.CoreModules.WarpCore.prototype);
SpaceSim.Ships.CoreModules.WarpCores.Size1.Class1.prototype.constructor = SpaceSim.Ships.CoreModules.WarpCores.Size1.Class1;
