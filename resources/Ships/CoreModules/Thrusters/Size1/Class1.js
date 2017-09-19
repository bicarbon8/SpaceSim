var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.Thrusters = SpaceSim.Ships.CoreModules.Thrusters || {};
SpaceSim.Ships.CoreModules.Thrusters.Size1 = SpaceSim.Ships.CoreModules.Thrusters.Size1 || {};
SpaceSim.Ships.CoreModules.Thrusters.Size1.Class1 = function() {
  var options = {
    thrust: 100, // kN
    mass: 5,
    size: 1,
    heatResistance: 0,
    impactResistance: 0,
    cost: 100,
    powerDraw: 30, // in megaWatts
    heatGenerated: 10 // in degrees Celcius
  };
  SpaceSim.Ships.CoreModules.Thrusters.call(this, options);
};
SpaceSim.Ships.CoreModules.Thrusters.Size1.Class1.prototype = Object.create(SpaceSim.Ships.CoreModules.Thrusters.prototype);
SpaceSim.Ships.CoreModules.Thrusters.Size1.Class1.prototype.constructor = SpaceSim.Ships.CoreModules.Thrusters.Size1.Class1;
