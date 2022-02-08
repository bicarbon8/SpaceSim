// Mapping with:
// - Single index for putTileAt
// - Array of weights for weightedRandomize
// - Array or 2D array for putTilesAt
const TILE_MAPPING = {
    WALL: {
      TOP_LEFT: 12,
      TOP_RIGHT: 12,
      BOTTOM_RIGHT: 12,
      BOTTOM_LEFT: 12,
      // Let's add some randomization to the walls while we are refactoring:
      TOP: [{ index: 6, weight: 4 }, { index: [11, 9, 10], weight: 1 }],
      LEFT: [{ index: 6, weight: 4 }, { index: [11, 9, 10], weight: 1 }],
      RIGHT: [{ index: 6, weight: 4 }, { index: [11, 9, 10], weight: 1 }],
      BOTTOM: [{ index: 6, weight: 4 }, { index: [11, 9, 10], weight: 1 }]
    },
    // FLOOR: [{ index: 7, weight: 1 }, { index: 0, weight: 9 }],
    FLOOR: [{ index: 0, weight: 10 }],
    DOOR: {
      TOP: [0],
      // prettier-ignore
      LEFT: [0],
      BOTTOM: [0],
      // prettier-ignore
      RIGHT: [0]
    }
  };
  
  export default TILE_MAPPING;