var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.HullPlating = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);
};
SpaceSim.Ships.HullPlating.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.HullPlating.prototype.constructor = SpaceSim.Ships.HullPlating;
