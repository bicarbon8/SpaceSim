var SpaceSim = SpaceSim || {};
SpaceSim.coreModules = SpaceSim.coreModules || {};
SpaceSim.coreModules.thrusters = SpaceSim.coreModules.thrusters || [];
SpaceSim.coreModules.thrusters.push({
  thrust: 100, // kN
  mass: 5,
  size: 1,
  class: "E",
  heatResistance: 0,
  impactResistance: 0,
  cost: 100,
  powerDraw: 10, // in megaWatts
  activePowerDraw: 30,
  heatGenerated: 5, // in degrees Celcius
  activeHeatGenerated: 10
});
