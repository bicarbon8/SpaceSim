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
    class: "E",
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
SpaceSim.coreModules.fuelTanks.push(new SpaceSim.Ships.CoreModules.FuelTanks.Size1.E());

SpaceSim.Ships.CoreModules.FuelTanks.Size1.C = function() {
  var options = {
    maxCapacity: 6,
    mass: 2,
    size: 1,
    class: "C",
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
SpaceSim.coreModules.fuelTanks.push(new SpaceSim.Ships.CoreModules.FuelTanks.Size1.C());

SpaceSim.Ships.CoreModules.FuelTanks.Size1.A = function() {
  var options = {
    maxCapacity: 8,
    mass: 1,
    size: 1,
    class: "A",
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
SpaceSim.coreModules.fuelTanks.push(new SpaceSim.Ships.CoreModules.FuelTanks.Size1.A());

SpaceSim.Ships.CoreModules.FuelTanks.Size2 = SpaceSim.Ships.CoreModules.FuelTanks.Size2 || {};
SpaceSim.Ships.CoreModules.FuelTanks.Size2.E = function() {
  var options = {
    name: "2E",
    maxCapacity: 8,
    mass: 2,
    size: 2,
    class: "E",
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
SpaceSim.coreModules.fuelTanks.push(new SpaceSim.Ships.CoreModules.FuelTanks.Size2.E());

SpaceSim.Ships.CoreModules.FuelTanks.Size2.C = function() {
  var options = {
    name: "2C",
    maxCapacity: 12,
    mass: 4,
    size: 2,
    class: "C",
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
SpaceSim.coreModules.fuelTanks.push(new SpaceSim.Ships.CoreModules.FuelTanks.Size2.C());

SpaceSim.Ships.CoreModules.FuelTanks.Size2.A = function() {
  var options = {
    maxCapacity: 16,
    mass: 3,
    size: 2,
    class: "A",
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
SpaceSim.coreModules.fuelTanks.push(new SpaceSim.Ships.CoreModules.FuelTanks.Size2.A());
