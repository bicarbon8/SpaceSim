var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.DefenseModules = SpaceSim.Ships.DefenseModules || {};
SpaceSim.Ships.DefenseModules.HullPlating = SpaceSim.Ships.DefenseModules.HullPlating || {};
SpaceSim.Ships.DefenseModules.HullPlating.Size1 = SpaceSim.Ships.DefenseModules.HullPlating.Size1 || {};
SpaceSim.Ships.DefenseModules.HullPlating.Size1.Class1 = function() {
  var options = {
    mass: 10, // in tonnes
    size: 1,
    heatResistance: 1, // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
    impactResistance: 1, // collisions, bullets / shrapnel resistance: 100% is immune to impacts
    cost: 1000,
    powerDraw: 0, // in megaWatts
    heatGenerated: 0 // in degrees Celcius
  };
  SpaceSim.Ships.DefenseModules.HullPlating.call(this, options);
};
SpaceSim.Ships.DefenseModules.HullPlating.Size1.Class1.prototype = Object.create(SpaceSim.Ships.DefenseModules.HullPlating.prototype);
SpaceSim.Ships.DefenseModules.HullPlating.Size1.Class1.prototype.constructor = SpaceSim.Ships.DefenseModules.HullPlating.Size1.Class1;
