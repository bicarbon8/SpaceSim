var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.WeaponModules = SpaceSim.Ships.WeaponModules || {};
SpaceSim.Ships.WeaponModules.Weapon = function(options) {
  SpaceSim.Ships.PoweredModule.call(this, options);

  this.maxAmmo = options.maxAmmo || 0;
  this.reloadDelay = options.reloadDelay || 0;
  this.heatDamage = options.heatDamage || 0;
  this.impactDamage = options.impactDamage || 0;
};
SpaceSim.Ships.WeaponModules.Weapon.prototype = Object.create(SpaceSim.Ships.PoweredModule.prototype);
SpaceSim.Ships.WeaponModules.Weapon.prototype.constructor = SpaceSim.Ships.WeaponModules.Weapon;
SpaceSim.Ships.WeaponModules.Weapon.prototype.enabled = false; // weapons off by default and need be deployed
