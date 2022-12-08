import * as Phaser from "phaser";
import { GameMapOptions } from "./map/game-map-options";
import { BattleRoyaleScene } from "./scenes/battle-royale-scene";
import { SpaceSim } from "./space-sim";

export module SpaceSimServer {
    const conf: Phaser.Types.Core.GameConfig = {
        type: Phaser.HEADLESS,
        width: 1,
        height: 1,
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.NONE
        },
        backgroundColor: '#000000',
        parent: 'space-sim-server',
        physics: {
            default: 'arcade',
            arcade: {
                debug: false,
                gravity: { x: 0, y: 0 },
            }
        },
        scene: [BattleRoyaleScene],
        autoFocus: false
    };
    const mapWidth = 100;
    const mapHeight = 100;
    export const mapOpts: GameMapOptions = {
        seed: 'bicarbon8',
        width: mapWidth, // in tiles, not pixels
        height: mapHeight,
        maxRooms: 1,
        roomMinWidth: mapWidth,
        roomMaxWidth: mapWidth,
        roomMinHeight: mapHeight,
        roomMaxHeight: mapHeight
    };

    export const start = () => {
        SpaceSim.game = new Phaser.Game(conf);
    }
}

SpaceSimServer.start();
console.info('loaded server file...');