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
  var surfaceTemperature = options.surfaceTemperature || 0; // Celcius
  var avgSurfaceRadius = options.avgSurfaceRadius || 0; // 0 for planets with no surface like gas giants

  var position = options.position || new Vector3();
  var mass = options.mass || 0;
  var rotationalVelocity = options.rotationalVelocity || 0; // 0 = no rotation on axis
  var axialTilt = options.axialTilt || 0; // 0 = untilted axis with respect to orbital plane
};
SpaceSim.Systems.SystemBody.prototype.getTotalMass = function() {
  var totalMass = this.mass;
  return totalMass;
};
SpaceSim.Systems.SystemBody.prototype.getPosition = function() {
  return this.position;
};
SpaceSim.Systems.SystemBody.prototype.getGravitationalPullOn = function(object) {
  var workVect = new Vector3();
	//vector is between positions of this SystemBody and passed in SystemBody
	workVect.copy(this.getPosition()).sub(object.getPosition());
	var dstSquared = workVect.lengthSq();
	var massPrd = this.getTotalMass() * object.getTotalMass();
	// in newtons (1 N = 1 kg*m / s^2)
	var Fg = G * (massPrd / dstSquared);
	workVect.normalize();
	//vector is now force of attraction in newtons
	workVect.multiplyScalar(Fg);
	return workVect;
};
SpaceSim.Systems.SystemBody.prototype.getTemperature = function(distFromSurface) {
  return 0; // maths is hard TODO: sort this out
};
SpaceSim.Systems.SystemBody.prototype.getAtmosphericPressure = function(distFromSurface) {
  var staticPressure = SpaceSim.Utilities.Converter.atmospheresToPascals(this.surfaceAtmosphericPressure);
  var standardTemp = SpaceSim.Utilities.Converter.celciusToKelvin(this.surfaceTemperature);

  return 0; // maths is hard TODO: sort this out
};
