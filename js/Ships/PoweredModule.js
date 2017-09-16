var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
/**
 * PoweredModules extend from a standard Module, but can be
 * turned off or on via the 'enabled' property and will consume
 * power from the installed 'generator' if turned on
 */
SpaceSim.Ships.PoweredModule = function(options) {
  SpaceSim.Ships.Module.call(this, options);

  this.enabled = true; // enabled by default
  this.powerDraw = options.powerDraw || 0; // in megaWatts
};
SpaceSim.Ships.PoweredModule.prototype = Object.create(SpaceSim.Ships.Module.prototype);
SpaceSim.Ships.PoweredModule.prototype.constructor = SpaceSim.Ships.PoweredModule;
