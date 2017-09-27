var SpaceSim = SpaceSim || {};
SpaceSim.ships = [];
SpaceSim.coreModules = {
  capacitors: [],
  fuelTanks: [],
  generators: [],
  lifeSupports: [],
  thrusters: [],
  warpCores: []
};
SpaceSim.defenseModules = {
  hullPlatings: []
};
SpaceSim.utilityModules = {
  cargoHolds: []
};
SpaceSim.weaponModules = {
  weapons: []
};
SpaceSim.currentSystem = null;
SpaceSim.currentShip = null;
SpaceSim.loadSystem = function(systemName) {

};

SpaceSim.getCoreModule = function(type, size, moduleClass) {
  var mOpts = {};
  switch (type) {
    case 'capacitor':
      mOpts = SpaceSim.getModuleOptionsBySizeAndClass(SpaceSim.coreModules.capacitors, size, moduleClass);
      return new SpaceSim.Ships.CoreModules.Capacitor(mOpts);
    case 'fuelTank':
      mOpts = SpaceSim.getModuleOptionsBySizeAndClass(SpaceSim.coreModules.fuelTanks, size, moduleClass);
      return new SpaceSim.Ships.CoreModules.FuelTank(mOpts);
    case 'generator':
      mOpts = SpaceSim.getModuleOptionsBySizeAndClass(SpaceSim.coreModules.generators, size, moduleClass);
      return new SpaceSim.Ships.CoreModules.Generator(mOpts);
    case 'lifeSupport':
      mOpts = SpaceSim.getModuleOptionsBySizeAndClass(SpaceSim.coreModules.lifeSupports, size, moduleClass);
      return new SpaceSim.Ships.CoreModules.LifeSupport(mOpts);
    case 'thrusters':
      mOpts = SpaceSim.getModuleOptionsBySizeAndClass(SpaceSim.coreModules.thrusters, size, moduleClass);
      return new SpaceSim.Ships.CoreModules.Thrusters(mOpts);
    case 'warpCore':
      mOpts = SpaceSim.getModuleOptionsBySizeAndClass(SpaceSim.coreModules.warpCores, size, moduleClass);
      return new SpaceSim.Ships.CoreModules.WarpCore(mOpts);
    default:
      throw "unable to find module of type '" + type + "' with size '" + size + "' and class '" + moduleClass + "'";
  }
};

SpaceSim.getUtilityModule = function(type, size, moduleClass) {
  var mOpts = {};
  switch (type) {
    case 'cargoHold':
      mOpts = SpaceSim.getModuleOptionsBySizeAndClass(SpaceSim.utilityModules.cargoHolds, size, moduleClass);
      return new SpaceSim.Ships.UtilityModules.CargoHold(mOpts);
    default:
      throw "unable to find module of type '" + type + "' with size '" + size + "' and class '" + moduleClass + "'";
  }
};

SpaceSim.getModuleOptionsBySizeAndClass = function(modules, size, moduleClass) {
  for(var i=0; i<modules.length; i++) {
    var moduleOptions = modules[i];
    if (moduleOptions.size == size && moduleOptions.class == moduleClass) {
      return moduleOptions;
    }
  }
  throw "unable to find module of size '" + size + "' and class '" + moduleClass + "' in passed in list";
};

SpaceSim.getShip = function(shipName) {
  for(var i=0; i<SpaceSim.ships.length; i++) {
    var shipOptions = SpaceSim.ships[i];
    if (shipOptions.name == shipName) {
      return new SpaceSim.Ships.Ship(shipOptions);
    }
  }
};
