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

    private _disconnectTimers = new Map<string, number>();
    
    constructor() {
        super({scene: [BattleRoyaleScene]});

        this.game.events.on(Phaser.Core.Events.READY, () => {
            SpaceSimServer.io = this.io;
            SpaceSimServer.io.on('connection', (socket: Socket) => this._setupSocket(socket));
        });
    }

    private _setupSocket(socket: Socket): void {
        console.debug(`new socket connection: '${socket.id}' from '${socket.request.connection.remoteAddress}'`);
        socket.on('disconnect', (reason: DisconnectReason) => this._removeUser(socket, reason))
            .on(Constants.Socket.SET_PLAYER_DATA, (data: SpaceSimUserData) => this._addUser(socket, data))
            .on(Constants.Socket.JOIN_ROOM, (data: SpaceSimUserData) => this._joinAvailableRoom(socket, data));
    }

    private _addUser(socket: Socket, data: SpaceSimUserData): void {
        if (SpaceSimUserData.isValid(data)) {
            if (this._tryReconnectUser(socket, data) || this._tryAddNewUser(socket, data)) {
                console.debug(`user '${JSON.stringify(data)}' added; returning '${Constants.Socket.USER_ACCEPTED}' event to client.`);
                socket.emit(Constants.Socket.USER_ACCEPTED, data);
                return;
            }
        }

        console.debug(`invalid user data '${JSON.stringify(data)}' received; returning '${Constants.Socket.INVALID_USER_DATA}' event to client.`);
        socket.emit(Constants.Socket.INVALID_USER_DATA);
    }

    private _tryReconnectUser(socket: Socket, data: SpaceSimUserData): boolean {
        const previousConnection = SpaceSimServer
            .users(data)
            .find(u => u.socketId != null);
        if (previousConnection) {
            console.info(`user '${JSON.stringify(data)}' is reconnecting with socket '${socket.id}'`);
            // user is reconnecting...
            const updated: SpaceSimServerUserData = {
                ...previousConnection,
                socketId: socket.id
            };
            SpaceSimServer.usersTable.set(SpaceSimUserData.uniqueKey(updated), updated);
            const timerId = this._disconnectTimers.get(SpaceSimUserData.uniqueKey(updated));
            window.clearTimeout(timerId);
            this._disconnectTimers.delete(SpaceSimUserData.uniqueKey(updated));
            if (updated.room) {
                const scene = SpaceSim.game.scene.getScene(updated.room) as BattleRoyaleScene;
                scene.addPlayer(updated);
            }
            return true;
        } else {
            return false;
        }
    }

    private _tryAddNewUser(socket: Socket, data: SpaceSimUserData): boolean {
        const nameInUseBy = SpaceSimServer.users({name: data.name}).length;
        if (nameInUseBy > 0) {
            console.debug(`name already in use so user cannot be added: ${JSON.stringify(data)}`);
            return false;
        } else {
            SpaceSimServer.usersTable.set(SpaceSimUserData.uniqueKey(data), {
                ...data,
                socketId: socket.id
            });
            return true;
        }
    }

    private _removeUser(socket: Socket, reason: DisconnectReason): void {
        console.debug(`socket: ${socket.id} disconnected due to:`, reason);
        const user = SpaceSimServer.users({socketId: socket.id}).find(u => u != null);
        if (user) {
            console.debug(`creating timeout to remove user '${JSON.stringify(user)}' in ${Constants.Timing.DISCONNECT_TIMEOUT_MS} ms`);
            this._disconnectTimers.set(SpaceSimUserData.uniqueKey(user), window.setTimeout(() => {
                SpaceSimServer.usersTable.delete(SpaceSimUserData.uniqueKey(user));
                const scene = SpaceSim.game.scene.getScene(user.room) as BattleRoyaleScene;
                if (scene) {
                    scene.removePlayer(user);
                }
            }, Constants.Timing.DISCONNECT_TIMEOUT_MS));
        }
    }

    private _joinAvailableRoom(socket: Socket, data: SpaceSimUserData): void {
        console.debug(`received '${Constants.Socket.JOIN_ROOM}' event from socket: '${socket.id}'`);
        let added: boolean = false;
        const user = SpaceSimServer.users({
            ...data,
            socketId: socket.id
        }).find(u => u != null);
        if (user) {
            console.debug(`attempting to add user ${JSON.stringify(user)} to a room...`);
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
        } else {
            console.error(`unable to joing room due to: no existing user found for socket '${socket.id}' with data '${JSON.stringify(data)}'`);
        }
    }
}

export module SpaceSimServer {
    export var io: Server;
    export const usersTable = new Map<string, SpaceSimServerUserData>();
    export const users = (findBy: Partial<SpaceSimServerUserData> & {room?: string}): Array<SpaceSimServerUserData> => {
        let uArr = Array.from(SpaceSimServer.usersTable.values());
        if (findBy) {
            uArr = uArr.filter(u => {
                if (findBy.fingerprint && u.fingerprint !== findBy.fingerprint) return false;
                if (findBy.name && u.name !== findBy.name) return false;
                if (findBy.room) {
                    if (u.room !== findBy.room) {
                        let socket = SpaceSimServer.io.sockets.sockets.get(u.socketId);
                        if (socket != null && socket.rooms.size > 0) {
                            if (!Array.from(socket.rooms.keys()).includes(findBy.room)) return false;
                        }
                    }
                }
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