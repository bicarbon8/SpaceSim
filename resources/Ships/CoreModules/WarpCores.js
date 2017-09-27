var SpaceSim = SpaceSim || {};
SpaceSim.coreModules = SpaceSim.coreModules || {};
SpaceSim.coreModules.warpCores = SpaceSim.coreModules.warpCores || [];
/** Size 1 **/
SpaceSim.addModule({
  name: 'Warp Core',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.WarpCore,
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

SpaceSim.addModule({
  name: 'Warp Core',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.WarpCore,
  maximumMass: 70, // tonnes
  maximumFuel: 4, // tonnes
  maximumRange: 10, // lightyears at 0 mass
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

SpaceSim.addModule({
  name: 'Warp Core',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.WarpCore,
  maximumMass: 70, // tonnes
  maximumFuel: 5, // tonnes
  maximumRange: 15, // lightyears at 0 mass
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
SpaceSim.addModule({
  name: 'Warp Core',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.WarpCore,
  maximumMass: 100, // tonnes
  maximumFuel: 8, // tonnes
  maximumRange: 10, // lightyears at 0 mass
  mass: 10,
  size: 2,
  class: "E",
  heatResistance: 0,
  impactResistance: 0,
  cost: 2500,
  powerDraw: 25, // in megaWatts
  activePowerDraw: 60,
  heatGenerated: 25, // in degrees Celcius
  activeHeatGenerated: 45
});

SpaceSim.addModule({
  name: 'Warp Core',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.WarpCore,
  maximumMass: 150, // tonnes
  maximumFuel: 9, // tonnes
  maximumRange: 15, // lightyears at 0 mass
  mass: 15,
  size: 2,
  class: "C",
  heatResistance: 0,
  impactResistance: 0,
  cost: 5000,
  powerDraw: 35, // in megaWatts
  activePowerDraw: 70,
  heatGenerated: 30, // in degrees Celcius
  activeHeatGenerated: 55
});

SpaceSim.addModule({
  name: 'Warp Core',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.WarpCore,
  maximumMass: 100, // tonnes
  maximumFuel: 10, // tonnes
  maximumRange: 20, // lightyears at 0 mass
  mass: 12,
  size: 2,
  class: "A",
  heatResistance: 0,
  impactResistance: 0,
  cost: 10000,
  powerDraw: 35, // in megaWatts
  activePowerDraw: 65,
  heatGenerated: 20, // in degrees Celcius
  activeHeatGenerated: 45
});
