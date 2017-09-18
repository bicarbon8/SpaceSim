var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
/**
 * this is the smallest and worst performing Capacitor you can buy
 */
SpaceSim.Ships.CoreModules.Capacitor_1a = function() {
  var options = {
    boostPower: 1,
    boostTime: 10, // seconds
    rechargeTime: 60, // seconds
    mass: 2,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 100,
    powerDraw: 10, // in megaWatts
    heatGenerated: 10 // in degrees Celcius
  };
  SpaceSim.Ships.CoreModules.Capacitor.call(this, options);
};
SpaceSim.Ships.CoreModules.Capacitor.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.Capacitor.prototype.constructor = SpaceSim.Ships.CoreModules.Capacitor;
