var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.DefenseModules = function(options) {
  this.size = options.size || 0; // Defense modules can be added to occupy all available space

  this.modules = [0];
};
