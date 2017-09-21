var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.Generators = SpaceSim.Ships.CoreModules.Generators || {};
SpaceSim.Ships.CoreModules.Generators.Size1 = SpaceSim.Ships.CoreModules.Generators.Size1 || {};
/**
 * The worst performing and lowest output generator available
 */
SpaceSim.Ships.CoreModules.Generators.Size1.E = function() {
  var options = {
    // generator
    heatEfficiency: 0, // 100% heat at max power consumption
    fuelEfficiency: 0, // 1 tonne of fuel per hour at max power consumption
    // powered module
    mass: 3,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 100,
    powerDraw: -50, // produces power in megaWatts
    activePowerDraw: -50, // same
    heatGenerated: 100, // degrees Celcius; at max usage it likely will overheat ship
    activeHeatGenerated: 100 // same
  };
  SpaceSim.Ships.CoreModules.Generator.call(this, options);
};
SpaceSim.Ships.CoreModules.Generators.Size1.E.prototype = Object.create(SpaceSim.Ships.CoreModules.Generator.prototype);
SpaceSim.Ships.CoreModules.Generators.Size1.E.prototype.constructor = SpaceSim.Ships.CoreModules.Generators.Size1.E;
