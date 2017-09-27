var SpaceSim = SpaceSim || {};
/**
 * the bicycle messenger equivalent of spaceships... minimal weapons, but
 * extremely small and maneuverable so it can get in and around quickly.
 */
SpaceSim.ships.push({
  name: "Bote",
  manufacturer: "Hopfer Branchen",
  mass: 10, // in tonnes
  size: 12,
  heatResistance: 0.15, // lazer weapon, ship overheating and star proximity resistance: 1 (100%) is immune to heat
  impactResistance: 0.15, // collisions, bullets / shrapnel resistance: 1 (100%) is immune to impacts
  cost: 25000,
  coreModules: {
    generatorMaxSize: 1,
    generator: SpaceSim.getCoreModule('generator', 1, 'E'),
    thrustersMaxSize: 1,
    thrusters: SpaceSim.getCoreModule('thrusters', 1, 'E'),
    warpCoreMaxSize: 2,
    warpCore: SpaceSim.getCoreModule('warpCore', 2, 'E'),
    lifeSupportMaxSize: 1,
    lifeSupport: SpaceSim.getCoreModule('lifeSupport', 1, 'E'),
    capacitorMaxSize: 1,
    capacitor: SpaceSim.getCoreModule('capacitor', 1, 'E'),
    fuelTankMaxSize: 2,
    fuelTank: SpaceSim.getCoreModule('fuelTank', 2, 'E')
  },
  weaponModules: {
    smallCount: 1,
    mediumCount: 0,
    largeCount: 0
  },
  defenseModules: {
    size: 1
  },
  utilityModules: {
    size: 2,
    modules: [SpaceSim.getUtilityModule('cargoHold', 1, 'E')]
  },
  pitchMultiplier: 0.5, // half of max thrust
  yawMultiplier: 0.5,
  rollMultiplier: 0.1,
  forwardThrustMultiplier: 1,
  reverseThrustMultiplier: 1,
  upThrustMultiplier: 0.2,
  downThrustMultiplier: 0.2,
  leftThrustMultiplier: 0.2,
  rightThrustMultiplier: 0.2,
});

/**
 * a small, but capable cargo carrier
 */
SpaceSim.ships.push({
  name: "Frachtschiff",
  manufacturer: "Hopfer Branchen",
  mass: 20, // in tonnes
  size: 20,
  heatResistance: 0, // lazer weapon, ship overheating and star proximity resistance: 1 (100%) is immune to heat
  impactResistance: 0.15, // collisions, bullets / shrapnel resistance: 1 (100%) is immune to impacts
  cost: 50000,
  coreModules: {
    generatorMaxSize: 2,
    generator: SpaceSim.getCoreModule('generator', 2, 'E'),
    thrustersMaxSize: 2,
    thrusters: SpaceSim.getCoreModule('thrusters', 2, 'E'),
    warpCoreMaxSize: 2,
    warpCore: SpaceSim.getCoreModule('warpCore', 2, 'E'),
    lifeSupportMaxSize: 1,
    lifeSupport: SpaceSim.getCoreModule('lifeSupport', 1, 'E'),
    capacitorMaxSize: 1,
    capacitor: SpaceSim.getCoreModule('capacitor', 1, 'E'),
    fuelTankMaxSize: 2,
    fuelTank: SpaceSim.getCoreModule('fuelTank', 2, 'E')
  },
  weaponModules: {
    smallCount: 1,
    mediumCount: 0,
    largeCount: 0
  },
  defenseModules: {
    size: 1
  },
  utilityModules: {
    size: 8,
    modules: [SpaceSim.getUtilityModule('cargoHold', 5, 'E')]
  },
  pitchMultiplier: 0.5, // half of max thrust
  yawMultiplier: 0.5,
  rollMultiplier: 0.1,
  forwardThrustMultiplier: 1,
  reverseThrustMultiplier: 1,
  upThrustMultiplier: 0.2,
  downThrustMultiplier: 0.2,
  leftThrustMultiplier: 0.2,
  rightThrustMultiplier: 0.2,
});
