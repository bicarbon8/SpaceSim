var SpaceSim = SpaceSim || {};
/** Size 1 **/
SpaceSim.addModule({
  name: 'Hull Plating',
  type: SpaceSim.ModuleTypes.Defense,
  subType: SpaceSim.ModuleSubTypes.HullPlating,
  mass: 10, // in tonnes
  size: 1,
  class: "E",
  heatResistance: 0.05, // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
  impactResistance: 0.07, // collisions, bullets / shrapnel resistance: 100% is immune to impacts
  cost: 1000,
  powerDraw: 0, // in megaWatts
  heatGenerated: 0 // in degrees Celcius
});
SpaceSim.addModule({
  name: 'Hull Plating',
  type: SpaceSim.ModuleTypes.Defense,
  subType: SpaceSim.ModuleSubTypes.HullPlating,
  mass: 20, // in tonnes
  size: 1,
  class: "C",
  heatResistance: 0.05, // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
  impactResistance: 0.1, // collisions, bullets / shrapnel resistance: 100% is immune to impacts
  cost: 3000,
  powerDraw: 0, // in megaWatts
  heatGenerated: 0 // in degrees Celcius
});
SpaceSim.addModule({
  name: 'Hull Plating',
  type: SpaceSim.ModuleTypes.Defense,
  subType: SpaceSim.ModuleSubTypes.HullPlating,
  mass: 15, // in tonnes
  size: 1,
  class: "A",
  heatResistance: 0.07, // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
  impactResistance: 0.15, // collisions, bullets / shrapnel resistance: 100% is immune to impacts
  cost: 5000,
  powerDraw: 0, // in megaWatts
  heatGenerated: 0 // in degrees Celcius
});
