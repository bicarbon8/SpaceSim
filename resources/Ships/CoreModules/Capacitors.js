var SpaceSim = SpaceSim || {};
SpaceSim.addModule({
  name: 'Capacitor',
  type: SpaceSim.ModuleTypes.Core,
  subType: SpaceSim.ModuleSubTypes.Capacitor,
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
