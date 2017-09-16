var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.Capacitor = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.boostPower = options.boostPower || 0;
  this.boostTime = options.boostTime || 0;
};
SpaceSim.Ships.CoreModules.Capacitor.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.Capacitor.prototype.constructor = SpaceSim.Ships.CoreModules.Capacitor;
