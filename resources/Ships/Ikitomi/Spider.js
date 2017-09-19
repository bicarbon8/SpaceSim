var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.Ikitomi = SpaceSim.Ships.Ikitomi || {};
/**
 * a highly maneuverable, small fighter
 */
SpaceSim.Ships.Ikitomi.Spider = function() {
  var options = {
    mass: 8, // in tonnes
    size: 15,
    heatResistance: 0, // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
    impactResistance: 0, // collisions, bullets / shrapnel resistance: 100% is immune to impacts
    cost: 50000,
    coreModules: {
      generatorMaxSize: 1,
      thrustersMaxSize: 2,
      warpCoreMaxSize: 1,
      lifeSupportMaxSize: 1,
      capacitorMaxSize: 3,
      fuelTankMaxSize: 1
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
SpaceSim.Ships.Ikitomi.Spider.prototype = Object.create(SpaceSim.Ships.Ship.prototype);
SpaceSim.Ships.Ikitomi.Spider.prototype.constructor = SpaceSim.Ships.Ikitomi.Spider;
