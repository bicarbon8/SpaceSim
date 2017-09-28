var SpaceSim = SpaceSim || {};
/**
 * a highly maneuverable, small fighter
 */
SpaceSim.addModule({
  name: "Spider",
  type: SpaceSim.ModuleTypes.Ship,
  manufacturer: "Ikitomi",
  mass: 8, // in tonnes
  size: 17,
  heatResistance: 0, // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
  impactResistance: 0, // collisions, bullets / shrapnel resistance: 100% is immune to impacts
  cost: 50000,
  coreModules: {
    generatorMaxSize: 1,
    generator: SpaceSim.getCoreModule(SpaceSim.ModuleSubTypes.Generator, 1, 'E'),
    thrustersMaxSize: 2,
    thrusters: SpaceSim.getCoreModule(SpaceSim.ModuleSubTypes.Thrusters, 1, 'E'),
    warpCoreMaxSize: 1,
    warpCore: SpaceSim.getCoreModule(SpaceSim.ModuleSubTypes.WarpCore, 1, 'E'),
    lifeSupportMaxSize: 1,
    lifeSupport: SpaceSim.getCoreModule(SpaceSim.ModuleSubTypes.LifeSupport, 1, 'E'),
    capacitorMaxSize: 3,
    capacitor: SpaceSim.getCoreModule(SpaceSim.ModuleSubTypes.Capacitor, 1, 'E'),
    fuelTankMaxSize: 1,
    fuelTank: SpaceSim.getCoreModule(SpaceSim.ModuleSubTypes.FuelTank, 1, 'E')
  },
  weaponModules: {
    smallCount: 2,
    mediumCount: 0,
    largeCount: 0
  },
  defenseModules: {
    size: 4
  },
  utilityModules: {
    size: 2
  },
  pitchMultiplier: 0.75, // 3/4 of max thrust
  yawMultiplier: 0.5,
  rollMultiplier: 0.5,
  forwardThrustMultiplier: 1,
  reverseThrustMultiplier: 0.8,
  upThrustMultiplier: 0.5,
  downThrustMultiplier: 0.5,
  leftThrustMultiplier: 0.5,
  rightThrustMultiplier: 0.5
});
