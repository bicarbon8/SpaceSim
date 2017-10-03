var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.WeaponModules = SpaceSim.Ships.WeaponModules || {};
SpaceSim.Ships.WeaponModules.Weapon = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.maxAmmo = options.maxAmmo || 0; // maximum can carry
  this.chamberedAmmo = options.chamberedAmmo || 0; // maximum can shoot before reload
  this.reloadDelay = options.reloadDelay || 0; // seconds
  this.heatDamage = options.heatDamage || 0; // percentage of 1
  this.impactDamage = options.impactDamage || 0; // percentage of 1
};
SpaceSim.Ships.WeaponModules.Weapon.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.WeaponModules.Weapon.prototype.constructor = SpaceSim.Ships.WeaponModules.Weapon;
SpaceSim.Ships.WeaponModules.Weapon.prototype.enabled = false; // weapons off by default and need be deployed
