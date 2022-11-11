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
            height: options?.height || window.innerHeight,
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.NONE
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
        SpaceSim.game.events.on(Phaser.Core.Events.READY, () => SpaceSim.resize());
        SpaceSim.game.events.on(Phaser.Core.Events.HIDDEN, () => {
            SpaceSim.game.scene.getScenes(true).forEach(s => {
                SpaceSim.game.scene.pause(s);
            });
        });
        SpaceSim.game.events.on(Phaser.Core.Events.VISIBLE, () => {
            SpaceSim.game.scene.getScenes(false).forEach(s => {
                if (s.scene.isPaused(s)) {
                    SpaceSim.game.scene.resume(s);
                }
            });
        });
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
    export function resize(): void {
        const canvas: HTMLCanvasElement = SpaceSim.game?.canvas;
        if (canvas) {
            canvas.style.margin = '0px';
            canvas.style.padding = '0px';
            canvas.style.width='100%';
            canvas.style.height='100%';
            const bounds = canvas.getBoundingClientRect();
            canvas.width  = bounds.width;
            canvas.height = bounds.height;
            SpaceSim.game?.scale.setGameSize(bounds.width, bounds.height);
        }
        SpaceSim.game?.scene.getScenes(true).forEach(s => {
            s.scene.restart();
        });
    }
    export var player: ShipPod;
    export var opponents: ShipPod[] = [];
    export var game: Phaser.Game;
    export var map: GameMap;
    export var debug: boolean = false;
}