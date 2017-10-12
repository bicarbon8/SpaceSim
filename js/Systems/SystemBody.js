var SpaceSim = SpaceSim || {};
SpaceSim.Systems = SpaceSim.Systems || {};
SpaceSim.Systems.SystemBody = function(options) {
  var periapsis = options.periapsis || 0; // distance at closest point
  var apoapsis = options.apoapsis || 0; // distance at furthest point
  var inclination = options.inclination || 0; // 0 is equatorial orbit + prograde, 90 is polar orbit, 180 is equatorial + retrograde
  var angularMomentum = options.angularMomentum || 0; //
  var orbitingBodies = options.orbitingBodies || []; // moons or planets around a star
  var surfaceGravity = options.surfaceGravity || 0; // m/s^2
  var surfaceAtmosphericPressure = options.surfaceAtmosphericPressure || 0; // atmospheres
  var avgSurfaceRadius = options.avgSurfaceRadius || 0; // 0 for planets with no surface like gas giants
};
SpaceSim.Systems.SystemBody.prototype.getTemperature = function(distFromCore) {

};
SpaceSim.Systems.SystemBody.prototype.getAtmosphericPressure = function(distFromCore) {

};
