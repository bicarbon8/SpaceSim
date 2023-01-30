import { GameServerEngine } from "phaser-game-server-engine";
import { DataTable, GameLevelOptions, Logging, SpaceSim } from "space-sim-shared";
import { BattleRoyaleScene } from "./scenes/battle-royale-scene";
import { SpaceSimServerUserData } from "./space-sim-server-user-data";
import { ServerSocketManager } from "./utilities/server-socket-manager";

export class SpaceSimServer extends GameServerEngine {
    constructor() {
        super({scene: [BattleRoyaleScene]});

        this.game.events.on(Phaser.Core.Events.READY, () => {
            SpaceSimServer.io = new ServerSocketManager({io: this.io});
        });
    }
}

export module SpaceSimServer {
    export var io: ServerSocketManager;
    export const users = new DataTable<SpaceSimServerUserData>({indexKeys: ['fingerprint', 'name']});
    export const rooms = (): Array<BattleRoyaleScene> => SpaceSim.game.scene.getScenes(true)
        .map(s => s as BattleRoyaleScene);
    export module Constants {
        export module Rooms {
            export const MAX_BOTS = 25;
        }
        export module Map {
            export const MAP_WIDTH = 50; // tiles, not pixels
            export const MAP_HEIGHT = 50;
            export const MAP_OPTIONS: GameLevelOptions = {
                seed: 'bicarbon8',
                width: MAP_WIDTH, // in tiles, not pixels
                height: MAP_HEIGHT,
                maxRooms: 1,
                roomWidth: {min: MAP_WIDTH-1, max: MAP_WIDTH},
                roomHeight: {min: MAP_HEIGHT-1, max: MAP_HEIGHT},
                doorPadding: 0
            } as const;
        }
    }
}

SpaceSim.debug = false;
Logging.loglevel = 'info';
const server = new SpaceSimServer();
SpaceSim.game = server.game;