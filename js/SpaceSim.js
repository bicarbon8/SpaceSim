"strict mode";
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
SpaceSim.loadSystem = function (systemName) {

};
