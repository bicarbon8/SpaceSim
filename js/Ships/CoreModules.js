var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = function(options) {
  this.generator = new SpaceSim.Ships.CoreModules.Generator(options.generator);
  this.thrusters = new SpaceSim.Ships.CoreModules.Thrusters(options.thrusters);
  this.warpCore = new SpaceSim.Ships.CoreModules.WarpCore(options.warpCore);
  this.lifeSupport = new SpaceSim.Ships.CoreModules.LifeSupport(options.lifeSupport);
  this.capacitor = new SpaceSim.Ships.CoreModules.Capacitor(options.capacitor);
};
