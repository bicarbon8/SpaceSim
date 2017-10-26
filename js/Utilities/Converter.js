var SpaceSim = SpaceSim || {};
SpaceSim.Utilities = SpaceSim.Utilities || {};
SpaceSim.Utilities.Converter = {
  celciusToKelvin: function(celcius) {
    return celcius + 273.15;
  },
  kelvinToCelcius: function(kelvin) {
    return kelvin - 273.15;
  },
  atmospheresToPascals: function(atmospheres) {
    return atmospheres * 101325;
  },
  pascalsToAtmospheres: function(pascals) {
    return pascals / 101325;
  }
};
