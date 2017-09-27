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

SpaceSim.coreModules.thrusters.push({
  thrust: 200, // kN
  mass: 10,
  size: 2,
  class: "E",
  heatResistance: 0,
  impactResistance: 0,
  cost: 250,
  powerDraw: 20, // in megaWatts
  activePowerDraw: 50,
  heatGenerated: 10, // in degrees Celcius
  activeHeatGenerated: 30
});
