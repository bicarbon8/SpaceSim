var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.WarpCore = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.maximumMass = options.maximumMass || 0; // maximum mass that can be shifted. above maximum the jump range drops to 0
  this.optimalMass = options.optimalMass || 0; // mass where fuel usage ratio equals 'fuelPerLightYear'
  this.fuelPerLightYear = options.fuelPerLightYear || Math.Infinity; // amount of fuel used at zero mass per Lightyear of travel
};
SpaceSim.Ships.CoreModules.WarpCore.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.WarpCore.prototype.constructor = SpaceSim.Ships.CoreModules.WarpCore;

/**
 * function will calculate the amount of fuel consumed per LightYear of travel based on
 * the passed in mass to be moved and the optimal mass of the module
 */
SpaceSim.Ships.CoreModules.WarpCore.prototype.getFuelUsedPerLightYear = function(mass) {
  if (mass > this.maximumMass) {
    return Math.Infinity; // too heavy to jump
  }
  var massDelta = mass / this.optimalMass; // positive adds fuel usage, negative removes
  var fuelPerLY = Math.pow(this.fuelPerLightYear, massDelta);
  if (fuelPerLY < 0.1) {
    fuelPerLY = 0.1;
  }
  return fuelPerLY;
};

/**
 * function will calculate the maximum jump range (in LightYears) for the passed in mass to be moved
 * based on the current module's ratings and fuel available
 */
SpaceSim.Ships.CoreModules.WarpCore.prototype.getJumpRangeWithFuel = function(mass, fuelAvailable) {
  var fuelPerLY = this.getFuelUsedPerLightYear(mass);
  if (fuelPerLY == Math.Infinity || fuelPerLY > fuelAvailable) {
    return 0; // not enough fuel to go even 1 LightYear
  }
  
  return fuelAvailable / fuelPerLY;
};

/**
 * function will calculate the amount of fuel needed to jump the specified distance (in LightYears)
 * based on current module's ratings and passed in mass to be moved
 */
SpaceSim.Ships.CoreModules.WarpCore.prototype.getFuelNeededForJump = function(mass, distance) {
  var fuelPerLY = this.getFuelUsedPerLightYear(mass);
  if (fuelPerLY == Math.Infinity) {
    return Math.Infinity;
  }
  return distance * fuelPerLY;
};
