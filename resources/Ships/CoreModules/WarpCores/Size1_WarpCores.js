var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.WarpCores = SpaceSim.Ships.CoreModules.WarpCores || {};
SpaceSim.Ships.CoreModules.WarpCores.Size1 = SpaceSim.Ships.CoreModules.WarpCores.Size1 || {};
SpaceSim.Ships.CoreModules.WarpCores.Size1.E = function() {
  var options = {
    maximumMass: 50, // tonnes
    maximumFuel: 3, // tonnes
    maximumRange: 5, // lightyears at 0 mass
    mass: 5,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 100,
    powerDraw: 10, // in megaWatts
    activePowerDraw: 40,
    heatGenerated: 15, // in degrees Celcius
    activeHeatGenerated: 30
  };
  SpaceSim.Ships.CoreModules.WarpCore.call(this, options);
};
SpaceSim.Ships.CoreModules.WarpCores.Size1.E.prototype = Object.create(SpaceSim.Ships.CoreModules.WarpCore.prototype);
SpaceSim.Ships.CoreModules.WarpCores.Size1.E.prototype.constructor = SpaceSim.Ships.CoreModules.WarpCores.Size1.E;

SpaceSim.Ships.CoreModules.WarpCores.Size1.C = function() {
  var options = {
    maximumMass: 70, // tonnes
    maximumFuel: 6, // tonnes
    maximumRange: 5, // lightyears at 0 mass
    mass: 7,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 250,
    powerDraw: 15, // in megaWatts
    activePowerDraw: 50,
    heatGenerated: 20, // in degrees Celcius
    activeHeatGenerated: 40
  };
  SpaceSim.Ships.CoreModules.WarpCore.call(this, options);
};
SpaceSim.Ships.CoreModules.WarpCores.Size1.C.prototype = Object.create(SpaceSim.Ships.CoreModules.WarpCore.prototype);
SpaceSim.Ships.CoreModules.WarpCores.Size1.C.prototype.constructor = SpaceSim.Ships.CoreModules.WarpCores.Size1.C;

SpaceSim.Ships.CoreModules.WarpCores.Size1.A = function() {
  var options = {
    maximumMass: 70, // tonnes
    maximumFuel: 6, // tonnes
    maximumRange: 7, // lightyears at 0 mass
    mass: 5,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 1000,
    powerDraw: 15, // in megaWatts
    activePowerDraw: 45,
    heatGenerated: 10, // in degrees Celcius
    activeHeatGenerated: 30
  };
  SpaceSim.Ships.CoreModules.WarpCore.call(this, options);
};
SpaceSim.Ships.CoreModules.WarpCores.Size1.A.prototype = Object.create(SpaceSim.Ships.CoreModules.WarpCore.prototype);
SpaceSim.Ships.CoreModules.WarpCores.Size1.A.prototype.constructor = SpaceSim.Ships.CoreModules.WarpCores.Size1.A;
