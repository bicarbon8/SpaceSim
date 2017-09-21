var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.Thrusters = SpaceSim.Ships.CoreModules.Thrusters || {};
SpaceSim.Ships.CoreModules.Thrusters.Size1 = SpaceSim.Ships.CoreModules.Thrusters.Size1 || {};
SpaceSim.Ships.CoreModules.Thrusters.Size1.E = function() {
  var options = {
    thrust: 100, // kN
    mass: 5,
    size: 1,
    class: "E",
    heatResistance: 0,
    impactResistance: 0,
    cost: 100,
    powerDraw: 10, // in megaWatts
    activePowerDraw: 30,
    heatGenerated: 5, // in degrees Celcius
    activeHeatGenerated: 10
  };
  SpaceSim.Ships.CoreModules.Thrusters.call(this, options);
};
SpaceSim.Ships.CoreModules.Thrusters.Size1.E.prototype = Object.create(SpaceSim.Ships.CoreModules.Thrusters.prototype);
SpaceSim.Ships.CoreModules.Thrusters.Size1.E.prototype.constructor = SpaceSim.Ships.CoreModules.Thrusters.Size1.E;
SpaceSim.coreModules.thrusters.push(new SpaceSim.Ships.CoreModules.Thrusters.Size1.E());
