var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.WarpCore = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.maximumMass = options.maximumMass || 0; // maximum mass that can be shifted. above maximum the jump range drops to 0
  this.maximumFuel = options.maximumFuel || 0; // maximum fuel used for maximum jump
  this.maximumRange = options.maximumRange || 0; // largest jump range at 0 mass
};
SpaceSim.Ships.CoreModules.WarpCore.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.WarpCore.prototype.constructor = SpaceSim.Ships.CoreModules.WarpCore;

/**
 * function will calculate the maximum jump range for the passed in mass to be moved
 * based on the current module's ratings
 */
SpaceSim.Ships.CoreModules.WarpCore.prototype.getJumpRange = function(mass) {
  if (mass > this.maximumMass) {
    return 0; // too heavy to jump
  }
  var leeway = 1 - (mass / this.maximumMass); // for Max Mass of 100 and Current Mass of 90 that would leave a 10% leeway
  return this.maximumRange * leeway;
};

/**
 * function will calculate the amount of fuel needed to jump the specified distance
 * based on current module's ratings and passed in mass to be moved
 */
SpaceSim.Ships.CoreModules.WarpCore.prototype.getFuelNeededForJump = function(mass, distance) {
  var maxDistance = this.getJumpRange(mass);
  if (maxDistance < distance) {
    return Infinity;
  }
  // what % of maximum are we going?
  var percent = distance / maxDistance;
  return this.maximumFuel * percent;
};
