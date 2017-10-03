var SpaceSim = SpaceSim || {};
/** Size 1 **/
SpaceSim.addModule({
  name: 'Machine Gun',
  type: SpaceSim.ModuleTypes.Weapon,
  subType: SpaceSim.ModuleSubTypes.MachineGun,
  mass: 1, // in tonnes
  size: 1,
  class: "E",
  maxAmmo: 100,
  maxChambered: 10,
  reloadDelay: 15,
  heatDamage: 0,
  impactDamage: 0.1,
  heatResistance: 0, // none
  impactResistance: 0, // none
  cost: 100,
  powerDraw: 1,
  heatGenerated: 0,
  activePowerDraw: 5,
  activeHeatGenerated: 20
});
