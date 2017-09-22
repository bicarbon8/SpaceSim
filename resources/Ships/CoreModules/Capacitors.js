var SpaceSim = SpaceSim || {};
SpaceSim.coreModules = SpaceSim.coreModules || {};
SpaceSim.coreModules.capacitors = SpaceSim.coreModules.capacitors || [];
SpaceSim.coreModules.capacitors.push({
  boostPower: 1,
  boostTime: 10, // seconds
  rechargeTime: 60, // seconds
  mass: 2,
  size: 1,
  class: "E",
  heatResistance: 0,
  impactResistance: 0,
  cost: 100,
  powerDraw: 10, // in megaWatts
  activePowerDraw: 0,
  heatGenerated: 5, // degrees Celcius
  activeHeatGenerated: 30
});
