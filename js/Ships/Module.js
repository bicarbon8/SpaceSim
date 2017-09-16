var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
/**
 * Module is a base class for any component that has mass, integrity and cost
 */
SpaceSim.Ships.Module = function(options) {
  if (!options) { options = {}; }
  this.mass = options.mass || 0; // in tonnes
  this.integrity = options.integrity || 0; // multiplier used for calculating damage
  this.currentIntegrity = 100; // 100% is healthy, 0% is broken
  this.cost = options.cost || 0;
};
