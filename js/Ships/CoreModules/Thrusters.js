var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.Thrusters = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.thrust = options.thrust || 0; // in KiloNewtons
};
SpaceSim.Ships.CoreModules.Thrusters.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.Thrusters.prototype.constructor = SpaceSim.Ships.CoreModules.Thrusters;
