var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.LifeSupport_1a = function() {
  var options = {
    time: 2, // minutes
    mass: 1,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 100,
    powerDraw: 5, // in megaWatts
    heatGenerated: 3 // in degrees Celcius
  };
  SpaceSim.Ships.CoreModules.LifeSupport.call(this, options);
};
SpaceSim.Ships.CoreModules.LifeSupport_1a.prototype = Object.create(SpaceSim.Ships.CoreModules.LifeSupport.prototype);
SpaceSim.Ships.CoreModules.LifeSupport_1a.prototype.constructor = SpaceSim.Ships.CoreModules.LifeSupport_1a;
