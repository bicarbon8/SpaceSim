import { GameServerEngine } from "phaser-game-server-engine";
import { Server, Socket } from "socket.io";
import { DisconnectReason } from "socket.io/dist/socket";
import { Constants, GameLevelOptions, SpaceSim, SpaceSimUserData } from "space-sim-shared";
import { BattleRoyaleScene } from "./scenes/battle-royale-scene";
import { SpaceSimServerUserData } from "./space-sim-server-user-data";

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
            SpaceSimServer.io = this.io;
            SpaceSimServer.io.on('connection', (socket: Socket) => this._setupUser(socket));
        });
    }

    private _setupUser(socket: Socket): void {
        console.debug(`new socket connection: '${socket.id}' from '${socket.request.connection.remoteAddress}'`);
        socket.on(Constants.Socket.SET_PLAYER_DATA, (data: SpaceSimUserData) => this._addUser(socket, data))
            .on('disconnect', (reason: DisconnectReason) => this._removeUser(socket, reason))
            .on(Constants.Socket.JOIN_ROOM, (data: SpaceSimUserData) => this._joinAvailableRoom(socket, data));
    }

    private _addUser(socket: Socket, data: SpaceSimUserData): void {
        if (data?.fingerprint?.length) {
            const previousConnection = SpaceSimServer.users({fingerprint: data.fingerprint, name: data.name})
                .find(u => u != null);
            if (previousConnection?.socketId) {
                // user is reconnecting so remove old value
                SpaceSimServer.usersTable.delete(previousConnection);
            }
            const fullData = {
                ...previousConnection,
                ...data,
                socketId: socket.id
            };
            SpaceSimServer.usersTable.add(fullData);
            if (fullData.room?.length) {
                const scene = SpaceSim.game.scene.getScene(fullData.room) as BattleRoyaleScene;
                scene.addPlayer(fullData);
                console.debug(`user ${JSON.stringify(fullData)} reconnected and added back into existing room: ${scene.ROOM_NAME}`);
            }
        } else {
            console.debug(`invalid data of ${JSON.stringify(data)} sent... disconnecting socket.`);
            socket.disconnect(true);
        }
    }

    private _removeUser(socket: Socket, reason: DisconnectReason): void {
        console.debug(`socket: ${socket.id} disconnected due to:`, reason);
        const user = SpaceSimServer.users({socketId: socket.id}).find(u => u != null);
        if (user) {
            const scene = SpaceSim.game.scene.getScene(user.room) as BattleRoyaleScene;
            if (scene) {
                scene.removePlayer(user);
            }
            
            window.setTimeout(() => SpaceSimServer.usersTable.delete(user), Constants.Timing.DISCONNECT_TIMEOUT_MS);
        }
    }

    private _joinAvailableRoom(socket: Socket, data: SpaceSimUserData): void {
        console.debug(`attempting to add socket '${socket.id}', user ${JSON.stringify(data)} to a room...`);
        this._addUser(socket, data);
        let added: boolean = false;
        const user = SpaceSimServer.users({socketId: socket.id}).find(u => u != null);
        if (user) {
            // iterate over rooms and see if any have less than max allowed players
            for (let scene of SpaceSimServer.rooms()) {
                if (scene.getShips().length < Constants.Socket.MAX_USERS_PER_ROOM) {
                    scene.addPlayer(user);
                    added = true;
                }
            }

            if (!added) {
                // create new scene + room and add
                const scene = new BattleRoyaleScene();
                console.info(`starting new scene '${scene.ROOM_NAME}'`)
                SpaceSim.game.scene.add(scene.ROOM_NAME, scene, true);
                scene.addPlayer(user);
            }
        }
    }
}

export module SpaceSimServer {
    export var io: Server;
    export const usersTable = new Set<SpaceSimServerUserData>();
    export const users = (findBy: Partial<SpaceSimServerUserData>): Array<SpaceSimServerUserData> => {
        let uArr = Array.from(SpaceSimServer.usersTable.keys());
        if (findBy) {
            uArr = uArr.filter(u => {
                if (findBy.fingerprint && u.fingerprint !== findBy.fingerprint) return false;
                if (findBy.name && u.name !== findBy.name) return false;
                if (findBy.room && u.room !== findBy.room) return false;
                if (findBy.socketId && u.socketId !== findBy.socketId) return false;
                return true;
            });
        }
        return uArr;
    }
    export const rooms = (): Array<BattleRoyaleScene> => SpaceSim.game.scene.getScenes(true)
        .map(s => s as BattleRoyaleScene);
}

const server = new SpaceSimServer();
SpaceSim.game = server.game;