import { GameServerEngine } from "phaser-game-server-engine";
import { GameLevelOptions, SpaceSim } from "space-sim-shared";
import { BattleRoyaleScene } from "./scenes/battle-royale-scene";
import { SpaceSimServerUserData } from "./space-sim-server-user-data";
import { ServerSocketManager } from "./utilities/server-socket-manager";

export class SpaceSimServer extends GameServerEngine {
    private static readonly MAP_WIDTH = 50; // tiles, not pixels
    private static readonly MAP_HEIGHT = 50;
    public static readonly MAP_OPTIONS: GameLevelOptions = {
        seed: 'bicarbon8',
        width: SpaceSimServer.MAP_WIDTH, // in tiles, not pixels
        height: SpaceSimServer.MAP_HEIGHT,
        maxRooms: 1,
        roomMinWidth: SpaceSimServer.MAP_WIDTH-1,
        roomMaxWidth: SpaceSimServer.MAP_WIDTH,
        roomMinHeight: SpaceSimServer.MAP_HEIGHT-1,
        roomMaxHeight: SpaceSimServer.MAP_HEIGHT,
        doorPadding: 0
    };
    
    constructor() {
        super({scene: [BattleRoyaleScene]});

        this.game.events.on(Phaser.Core.Events.READY, () => {
            SpaceSimServer.io = new ServerSocketManager({io: this.io});
        });
    }
}

export module SpaceSimServer {
    export var io: ServerSocketManager;
    export const usersTable = new Map<string, SpaceSimServerUserData>();
    export const users = (findBy: Partial<SpaceSimServerUserData>): Array<SpaceSimServerUserData> => {
        const uArr = Array.from(SpaceSimServer.usersTable.values());
        let results: Array<SpaceSimServerUserData>;
        if (findBy) {
            const findByKeys = Object.keys(findBy);
            results = uArr.filter(u => {
                for (let key of findByKeys) {
                    if (findBy[key] !== u[key]) {
                        return false;
                    }
                }
                return true;
            });
        }
        return results;
    }
    export const rooms = (): Array<BattleRoyaleScene> => SpaceSim.game.scene.getScenes(true)
        .map(s => s as BattleRoyaleScene);
}

SpaceSim.debug = true;
const server = new SpaceSimServer();
SpaceSim.game = server.game;