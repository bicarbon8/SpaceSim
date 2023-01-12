import "phaser";
import { SpaceSim, Ship, Size, SpaceSimUserData, Helpers, Constants } from "space-sim-shared";
import { GameOverScene } from "./scenes/game-over-scene";
import { GameplayHudScene } from "./scenes/gameplay-hud-scene";
import { GameplayScene } from "./scenes/gameplay-scene";
import { StartupScene } from "./scenes/startup-scene";
import { SpaceSimClientOptions } from "./space-sim-client-options";
import { io, Socket } from "socket.io-client";
import { MultiplayerScene } from "./scenes/multiplayer-scene";
import { MultiplayerHudScene } from "./scenes/multiplayer-hud-scene";
import { AiController } from "./controllers/ai-controller";
import { GameMode } from "./interfaces/game-mode";
import { SetNameScene } from "./scenes/set-name-scene";
import { Camera } from "./ui-components/camera";
import { Radar } from "./ui-components/radar";
import { environment } from "src/environments/environment";
import { DisconnectDescription } from "socket.io-client/build/esm/socket";
import getBrowserFingerprint from "get-browser-fingerprint";

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
            scene: [
                StartupScene, 
                GameplayScene, 
                GameplayHudScene, 
                SetNameScene, 
                MultiplayerScene, 
                MultiplayerHudScene, 
                GameOverScene
            ]
        };
        SpaceSim.game = new Phaser.Game(conf);
        SpaceSim.game.events.on(Phaser.Core.Events.READY, () => {
            SpaceSimClient.resize();
            this._createSocket();
        });
        SpaceSim.game.events.on(Phaser.Core.Events.HIDDEN, () => {
            if (SpaceSimClient.mode !== 'multiplayer') {
                SpaceSim.game.scene.getScenes(true).forEach(s => {
                    SpaceSim.game.scene.pause(s);
                });
            }
        });
        SpaceSim.game.events.on(Phaser.Core.Events.VISIBLE, () => {
            SpaceSim.game.scene.getScenes(false).forEach(s => {
                if (s.scene.isPaused(s)) {
                    SpaceSim.game.scene.resume(s);
                }
            });
        });

        const fingerprint: string = `${getBrowserFingerprint()}`;
        const dataStr = localStorage.getItem(Constants.GAME_NAME);
        let playerData: SpaceSimUserData;
        if (dataStr) {
            try {
                playerData = JSON.parse(dataStr) as SpaceSimUserData;
            } catch (e) {
                playerData = {name: '', fingerprint: ''};
            }
        }
        SpaceSimClient.playerData = {
            ...playerData,
            fingerprint: fingerprint
        };
        localStorage.setItem(Constants.GAME_NAME, JSON.stringify(SpaceSimClient.playerData));
    }

    private _createSocket(): void {
        if (!SpaceSimClient.socket || SpaceSimClient.socket.disconnected) {
            SpaceSimClient.socket = io(`${environment.websocket}`);
            SpaceSimClient.socket.on('connect', () => {
                console.debug(`connected to server at: ${environment.websocket}`);
                // handle reconnect scenario
                if (SpaceSimClient.playerData.name && SpaceSimClient.playerData.fingerprint) {
                    SpaceSimClient.socket.emit(Constants.Socket.SET_PLAYER_DATA, SpaceSimClient.playerData);
                }
            }).on('disconnect', (reason: Socket.DisconnectReason, description: DisconnectDescription) => {
                console.warn(`socket disconnect`, reason, description);
                if (reason === "io server disconnect") {
                    // the disconnection was initiated by the server, you need to reconnect manually
                    console.info(`attempting to reconnect to server...`);
                    SpaceSimClient.socket.connect();
                }
            });
        }
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
    export var playerData: SpaceSimUserData;
    export const opponents = new Array<AiController>();
    export var mode: GameMode = 'singleplayer';
    export var camera: Camera;
    export var radar: Radar;
}