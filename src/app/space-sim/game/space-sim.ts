import "phaser";
import { GameMap } from "./map/game-map";
import { GameOverScene } from "./scenes/game-over-scene";
import { GameplayScene } from "./scenes/gameplay-scene";
import { StartupScene } from "./scenes/startup-scene";
import { ShipPod } from "./ships/ship-pod";
import { SpaceSimOptions } from "./space-sim-options";

export class SpaceSim {
    constructor(options?: SpaceSimOptions) {
        let conf: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: options?.width || window.innerWidth,
            height: options?.height || window.innerHeight * 0.8,
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            backgroundColor: '#000000',
            parent: options?.parentElementId || 'space-sim',
            physics: {
                default: 'arcade',
                arcade: {
                    debug: (options?.debug === undefined) ? false : options.debug,
                    gravity: { x: 0, y: 0 },
                }
            },
            roundPixels: true,
            scene: [StartupScene, GameplayScene, GameOverScene]
        };
        SpaceSim.game = new Phaser.Game(conf);
          
        window.addEventListener('resize', () => {
            SpaceSim.game.canvas.width = options?.width || window.innerWidth;
            SpaceSim.game.canvas.height = options?.height || window.innerHeight * 0.8;
            SpaceSim.game.scale.refresh();
        });

        document.addEventListener("visibilitychange", () => {
            SpaceSim.game.scene.getScenes(false).forEach((scene: Phaser.Scene) => {
                if (document.hidden) {
                    SpaceSim.game.scene.pause(scene);
                } else {
                    SpaceSim.game.scene.resume(scene);
                }
            });
        }, false);
    }
}

export module SpaceSim {
    var _inst: SpaceSim;
    export function start(options?: SpaceSimOptions): SpaceSim {
        SpaceSim.debug = options?.debug || false;
        if (!_inst) {
            _inst = new SpaceSim(options);
        }
        return _inst;
    }
    export function stop(): void {
        if (game) {
            game.destroy(true, true);
        }
    }
    export var player: ShipPod;
    export var opponents: ShipPod[] = [];
    export var game: Phaser.Game;
    export var map: GameMap;
    export var debug: boolean = false;
}