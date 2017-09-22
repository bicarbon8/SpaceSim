var SpaceSim = SpaceSim || {};
SpaceSim.coreModules = SpaceSim.coreModules || {};
SpaceSim.coreModules.warpCores = SpaceSim.coreModules.warpCores || [];
/** Size 1 **/
SpaceSim.coreModules.warpCores.push({
  maximumMass: 50, // tonnes
  maximumFuel: 3, // tonnes
  maximumRange: 5, // lightyears at 0 mass
  mass: 5,
  size: 1,
  class: 'E',
  heatResistance: 0,
  impactResistance: 0,
  cost: 100,
  powerDraw: 10, // in megaWatts
  activePowerDraw: 40,
  heatGenerated: 15, // in degrees Celcius
  activeHeatGenerated: 30
});

SpaceSim.coreModules.warpCores.push({
  maximumMass: 70, // tonnes
  maximumFuel: 6, // tonnes
  maximumRange: 5, // lightyears at 0 mass
  mass: 7,
  size: 1,
  class: 'C',
  heatResistance: 0,
  impactResistance: 0,
  cost: 250,
  powerDraw: 15, // in megaWatts
  activePowerDraw: 50,
  heatGenerated: 20, // in degrees Celcius
  activeHeatGenerated: 40
});

SpaceSim.coreModules.warpCores.push({
  maximumMass: 70, // tonnes
  maximumFuel: 6, // tonnes
  maximumRange: 7, // lightyears at 0 mass
  mass: 5,
  size: 1,
  class: 'A',
  heatResistance: 0,
  impactResistance: 0,
  cost: 1000,
  powerDraw: 15, // in megaWatts
  activePowerDraw: 45,
  heatGenerated: 10, // in degrees Celcius
  activeHeatGenerated: 30
});

/** Size 2 **/
SpaceSim.coreModules.warpCores.push({
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
});
