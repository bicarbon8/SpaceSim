var SpaceSim = SpaceSim || {};
/** Size 1 **/
SpaceSim.addModule({
  name: 'Spatial Interferometer',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.SpatialInterferometer,
  mass: 0, // in tonnes
  size: 1,
  class: "E",
  range: 100, // between Jupiter and Saturn
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 100,
  powerDraw: 1,
  activePowerDraw: 5,
  heatGenerated: 1,
  activeHeatGenerated: 2
});
SpaceSim.addModule({
  name: 'Spatial Interferometer',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.SpatialInterferometer,
  mass: 0, // in tonnes
  size: 1,
  class: "D",
  range: 500, // past Pluto
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 500,
  powerDraw: 2,
  activePowerDraw: 8,
  heatGenerated: 1,
  activeHeatGenerated: 3
});
SpaceSim.addModule({
  name: 'Spatial Interferometer',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.SpatialInterferometer,
  mass: 1, // in tonnes
  size: 1,
  class: "C",
  range: 1500, // almost to the Heliopause
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 1500,
  powerDraw: 2,
  activePowerDraw: 9,
  heatGenerated: 1,
  activeHeatGenerated: 4
});
SpaceSim.addModule({
  name: 'Spatial Interferometer',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.SpatialInterferometer,
  mass: 2, // in tonnes
  size: 1,
  class: "B",
  range: 525600, // one lightyear
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 1000000,
  powerDraw: 2,
  activePowerDraw: 10,
  heatGenerated: 1,
  activeHeatGenerated: 5
});
SpaceSim.addModule({
  name: 'Spatial Interferometer',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.SpatialInterferometer,
  mass: 2, // in tonnes
  size: 1,
  class: "A",
  range: 5256000, // 10 lightyears
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 10000000,
  powerDraw: 2,
  activePowerDraw: 15,
  heatGenerated: 1,
  activeHeatGenerated: 9
});
