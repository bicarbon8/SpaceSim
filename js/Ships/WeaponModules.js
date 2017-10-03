var SpaceSim = SpaceSim || {};
SpaceSim.Ships = SpaceSim.Ships || {};
SpaceSim.Ships.WeaponSizes = {
  small: 1,
  medium: 2,
  large: 3
};
SpaceSim.Ships.WeaponModules = function(options) {
  SpaceSim.Ships.ModulesContainer.call(this, options);

  this.smallCount = options.smallCount || 0;
  this.mediumCount = options.mediumCount || 0;
  this.largeCount = options.largeCount || 0;

  this.size = this.smallCount + (2 * this.mediumCount) + (3 * this.largeCount);
};
SpaceSim.Ships.WeaponModules.prototype = Object.create(SpaceSim.Ships.ModulesContainer.prototype);
SpaceSim.Ships.WeaponModules.prototype.constructor = SpaceSim.Ships.WeaponModules;
SpaceSim.Ships.WeaponModules.prototype.addSmall = function(weapon) {
  if (weapon.size <= SpaceSim.Ships.WeaponSizes.small) {
    if (this.getCount(SpaceSim.Ships.WeaponSizes.small) < this.smallCount) {
      this.modules.push(weapon);
    } else {
      throw 'no available small weapon mounting points exist';
    }
  } else {
    throw 'a weapon of size: "' +weapon.size+'" cannot be added to a small mount';
  }
};
SpaceSim.Ships.WeaponModules.prototype.addMedium = function(weapon) {
  if (weapon.size <= SpaceSim.Ships.WeaponSizes.medium) {
    if (this.getCount(SpaceSim.Ships.WeaponSizes.medium) < this.mediumCount) {
      this.modules.push(weapon);
    } else {
      throw 'no available medium weapon mounting points exist';
    }
  } else {
    throw 'a weapon of size: "' +weapon.size+'" cannot be added to a medium mount';
  }
};
SpaceSim.Ships.WeaponModules.prototype.addLarge = function(weapon) {
  if (weapon.size <= SpaceSim.Ships.WeaponSizes.large) {
    if (this.getCount(SpaceSim.Ships.WeaponSizes.large) < this.largeCount) {
      this.modules.push(weapon);
    } else {
      throw 'no available large weapon mounting points exist';
    }
  } else {
    throw 'a weapon of size: "' +weapon.size+'" cannot be added to a large mount';
  }
};
SpaceSim.Ships.WeaponModules.prototype.add = function(weapon) {
  var added = false;
  var err = '';
  if (!added && weapon.size <= SpaceSim.Ships.WeaponSizes.small) {
    try {
      this.addSmall(weapon);
      added = true;
    } catch (e) {
      /* unable to add to small; maybe already full? */
      err += e + '\n';
    }
  }
  if (!added && weapon.size <= SpaceSim.Ships.WeaponSizes.medium) {
    try {
      this.addMedium(weapon);
      added = true;
    } catch (e) {
      /* unable to add to medium; maybe already full? */
      err += e + '\n';
    }
  }
  if (!added && weapon.size <= SpaceSim.Ships.WeaponSizes.large) {
    try {
      this.addLarge(weapon);
      added = true;
    } catch (e) {
      /* unable to add to medium; maybe already full? */
      err += e + '\n';
    }
  }
  if (err !== '') {
    throw err;
  }
};
SpaceSim.Ships.WeaponModules.prototype.getCount = function(size) {
  var count = 0;
  for (var i=0; i<this.modules.length; i++) {
    if (this.modules[i].size == size) {
      count++;
    }
  }
  return count;
};
