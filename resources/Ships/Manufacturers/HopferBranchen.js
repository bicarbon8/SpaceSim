var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.Manufacturers = SpaceSim.Ships.Manufacturers || {};
SpaceSim.Ships.Manufacturers.HopferBranchen = SpaceSim.Ships.Manufacturers.HopferBranchen || {};
/**
 * the bicycle messenger equivalent of spaceships... minimal weapons, but
 * extremely small and maneuverable so it can get in and around quickly.
 */
SpaceSim.Ships.Manufacturers.HopferBranchen.Bote = function() {
  var options = {
    name: "Bote",
    manufacturer: "Hopfer Branchen",
    mass: 10, // in tonnes
    size: 20,
    heatResistance: 15, // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
    impactResistance: 15, // collisions, bullets / shrapnel resistance: 100% is immune to impacts
    cost: 25000,
    coreModules: {
      generatorMaxSize: 1,
      thrustersMaxSize: 1,
      warpCoreMaxSize: 2,
      lifeSupportMaxSize: 1,
      capacitorMaxSize: 1,
      fuelTankMaxSize: 2
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
      size: 10
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
  this.coreModules.updateGenerator(new SpaceSim.Ships.CoreModules.Generators.Size1.E());
  this.coreModules.updateThrusters(new SpaceSim.Ships.CoreModules.Thrusters.Size1.E());
  this.coreModules.updateWarpCore(new SpaceSim.Ships.CoreModules.WarpCores.Size1.E());
  this.coreModules.updateLifeSupport(new SpaceSim.Ships.CoreModules.LifeSupport.Size1.E());
  this.coreModules.updateCapacitor(new SpaceSim.Ships.CoreModules.Capacitors.Size1.E());
  this.coreModules.updateFuelTank(new SpaceSim.Ships.CoreModules.FuelTanks.Size1.E());

  // assign default utility modules
  this.utilityModules.add(new SpaceSim.Ships.UtilityModules.CargoHolds.Size5.E()); // fill half with cargo storage
};
SpaceSim.Ships.Manufacturers.HopferBranchen.Bote.prototype = Object.create(SpaceSim.Ships.Ship.prototype);
SpaceSim.Ships.Manufacturers.HopferBranchen.Bote.prototype.constructor = SpaceSim.Ships.Manufacturers.HopferBranchen.Bote;
SpaceSim.ships.push(new SpaceSim.Ships.Manufacturers.HopferBranchen.Bote());
