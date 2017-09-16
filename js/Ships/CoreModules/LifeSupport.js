var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.LifeSupport = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.time = options.time || 0;
};
SpaceSim.Ships.CoreModules.LifeSupport.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.LifeSupport.prototype.constructor = SpaceSim.Ships.CoreModules.LifeSupport;
