var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.Capacitor = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.boostPower = options.boostPower || 0; // amount of boost applied to powered modules (boost is divided equally among all enabled)
  this.boostTime = options.boostTime || 0; // number of seconds boost will apply to all powered modules
  this.rechargeTime = options.rechargeTime || 0; // amount of time to charge capacitor for boost
};
SpaceSim.Ships.CoreModules.Capacitor.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.Capacitor.prototype.constructor = SpaceSim.Ships.CoreModules.Capacitor;
