var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.Hull = function(options) {
  SpaceSim.Ships.Module.call(this, options);

  this.heatResistance = options.heatResistance || 0;
  this.impactResistance = options.impactResistance || 0;
};
SpaceSim.Ships.Hull.prototype = Object.create(SpaceSim.Ships.Module.prototype);
SpaceSim.Ships.Hull.prototype.constructor = SpaceSim.Ships.Hull;
