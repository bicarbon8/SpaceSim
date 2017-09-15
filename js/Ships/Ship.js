var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.Ship = function(options) {
  if (!options) { options = {}; }
  this.mass = options.mass || 0;
  this.integrity = options.integrity || 0;
  this.cost = options.cost || 0;

  this.hull = new SpaceSim.Ships.CoreModules.Hull(options.hull);
  this.fuelTank = new SpaceSim.Ships.CoreModules.FuelTank(options.fuelTank);

  this.coreModules = new SpaceSim.Ships.CoreModules(options.coreModules);
  this.weaponModules = new SpaceSim.Ships.WeaponModules(options.weaponModules);
  this.defenseModules = new SpaceSim.Ships.DefenseModules(options.defenseModules);
  this.utilityModules = new SpaceSim.Ships.UtilityModules(options.utilityModules);

  // simulates placement of thruster ports
  this.pitchMultiplier = options.pitchMultiplier || 0;
  this.yawMultiplier = options.yawMultiplier || 0;
  this.rollMultiplier = options.rollMultiplier || 0;
  this.forwardThrustMultiplier = options.forwardThrustMultiplier || 0;
  this.reverseThrustMultiplier = options.reverseThrustMultiplier || 0;
  this.upThrustMultiplier = options.upThrustMultiplier || 0;
  this.downThrustMultiplier = options.downThrustMultiplier || 0;
  this.leftThrustMultiplier = options.leftThrustMultiplier || 0;
  this.rightThrustMultiplier = options.rightThrustMultiplier || 0;
};

SpaceSim.Ships.Ship.prototype.getHeat = function() {
  // start by getting PowerPlant efficiency and power draw of all enabled modules
};

/**
 * Module is a base class for any component that can be installed in a ship
 */
SpaceSim.Ships.Module = function(options) {
  this.mass = options.mass || 0;
  this.integrity = options.integrity || 0;
  this.cost = options.cost || 0;
};

/**
 * PoweredModules extend from a standard Module, but can be
 * turned off or on via the 'enabled' property and will consume
 * power from the installed 'generator' if turned on
 */
SpaceSim.Ships.PoweredModule = function(options) {
  SpaceSim.Ships.Module.call(this, options);

  this.enabled = true; // enabled by default
  this.powerDraw = options.powerDraw || 0;
};
SpaceSim.Ships.PoweredModule.prototype = Object.create(SpaceSim.Ships.Module.prototype);
SpaceSim.Ships.PoweredModule.prototype.constructor = SpaceSim.Ships.PoweredModule;

SpaceSim.Ships.Hull = function(options) {
  SpaceSim.Ships.Module.call(this, options);

  this.thermalResistance = options.thermalResistance || 0;
  this.impactResistance = options.impactResistance || 0;
};
SpaceSim.Ships.Hull.prototype = Object.create(SpaceSim.Ships.Module.prototype);
SpaceSim.Ships.Hull.prototype.constructor = SpaceSim.Ships.Hull;

SpaceSim.Ships.FuelTank = function(options) {
  SpaceSim.Ships.Module.call(this, options);

  this.boostPower = options.boostPower || 0;
  this.boostTime = options.boostTime || 0;
};
SpaceSim.Ships.FuelTank.prototype = Object.create(SpaceSim.Ships.Module.prototype);
SpaceSim.Ships.FuelTank.prototype.constructor = SpaceSim.Ships.FuelTank;

SpaceSim.Ships.CoreModules = function(options) {
  this.generator = new SpaceSim.Ships.CoreModules.Generator(options.generator);
  this.thrusters = new SpaceSim.Ships.CoreModules.Thrusters(options.thrusters);
  this.warpCore = new SpaceSim.Ships.CoreModules.WarpCore(options.warpCore);
  this.lifeSupport = new SpaceSim.Ships.CoreModules.LifeSupport(options.lifeSupport);
  this.capacitor = new SpaceSim.Ships.CoreModules.Capacitor(options.capacitor);
};

SpaceSim.Ships.CoreModules.Generator = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.watts = options.watts || 0;
  this.efficiency = options.efficiency || 0;
};
SpaceSim.Ships.CoreModules.Generator.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.Generator.prototype.constructor = SpaceSim.Ships.CoreModules.Generator;

SpaceSim.Ships.CoreModules.Thrusters = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.thrust = options.thrust || 0;
};
SpaceSim.Ships.CoreModules.Thrusters.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.Thrusters.prototype.constructor = SpaceSim.Ships.CoreModules.Thrusters;

SpaceSim.Ships.CoreModules.WarpCore = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.maximumMass = options.maximumMass || 0; // maximum mass that can be shifted. above maximum the jump range drops to 0
  this.maximumFuel = options.maximumFuel || 0; // maximum fuel used for maximum jump
  this.maximumRange = options.maximumRange || 0; // largest jump range at 0 mass
};
SpaceSim.Ships.CoreModules.WarpCore.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.WarpCore.prototype.constructor = SpaceSim.Ships.CoreModules.WarpCore;

SpaceSim.Ships.CoreModules.LifeSupport = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.time = options.time || 0;
};
SpaceSim.Ships.CoreModules.LifeSupport.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.LifeSupport.prototype.constructor = SpaceSim.Ships.CoreModules.LifeSupport;

SpaceSim.Ships.CoreModules.Capacitor = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.boostPower = options.boostPower || 0;
  this.boostTime = options.boostTime || 0;
};
SpaceSim.Ships.CoreModules.Capacitor.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.Capacitor.prototype.constructor = SpaceSim.Ships.CoreModules.Capacitor;

SpaceSim.Ships.WeaponModules = function(options) {
  this.smallCount = options.smallCount || 0;
  this.mediumCount = options.mediumCount || 0;
  this.largeCount = options.largeCount || 0;

  this.smallModules = [this.smallCount];
  this.mediumModules = [this.mediumCount];
  this.largeModules = [this.largeCount];
};

SpaceSim.Ships.DefenseModules = function(options) {
  this.count = options.count || 0;

  this.modules = [this.count];
};

SpaceSim.Ships.UtilityModules = function(options) {
  this.count = options.count || 0;

  this.modules = [this.count];
};
