var SpaceSim = SpaceSim || {};
SpaceSim.Utilities = SpaceSim.Utilities || {};
SpaceSim.Utilities.RNG = {
  int: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  /**
	 * function generates a GUID
	 * @returns {string} a GUID (NNNNNNNN-NNNN-NNNN-NNNN-NNNNNNNNNNNN)
	 */
	guid: function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4();
  }
};
