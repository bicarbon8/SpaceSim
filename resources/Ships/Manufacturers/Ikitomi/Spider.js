var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.Manufacturers = SpaceSim.Ships.Manufacturers || {};
SpaceSim.Ships.Manufacturers.Ikitomi = SpaceSim.Ships.Manufacturers.Ikitomi || {};
/**
 * a highly maneuverable, small fighter
 */
SpaceSim.Ships.Manufacturers.Ikitomi.Spider = function() {
  var options = {
    mass: 8, // in tonnes
    size: 17,
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
  this.coreModules.updateGenerator(new SpaceSim.Ships.CoreModules.Generators.Size1.Class1());
  this.coreModules.updateThrusters(new SpaceSim.Ships.CoreModules.Thrusters.Size1.Class1());
  this.coreModules.updateWarpCore(new SpaceSim.Ships.CoreModules.WarpCores.Size1.E());
  this.coreModules.updateLifeSupport(new SpaceSim.Ships.CoreModules.LifeSupport.Size1.Class1());
  this.coreModules.updateCapacitor(new SpaceSim.Ships.CoreModules.Capacitors.Size1.Class1());
  this.coreModules.updateFuelTank(new SpaceSim.Ships.CoreModules.FuelTanks.Size1.E());
};
SpaceSim.Ships.Manufacturers.Ikitomi.Spider.prototype = Object.create(SpaceSim.Ships.Ship.prototype);
SpaceSim.Ships.Manufacturers.Ikitomi.Spider.prototype.constructor = SpaceSim.Ships.Manufacturers.Ikitomi.Spider;
