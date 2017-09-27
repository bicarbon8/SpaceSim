var SpaceSim = SpaceSim || {};
SpaceSim.utilityModules = SpaceSim.utilityModules || {};
SpaceSim.utilityModules.cargoHolds = SpaceSim.utilityModules.cargoHolds || [];
/** Size 1 **/
SpaceSim.addModule({
  name: 'Cargo Hold',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.CargoHold,
  mass: 1, // in tonnes
  size: 1,
  class: "E",
  capacity: 1, // equal to amount of cargo that can be held in tonnes
  unpoweredCapacity: 1,
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 100,
  powerDraw: 0,
  heatGenerated: 0
});

SpaceSim.addModule({
  name: 'Cargo Hold',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.CargoHold,
  mass: 2, // in tonnes
  size: 1,
  class: "C",
  capacity: 2, // equal to amount of cargo that can be held in tonnes
  unpoweredCapacity: 1,
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 250,
  powerDraw: 5,
  heatGenerated: 5
});

SpaceSim.addModule({
  name: 'Cargo Hold',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.CargoHold,
  mass: 1, // in tonnes
  size: 1,
  capacity: 3, // equal to amount of cargo that can be held in tonnes
  unpoweredCapacity: 1,
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 500,
  powerDraw: 5,
  heatGenerated: 5
});

/** Size 2 **/
SpaceSim.addModule({
  name: 'Cargo Hold',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.CargoHold,
  mass: 2, // in tonnes
  size: 2,
  class: "E",
  capacity: 2, // equal to amount of cargo that can be held in tonnes
  unpoweredCapacity: 2,
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 250,
  powerDraw: 0,
  heatGenerated: 0
});

/** Size 5 **/
SpaceSim.addModule({
  name: 'Cargo Hold',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.CargoHold,
  mass: 5, // in tonnes
  size: 5,
  class: "E",
  capacity: 5, // equal to amount of cargo that can be held in tonnes
  unpoweredCapacity: 5,
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 5000,
  powerDraw: 0,
  heatGenerated: 0
});

SpaceSim.addModule({
  name: 'Cargo Hold',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.CargoHold,
  mass: 10, // in tonnes
  size: 5,
  class: "C",
  capacity: 10, // equal to amount of cargo that can be held in tonnes
  unpoweredCapacity: 5,
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 10000,
  powerDraw: 10,
  heatGenerated: 10
});

SpaceSim.addModule({
  name: 'Cargo Hold',
  type: SpaceSim.ModuleTypes.Utility,
  subType: SpaceSim.ModuleSubTypes.CargoHold,
  mass: 1, // in tonnes
  size: 5,
  class: "A",
  capacity: 10, // equal to amount of cargo that can be held in tonnes
  unpoweredCapacity: 5,
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 500000,
  powerDraw: 10,
  heatGenerated: 5
});
