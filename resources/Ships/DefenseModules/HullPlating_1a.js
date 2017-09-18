var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.HullPlating_1a = function() {
  var options = {
    mass: 10, // in tonnes
    size: 1,
    heatResistance: 1, // lazer weapon, ship overheating and star proximity resistance: 100% is immune to heat
    impactResistance: 1, // collisions, bullets / shrapnel resistance: 100% is immune to impacts
    cost: 1000,
    powerDraw: 0, // in megaWatts
    heatGenerated: 0 // in degrees Celcius
  };
  SpaceSim.Ships.HullPlating.call(this, options);
};
SpaceSim.Ships.HullPlating_1a.prototype = Object.create(SpaceSim.Ships.HullPlating.prototype);
SpaceSim.Ships.HullPlating_1a.prototype.constructor = SpaceSim.Ships.HullPlating_1a;
