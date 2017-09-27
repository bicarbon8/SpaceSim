var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
/**
 * PoweredModules extend from a standard Module, but can be
 * turned off or on via the 'enabled' property and will consume
 * power from the installed 'generator' if turned on
 */
SpaceSim.Ships.PoweredModule = function(options) {
  this.id = SpaceSim.RNG.guid(); // randomly generated unique id for module instance

  if (!options) { options = {}; }
  this.name = options.name || null;
  this.description = options.description || null;
  this.type = options.type || -1; 
  this.subType = options.subType || -1;
  this.mass = options.mass || 0; // in tonnes
  this.size = options.size || 0;
  this.class = options.class || 0;
  this.heatResistance = options.heatResistance || 0; // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
  this.impactResistance = options.impactResistance || 0; // collisions, bullets / shrapnel resistance: 100% is immune to impacts
  this.cost = options.cost || 0;

  this.integrity = 100; // 100% is healthy, 0% is broken and must be repaired. Starts at 100%
  this.enabled = true; // enabled by default
  this.active = options.active || false; // not in use by default
  this.powerDraw = options.powerDraw || 0; // in MegaWatts
  this.activePowerDraw = options.activePowerDraw || 0; // in MegaWatts
  this.heatGenerated = options.heatGenerated || 0; // in degrees Celcius; over 100 C for ship and modules start taking damage
  this.activeHeatGenerated = options.activeHeatGenerated || 0; // in degrees Celcius
};
/**
 * module is consuming base levels of power, but is not in use
 */
SpaceSim.Ships.PoweredModule.prototype.setEnabled = function(enabled) {
  this.enabled = enabled;
};
/**
 * module is consuming maximum levels of power and is in use
 */
SpaceSim.Ships.PoweredModule.prototype.setActive = function(active) {
  this.active = active;
};

SpaceSim.Ships.PoweredModule.prototype.getOptions = function() {
  var options = {};
  for (var property in this) {
    if (this.hasOwnProperty(property)) {
      options[property] = this[property];
    }
  }
  return options;
};
