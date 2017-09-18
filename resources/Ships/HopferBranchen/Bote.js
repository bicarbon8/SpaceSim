var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.HopferBranchen = SpaceSim.Ships.HopferBranchen || {};
/**
 * the bicycle messenger equivalent of spaceships... minimal weapons, but
 * extremely small and maneuverable so it can get in and around quickly.
 */
SpaceSim.Ships.HopferBranchen.Bote = function() {
  var options = {
    name: "Bote",
    mass: 10, // in tonnes
    size: 15,
    heatResistance: 15, // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
    impactResistance: 15, // collisions, bullets / shrapnel resistance: 100% is immune to impacts
    cost: 25000,
    coreModules: {
      generatorMaxSize: 1,
      thrustersMaxSize: 1,
      warpCoreMaxSize: 1,
      lifeSupportMaxSize: 1,
      capacitorMaxSize: 1,
      fuelTankMaxSize: 1
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
      size: 8
    },
    pitchMultiplier: 0.5, // half of max thrust
    yawMultiplier: 0.5,
    rollMultiplier: 0.1,
    forwardThrustMultiplier: 1,
    reverseThrustMultiplier: 1,
    upThrustMultiplier: 0.2,
    downThrustMultiplier: 0.2,
    leftThrustMultiplier: 0.2,
    rightThrustMultiplier: 0.2
  };
  SpaceSim.Ships.Ship.call(this, options);

  // assign default core modules
  this.coreModules.updateGenerator(new SpaceSim.Ships.CoreModules.Generator_1a());
  this.coreModules.updateThrusters(new SpaceSim.Ships.CoreModules.Thrusters_1a());
  this.coreModules.updateWarpCore(new SpaceSim.Ships.CoreModules.WarpCore_1a());
  this.coreModules.updateLifeSupport(new SpaceSim.Ships.CoreModules.LifeSupport_1a());
  this.coreModules.updateCapacitor(new SpaceSim.Ships.CoreModules.Capacitor_1a());
  this.coreModules.updateFuelTank(new SpaceSim.Ships.CoreModules.FuelTank_1a());
};
SpaceSim.Ships.HopferBranchen.Bote.prototype = Object.create(SpaceSim.Ships.Ship.prototype);
SpaceSim.Ships.HopferBranchen.Bote.prototype.constructor = SpaceSim.Ships.HopferBranchen.Bote;
