var SpaceSim = SpaceSim || {};
SpaceSim.coreModules = SpaceSim.coreModules || {};
SpaceSim.coreModules.fuelTanks = SpaceSim.coreModules.fuelTanks || [];
/** Size 1 **/
SpaceSim.coreModules.fuelTanks.push({
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

SpaceSim.coreModules.fuelTanks.push({
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

SpaceSim.coreModules.fuelTanks.push({
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
SpaceSim.coreModules.fuelTanks.push({
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

SpaceSim.coreModules.fuelTanks.push({
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

SpaceSim.coreModules.fuelTanks.push({
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
