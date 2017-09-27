var SpaceSim = SpaceSim || {};
SpaceSim.coreModules = SpaceSim.coreModules || {};
SpaceSim.coreModules.lifeSupports = SpaceSim.coreModules.lifeSupports || [];
SpaceSim.addModule({
  name: 'Life Support',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.LifeSupport,
  time: 2, // minutes
  mass: 1,
  size: 1,
  class: "E",
  heatResistance: 0,
  impactResistance: 0,
  cost: 100,
  powerDraw: 5, // in megaWatts
  activePowerDraw: 5,
  heatGenerated: 3, // in degrees Celcius
  activeHeatGenerated: 3
});
