import "phaser";
import { Size } from "./interfaces/size";
import { GameMap } from "./map/game-map";
import { GameOverScene } from "./scenes/game-over-scene";
import { GameplayHudScene } from "./scenes/gameplay-hud-scene";
import { GameplayScene } from "./scenes/gameplay-scene";
import { StartupScene } from "./scenes/startup-scene";
import { ShipPod } from "./ships/ship-pod";
import { SpaceSimOptions } from "./space-sim-options";

export class SpaceSim {
    constructor(options?: SpaceSimOptions) {
        const parent: HTMLDivElement = document.getElementById(options?.parentElementId || 'space-sim') as HTMLDivElement;
        const size = SpaceSim.getSize(options?.parentElementId);
        let conf: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: options?.width || size.width,
            height: options?.height || size.height,
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.NONE
            },
            backgroundColor: '#000000',
            parent: parent,
            physics: {
                default: 'arcade',
                arcade: {
                    debug: (options?.debug === undefined) ? false : options.debug,
                    gravity: { x: 0, y: 0 },
                }
            },
            roundPixels: true,
            scene: [StartupScene, GameplayScene, GameplayHudScene, GameOverScene]
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
            canvas.width  = 0; // allow container to collapse
            canvas.height = 0; // allow container to collapse
            canvas.style.margin = '0px';
            canvas.style.padding = '0px';
            canvas.style.width='100%';
            canvas.style.height='100%';
            const size = SpaceSim.getSize();
            canvas.width  = size.width;
            canvas.height = size.height;
            SpaceSim.game?.scale.resize(size.width, size.height);
        }
        SpaceSim.game?.scene.getScenes(true).forEach(s => {
            if (s['resize']) {
                s['resize']();
            } else {
                s.scene.restart();
            }
        });
    }
    export function getSize(parentId?: string): Size {
        let size: Size;
        try {
            const main = document.querySelector('main') as HTMLElement;
            const s = main.getBoundingClientRect();
            size = {width: s.width, height: s.height};
        } catch (e) {
            /* ignore */
        }
        if (!size) {
            const parent = document.getElementById(parentId || 'space-sim');
            const s = parent.getBoundingClientRect();
            size = {width: s.width, height: s.height};
        }
        return size;
    }
    export var player: ShipPod;
    export var opponents: ShipPod[] = [];
    export var game: Phaser.Game;
    export var map: GameMap;
    export var debug: boolean = false;
}