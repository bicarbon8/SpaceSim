import { ShipScene } from "./scenes/ship-scene";
import { Globals } from "./utilities/globals";
import { OverlayScene } from "./scenes/overlay-scene";
import { FarthestStarsScene } from "./scenes/farthest-stars-scene";
import { NearestStarsScene } from "./scenes/nearest-stars-scene";

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
    scene: [FarthestStarsScene, NearestStarsScene, ShipScene, OverlayScene]
};
export const game: Phaser.Game = new Phaser.Game(gameConfig);

window.addEventListener('resize', () => {
    game.scale.refresh();
});

Globals.game = game;