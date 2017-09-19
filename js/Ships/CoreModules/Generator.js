var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.CoreModules = SpaceSim.Ships.CoreModules || {};
SpaceSim.Ships.CoreModules.Generator = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.power = Math.abs(this.activePowerDraw); // generators should have negaive power draw representing their production of power
  this.heatEfficiency = options.heatEfficiency || 0; // how much heat generated per MegaWatt produced; 1 (100%) means no heat, 0 means 100% heat
  this.fuelEfficiency = options.fuelEfficiency || 0; // how much fuel consumed per MegaWatt produced in 1 tonne increments per hour; 1 (100%) means no fuel, 0 means 100% fuel
};
SpaceSim.Ships.CoreModules.Generator.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.CoreModules.Generator.prototype.constructor = SpaceSim.Ships.CoreModules.Generator;

SpaceSim.Ships.CoreModules.Generator.prototype.getHeatGeneratedByUsage = function(megawatts) {
  if (megawatts > this.power) {
    return Infinity; // explosion!!!
  }
  var percent = megawatts / this.power; // what percent of total capacity are we using; 90 MW usage of 100 MW total equals 90%
  return this.heatGenerated * (percent * (1 - this.heatEfficiency)); // 90% usage at heat efficiency of -1 (-100%) equals 180% of heatGenerated value
};

SpaceSim.Ships.CoreModules.Generator.prototype.getFuelConsumedPerHourByUsage = function(megawatts) {
  if (megawatts > this.power) {
    return Infinity; // instantly empty tank!!!
  }
  var percent = megawatts / this.power; // what percent of total capacity are we using
  return percent * (1 - this.fuelEfficiency); // 90% usage at fuel efficiency of 0.75 (75%) equals 0.225 tonnes consumed per hour
};
