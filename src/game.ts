import { ShipScene } from "./scenes/ship-scene";
import { Globals } from "./utilities/globals";
import { OverlayScene } from "./scenes/overlay-scene";
import { FarStarsScene } from "./scenes/far-stars-scene";
import { SystemScene } from "./scenes/system-scene";

const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        width: window.innerWidth,
        height: window.innerHeight
    },
    backgroundColor: '#000000',
    parent: 'space-sim',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
        }
    },
    scene: [FarStarsScene, SystemScene, ShipScene, OverlayScene]
};
export const game: Phaser.Game = new Phaser.Game(gameConfig);

window.addEventListener('resize', () => {
    game.scale.refresh();
});

Globals.game = game;
Globals.debug = true;