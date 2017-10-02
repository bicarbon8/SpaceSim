var SpaceSim = SpaceSim || {};
SpaceSim.ships = [];
SpaceSim.Modules = [];
SpaceSim.ModuleTypes = {
  Ship: 0,
  Core: 1,
  Defense: 2,
  Utility: 3,
  Weapon: 4
};
SpaceSim.ModuleSubTypes = {
  Capacitor: 1,
  FuelTank: 2,
  Generator: 3,
  LifeSupport: 4,
  Thrusters: 5,
  WarpCore: 6,
  HullPlating: 7,
  CargoHold: 8,
  SpatialInterferometer: 9,
  Radiator: 10
};

SpaceSim.currentSystem = null;
SpaceSim.currentShip = null;

SpaceSim.loadSystem = function(systemName) {

};

SpaceSim.addModule = function(module) {
  if (module) {
    SpaceSim.Modules.push(module);
  }
};

SpaceSim.getCoreModule = function(subType, size, moduleClass) {
  var mOpts = SpaceSim._getModuleOptionsBySizeAndClass(SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, subType), size, moduleClass);
  switch (subType) {
    case SpaceSim.ModuleSubTypes.Capacitor:
      return new SpaceSim.Ships.CoreModules.Capacitor(mOpts);
    case SpaceSim.ModuleSubTypes.FuelTank:
      return new SpaceSim.Ships.CoreModules.FuelTank(mOpts);
    case SpaceSim.ModuleSubTypes.Generator:
      return new SpaceSim.Ships.CoreModules.Generator(mOpts);
    case SpaceSim.ModuleSubTypes.LifeSupport:
      return new SpaceSim.Ships.CoreModules.LifeSupport(mOpts);
    case SpaceSim.ModuleSubTypes.Thrusters:
      return new SpaceSim.Ships.CoreModules.Thrusters(mOpts);
    case SpaceSim.ModuleSubTypes.WarpCore:
      return new SpaceSim.Ships.CoreModules.WarpCore(mOpts);
    default:
      throw "no core module of subType '" + subType + "' exists";
  }
};

SpaceSim.getDefenseModule = function(subType, size, moduleClass) {
  var mOpts = SpaceSim._getModuleOptionsBySizeAndClass(SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Defense, subType), size, moduleClass);
  switch (subType) {
    case SpaceSim.ModuleSubTypes.HullPlating:
      return new SpaceSim.Ships.DefenseModules.HullPlating(mOpts);
    case SpaceSim.ModuleSubTypes.Radiator:
      return new SpaceSim.Ships.DefenseModules.Radiator(mOpts);
    default:
      throw "no defense module of subType '" + subType + "' exists";
  }
};

SpaceSim.getUtilityModule = function(subType, size, moduleClass) {
  var mOpts = SpaceSim._getModuleOptionsBySizeAndClass(SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Utility, subType), size, moduleClass);
  switch (subType) {
    case SpaceSim.ModuleSubTypes.CargoHold:
      return new SpaceSim.Ships.UtilityModules.CargoHold(mOpts);
    case SpaceSim.ModuleSubTypes.SpatialInterferometer:
      return new SpaceSim.Ships.UtilityModules.SpatialInterferometer(mOpts);
    default:
      throw "no utility module of subType '" + subType + "' exists";
  }
};

SpaceSim.getWeaponModule = function(type, size, moduleClass) {
  throw 'not yet supported';
};

SpaceSim.getModuleOptionsByType = function(type, subType) {
  var options = [];

  for (var i=0; i<SpaceSim.Modules.length; i++) {
    var module = SpaceSim.Modules[i];
    if (module.type == type) {
      if (subType) {
        if (module.subType == subType) {
          options.push(module);
        }
      } else {
        options.push(module);
      }
    }
  }

  return options;
};

SpaceSim.getModuleOptionNames = function(modulesOptions) {
  var namesHash = {};
  for (var i=0; i<modulesOptions.length; i++) {
    namesHash[modulesOptions[i].name] = true;
  }
  var names = [];
  for (var nameKey in namesHash) {
    if (namesHash.hasOwnProperty(nameKey)) {
      names.push(nameKey);
    }
  }
  return names;
};

SpaceSim._getModuleOptionsBySizeAndClass = function(modules, size, moduleClass) {
  for(var i=0; i<modules.length; i++) {
    var moduleOptions = modules[i];
    if (moduleOptions.size == size && moduleOptions.class == moduleClass) {
      return moduleOptions;
    }
  }
  throw "unable to find module of size '" + size + "' and class '" + moduleClass + "' in passed in list";
};

SpaceSim.getShip = function(shipName) {
  var ships = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Ship);
  for(var i=0; i<ships.length; i++) {
    var shipOptions = ships[i];
    if (shipOptions.name == shipName) {
      return new SpaceSim.Ships.Ship(shipOptions);
    }
  }
};

SpaceSim.getShipSize = function(ship) {
  if (ship.size < 20) {
    return 'Micro';
  }
  if (ship.size < 50) {
    return 'Small';
  }
  if (ship.size < 100) {
    return 'Medium';
  }
  if (ship.size < 500) {
    return 'Large';
  }
};
