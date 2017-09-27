var SpaceSim = SpaceSim || {};
SpaceSim.addModule({
  name: 'Hull Plating',
  type: SpaceSim.ModuleTypes.Defense,
  subType: SpaceSim.ModuleSubTypes.HullPlating,
  mass: 10, // in tonnes
  size: 1,
  class: "E",
  heatResistance: 1, // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
  impactResistance: 1, // collisions, bullets / shrapnel resistance: 100% is immune to impacts
  cost: 1000,
  powerDraw: 0, // in megaWatts
  heatGenerated: 0 // in degrees Celcius
});
