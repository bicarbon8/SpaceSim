var SpaceSim = SpaceSim || {};
SpaceSim.Utilities = SpaceSim.Utilities || {};
SpaceSim.Utilities.Helper = {
    isNumeric: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
};