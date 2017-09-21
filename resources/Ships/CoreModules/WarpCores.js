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
    class: "E",
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
SpaceSim.coreModules.warpCores.push(new SpaceSim.Ships.CoreModules.WarpCores.Size1.E());

SpaceSim.Ships.CoreModules.WarpCores.Size1.C = function() {
  var options = {
    maximumMass: 70, // tonnes
    maximumFuel: 6, // tonnes
    maximumRange: 5, // lightyears at 0 mass
    mass: 7,
    size: 1,
    class: "C",
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
SpaceSim.coreModules.warpCores.push(new SpaceSim.Ships.CoreModules.WarpCores.Size1.C());

SpaceSim.Ships.CoreModules.WarpCores.Size1.A = function() {
  var options = {
    maximumMass: 70, // tonnes
    maximumFuel: 6, // tonnes
    maximumRange: 7, // lightyears at 0 mass
    mass: 5,
    size: 1,
    class: "A",
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
SpaceSim.coreModules.warpCores.push(new SpaceSim.Ships.CoreModules.WarpCores.Size1.A());

SpaceSim.Ships.CoreModules.WarpCores.Size2 = SpaceSim.Ships.CoreModules.WarpCores.Size2 || {};
SpaceSim.Ships.CoreModules.WarpCores.Size2.E = function() {
  var options = {
    maximumMass: 100, // tonnes
    maximumFuel: 10, // tonnes
    maximumRange: 10, // lightyears at 0 mass
    mass: 10,
    size: 2,
    class: "E",
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
SpaceSim.coreModules.warpCores.push(new SpaceSim.Ships.CoreModules.WarpCores.Size2.E());
