var SpaceSim = SpaceSim || {};
SpaceSim.coreModules = SpaceSim.coreModules || {};
SpaceSim.coreModules.generators = SpaceSim.coreModules.generators || [];
/**
 * The worst performing and lowest output generator available
 */
SpaceSim.coreModules.generators.push({
  // generator
  heatEfficiency: 0, // 100% heat at max power consumption
  fuelEfficiency: 0, // 1 tonne of fuel per hour at max power consumption
  // powered module
  mass: 3,
  size: 1,
  class: "E",
  heatResistance: 0,
  impactResistance: 0,
  cost: 100,
  powerDraw: -50, // produces power in megaWatts
  activePowerDraw: -50, // same
  heatGenerated: 100, // degrees Celcius; at max usage it likely will overheat ship
  activeHeatGenerated: 100 // same
});
