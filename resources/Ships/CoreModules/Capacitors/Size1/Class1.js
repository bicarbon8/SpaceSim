var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.Capacitors = SpaceSim.Ships.CoreModules.Capacitors || {};
SpaceSim.Ships.CoreModules.Capacitors.Size1 = SpaceSim.Ships.CoreModules.Capacitors.Size1 || {};
/**
 * this is the smallest and worst performing Capacitor you can buy
 */
SpaceSim.Ships.CoreModules.Capacitors.Size1.Class1 = function() {
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
    activePowerDraw: 0,
    heatGenerated: 5, // degrees Celcius
    activeHeatGenerated: 30
  };
  SpaceSim.Ships.CoreModules.Capacitor.call(this, options);
};
SpaceSim.Ships.CoreModules.Capacitors.Size1.Class1.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.Capacitors.Size1.Class1.prototype.constructor = SpaceSim.Ships.CoreModules.Capacitors.Size1.Class1;
