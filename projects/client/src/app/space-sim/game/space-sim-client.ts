import "phaser";
import { SpaceSim, Ship, Size } from "space-sim-server";
import { GameOverScene } from "./scenes/game-over-scene";
import { GameplayHudScene } from "./scenes/gameplay-hud-scene";
import { GameplayScene } from "./scenes/gameplay-scene";
import { StartupScene } from "./scenes/startup-scene";
import { SpaceSimClientOptions } from "./space-sim-client-options";
import { Socket } from "socket.io-client";
import { MultiplayerScene } from "./scenes/multiplayer-scene";
import { MultiplayerHudScene } from "./scenes/multiplayer-hud-scene";
import { AiController } from "./controllers/ai-controller";

export class SpaceSimClient {
    constructor(options?: SpaceSimClientOptions) {
        const parent: HTMLDivElement = document.getElementById(options?.parentElementId || 'space-sim') as HTMLDivElement;
        const size = SpaceSimClient.getSize(options?.parentElementId);
        SpaceSim.debug = options.debug ?? false;
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
                    debug: SpaceSim.debug,
                    gravity: { x: 0, y: 0 },
                }
            },
            roundPixels: true,
            scene: [StartupScene, GameplayScene, GameplayHudScene, MultiplayerScene, MultiplayerHudScene, GameOverScene]
        };
        SpaceSim.game = new Phaser.Game(conf);
        SpaceSim.game.events.on(Phaser.Core.Events.READY, () => SpaceSimClient.resize());
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

export module SpaceSimClient {
    var _inst: SpaceSimClient;
    export function start(options?: SpaceSimClientOptions): SpaceSimClient {
        SpaceSim.debug = options?.debug || false;
        if (!_inst) {
            _inst = new SpaceSimClient(options);
        }
        return _inst;
    }
    export function stop(): void {
        if (_inst) {
            SpaceSim.game?.destroy(true, true);
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
            const size = SpaceSimClient.getSize();
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
    export var socket: Socket;
    export var player: Ship;
    export const opponents = new Array<AiController>();
}