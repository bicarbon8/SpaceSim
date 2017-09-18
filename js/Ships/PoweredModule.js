var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.ModuleTypes = {
  none: 0,
  core: 1,
  defense: 2,
  utility: 3,
  weapon: 4
};
/**
 * PoweredModules extend from a standard Module, but can be
 * turned off or on via the 'enabled' property and will consume
 * power from the installed 'generator' if turned on
 */
SpaceSim.Ships.PoweredModule = function(options) {
  if (!options) { options = {}; }
  this.name = options.name || null;
  this.description = options.description || null;
  this.type = options.type || SpaceSim.Ships.ModuleTypes.none;
  this.mass = options.mass || 0; // in tonnes
  this.size = options.size || 0;
  this.heatResistance = options.heatResistance || 0; // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
  this.impactResistance = options.impactResistance || 0; // collisions, bullets / shrapnel resistance: 100% is immune to impacts
  this.cost = options.cost || 0;

  this.integrity = 100; // 100% is healthy, 0% is broken and must be repaired. Starts at 100%
  this.enabled = true; // enabled by default
  this.powerDraw = options.powerDraw || 0; // in megaWatts
  this.heatGenerated = options.heatGenerated || 0; // in degrees Celcius
};
