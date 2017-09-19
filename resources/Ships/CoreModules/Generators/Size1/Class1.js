var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.Generators = SpaceSim.Ships.CoreModules.Generators || {};
SpaceSim.Ships.CoreModules.Generators.Size1 = SpaceSim.Ships.CoreModules.Generators.Size1 || {};
SpaceSim.Ships.CoreModules.Generators.Size1.Class1 = function() {
  var options = {
    power: 100, // MegaWatts
    heatEfficiency: 0.1, // how much heat generated per MegaWatt produced; 100% means no heat
    fuelEfficiency: 0.1, // how much fuel consumed per MegaWatt produced; 100% means no fuel (impossible)
    mass: 3,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 100,
    powerDraw: 0, // in megaWatts
    heatGenerated: 0 // in degrees Celcius
  };
  SpaceSim.Ships.CoreModules.Generator.call(this, options);
};
SpaceSim.Ships.CoreModules.Generators.Size1.Class1.prototype = Object.create(SpaceSim.Ships.CoreModules.Generator.prototype);
SpaceSim.Ships.CoreModules.Generators.Size1.Class1.prototype.constructor = SpaceSim.Ships.CoreModules.Generators.Size1.Class1;
