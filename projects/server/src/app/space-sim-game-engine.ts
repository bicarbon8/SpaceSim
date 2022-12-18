import { GameEngine } from "phaser-server-engine";
import { GameMapOptions } from "./map/game-map-options";
import { BattleRoyaleScene } from "./scenes/battle-royale-scene";
import { SpaceSim } from "./space-sim";

export class SpaceSimGameEngine extends GameEngine {
    private static readonly MAP_WIDTH = 50; // tiles, not pixels
    private static readonly MAP_HEIGHT = 50;
    public static readonly MAP_OPTIONS: GameMapOptions = {
        seed: 'bicarbon8',
        width: SpaceSimGameEngine.MAP_WIDTH, // in tiles, not pixels
        height: SpaceSimGameEngine.MAP_HEIGHT,
        maxRooms: 1,
        roomMinWidth: SpaceSimGameEngine.MAP_WIDTH-1,
        roomMaxWidth: SpaceSimGameEngine.MAP_WIDTH,
        roomMinHeight: SpaceSimGameEngine.MAP_HEIGHT-1,
        roomMaxHeight: SpaceSimGameEngine.MAP_HEIGHT,
        doorPadding: 0
    };
    
    constructor() {
        super({scene: [BattleRoyaleScene]});
    }
}

SpaceSim.game = new SpaceSimGameEngine().game;