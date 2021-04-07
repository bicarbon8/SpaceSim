import "phaser";
import { FarStarsScene } from "./scenes/far-stars-scene";
import { OverlayScene } from "./scenes/overlay-scene";
import { ShipScene } from "./scenes/ship-scene";
import { SystemScene } from "./scenes/system-scene";

export class SpaceSim {
    private _game: Phaser.Game;
    
    constructor() {
        let conf: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            scale: {
                width: window.innerWidth,
                height: window.innerHeight * 0.8
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
          this._game = new Phaser.Game(conf);
          window.addEventListener('resize', () => {
            this._game.scale.refresh();
          });
    }

    get game(): Phaser.Game {
        return this._game;
    }
}