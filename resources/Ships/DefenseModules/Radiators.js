var SpaceSim = SpaceSim || {};
/** Size 1 **/
SpaceSim.addModule({
  name: 'Radiator',
  type: SpaceSim.ModuleTypes.Defense,
  subType: SpaceSim.ModuleSubTypes.Radiator,
  mass: 2, // in tonnes
  size: 1,
  class: "E",
  heatResistance: 0.1, // (10%)
  impactResistance: 0, // none
  cost: 100,
  powerDraw: 0,
  heatGenerated: -5,
  activePowerDraw: 0,
  activeHeatGenerated: -15 // dissapates heat
});
SpaceSim.addModule({
  name: 'Radiator',
  type: SpaceSim.ModuleTypes.Defense,
  subType: SpaceSim.ModuleSubTypes.Radiator,
  mass: 4, // in tonnes
  size: 1,
  class: "C",
  heatResistance: 0.15, // (15%)
  impactResistance: 0, // none
  cost: 250,
  powerDraw: 0,
  heatGenerated: -7,
  activePowerDraw: 0,
  activeHeatGenerated: -17 // dissapates heat
});
SpaceSim.addModule({
  name: 'Radiator',
  type: SpaceSim.ModuleTypes.Defense,
  subType: SpaceSim.ModuleSubTypes.Radiator,
  mass: 2, // in tonnes
  size: 1,
  class: "A",
  heatResistance: 0.15, // (15%)
  impactResistance: 0, // none
  cost: 1000,
  powerDraw: 0,
  heatGenerated: -7,
  activePowerDraw: 0,
  activeHeatGenerated: -17 // dissapates heat
});
/** Size 2 **/
SpaceSim.addModule({
  name: 'Radiator',
  type: SpaceSim.ModuleTypes.Defense,
  subType: SpaceSim.ModuleSubTypes.Radiator,
  mass: 4, // in tonnes
  size: 2,
  class: "E",
  heatResistance: 0.1, // (10%)
  impactResistance: 0, // none
  cost: 2500,
  powerDraw: 0,
  heatGenerated: -10,
  activePowerDraw: 0,
  activeHeatGenerated: -20 // dissapates heat
});
