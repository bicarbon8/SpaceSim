var SpaceSim = SpaceSim || {};
SpaceSim.coreModules = SpaceSim.coreModules || {};
SpaceSim.coreModules.fuelTanks = SpaceSim.coreModules.fuelTanks || [];
/** Size 1 **/
SpaceSim.addModule({
  name: 'Fuel Tank',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.FuelTank,
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
});

SpaceSim.addModule({
  name: 'Fuel Tank',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.FuelTank,
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
});

SpaceSim.addModule({
  name: 'Fuel Tank',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.FuelTank,
  maxCapacity: 7,
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
});

/** Size 2 **/
SpaceSim.addModule({
  name: 'Fuel Tank',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.FuelTank,
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
});

SpaceSim.addModule({
  name: 'Fuel Tank',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.FuelTank,
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
});

SpaceSim.addModule({
  name: 'Fuel Tank',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.FuelTank,
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
});

/** Size 3 **/
SpaceSim.addModule({
  name: 'Fuel Tank',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.FuelTank,
  maxCapacity: 16,
  mass: 3,
  size: 3,
  class: "E",
  heatResistance: 0,
  impactResistance: 0,
  cost: 2500,
  powerDraw: 0, // in MegaWatts
  activePowerDraw: 0, // in MegaWatts
  heatGenerated: 0, // in degrees Celcius
  activeHeatGenerated: 0
});

SpaceSim.addModule({
  name: 'Fuel Tank',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.FuelTank,
  maxCapacity: 24,
  mass: 5,
  size: 3,
  class: "C",
  heatResistance: 0,
  impactResistance: 0,
  cost: 5000,
  powerDraw: 5, // in MegaWatts
  activePowerDraw: 5, // in MegaWatts
  heatGenerated: 5, // in degrees Celcius
  activeHeatGenerated: 5
});

SpaceSim.addModule({
  name: 'Fuel Tank',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.FuelTank,
  maxCapacity: 32,
  mass: 4,
  size: 3,
  class: "A",
  heatResistance: 0,
  impactResistance: 0,
  cost: 10000,
  powerDraw: 5, // in MegaWatts
  activePowerDraw: 5, // in MegaWatts
  heatGenerated: 2, // in degrees Celcius
  activeHeatGenerated: 2
});