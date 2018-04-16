var SpaceSim = SpaceSim || {};
SpaceSim.coreModules = SpaceSim.coreModules || {};
SpaceSim.coreModules.warpCores = SpaceSim.coreModules.warpCores || [];
/** Size 1 **/
SpaceSim.addModule({
  name: 'Warp Core',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.WarpCore,
  maximumMass: 40,     // tonnes
  optimalMass: 20, // tonnes
  fuelPerLightYear: 1, // tonnes consumed per LY
  mass: 1,
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
  maximumMass: 50,     // tonnes
  optimalMass: 40, // tonnes
  fuelPerLightYear: 1.5, // tonnes consumed per LY
  mass: 1.5,
  size: 1,
  class: 'C',
  heatResistance: 0,
  impactResistance: 0,
  cost: 250,
  powerDraw: 10, // in megaWatts
  activePowerDraw: 40,
  heatGenerated: 5, // in degrees Celcius
  activeHeatGenerated: 25
});

SpaceSim.addModule({
  name: 'Warp Core',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.WarpCore,
  maximumMass: 50,     // tonnes
  optimalMass: 40, // tonnes
  fuelPerLightYear: 1, // tonnes consumed per LY
  mass: 0.9,
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
  maximumMass: 90, // tonnes
  optimalMass: 45, // tonnes
  fuelPerLightYear: 2, // tonnes consumed per LY
  mass: 2,
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
  maximumMass: 100, // tonnes
  optimalMass: 85, // tonnes
  fuelPerLightYear: 3, // tonnes consumed per LY
  mass: 3,
  size: 2,
  class: "C",
  heatResistance: 0,
  impactResistance: 0,
  cost: 5000,
  powerDraw: 30, // in megaWatts
  activePowerDraw: 60,
  heatGenerated: 15, // in degrees Celcius
  activeHeatGenerated: 40
});

SpaceSim.addModule({
  name: 'Warp Core',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.WarpCore,
  maximumMass: 100, // tonnes
  optimalMass: 85, // tonnes
  fuelPerLightYear: 2, // tonnes consumed per LY
  mass: 1.8,
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
