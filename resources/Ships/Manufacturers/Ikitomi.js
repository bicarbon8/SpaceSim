var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.Manufacturers = SpaceSim.Ships.Manufacturers || {};
SpaceSim.Ships.Manufacturers.Ikitomi = SpaceSim.Ships.Manufacturers.Ikitomi || {};
/**
 * a highly maneuverable, small fighter
 */
SpaceSim.ships.push({
  name: "Spider",
  manufacturer: "Ikitomi",
  mass: 8, // in tonnes
  size: 17,
  heatResistance: 0, // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
  impactResistance: 0, // collisions, bullets / shrapnel resistance: 100% is immune to impacts
  cost: 50000,
  coreModules: {
    generatorMaxSize: 1,
    generator: SpaceSim.getCoreModule('generator', 1, 'E'),
    thrustersMaxSize: 2,
    thrusters: SpaceSim.getCoreModule('thrusters', 1, 'E'),
    warpCoreMaxSize: 1,
    warpCore: SpaceSim.getCoreModule('warpCore', 1, 'E'),
    lifeSupportMaxSize: 1,
    lifeSupport: SpaceSim.getCoreModule('lifeSupport', 1, 'E'),
    capacitorMaxSize: 3,
    capacitor: SpaceSim.getCoreModule('capacitor', 1, 'E'),
    fuelTankMaxSize: 1,
    fuelTank: SpaceSim.getCoreModule('fuelTank', 1, 'E')
  },
  weaponModules: {
    smallCount: 2,
    mediumCount: 0,
    largeCount: 0
  },
  defenseModules: {
    size: 2
  },
  utilityModules: {
    size: 4
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
