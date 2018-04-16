var SpaceSim = SpaceSim || {};
/** Size 1 **/
SpaceSim.addModule({
  name: 'Spatial Interferometer',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.SpatialInterferometer,
  mass: 0.1, // in tonnes
  size: 1,
  class: "E",
  range: 100, // between Jupiter and Saturn
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 1000,
  powerDraw: 1,
  activePowerDraw: 5,
  heatGenerated: 1,
  activeHeatGenerated: 2
});
SpaceSim.addModule({
  name: 'Spatial Interferometer',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.SpatialInterferometer,
  mass: 0.5, // in tonnes
  size: 1,
  class: "D",
  range: 1500, // almost to the heliopause
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 10000,
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
  range: 525600, // one lightyear
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 250000,
  powerDraw: 2,
  activePowerDraw: 9,
  heatGenerated: 1,
  activeHeatGenerated: 4
});
SpaceSim.addModule({
  name: 'Spatial Interferometer',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.SpatialInterferometer,
  mass: 5, // in tonnes
  size: 1,
  class: "B",
  range: 5256000, // 10 lightyears
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
  mass: 10, // in tonnes
  size: 1,
  class: "A",
  range: 52560000, // 100 lightyears
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 50000000,
  powerDraw: 2,
  activePowerDraw: 15,
  heatGenerated: 1,
  activeHeatGenerated: 9
});
