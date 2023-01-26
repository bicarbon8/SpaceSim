import { Server, Socket } from "socket.io";
import { DisconnectReason } from "socket.io/dist/socket";
import { Constants, GameStats, Helpers, Ship, ShipConfig, ShipSupplyOptions, SpaceSim, SpaceSimUserData } from "space-sim-shared";
import { BattleRoyaleScene } from "../scenes/battle-royale-scene";
import { SpaceSimServer } from "../space-sim-server";
import { SpaceSimServerUserData } from "../space-sim-server-user-data";

export type ServerSocketManagerOptions = {
    io: Server;
};

export class ServerSocketManager {
    public readonly io: Server;

    private readonly _disconnectTimers = new Map<string, number>();
    private _connections: number = 0;
    private _disconnects: number = 0;

    constructor(options: ServerSocketManagerOptions) {
        this.io = options.io;
        this._setupIo();
    }

    get sockets(): Array<Socket> {
        return Array.from(this.io.sockets.sockets.values());
    }

    getSocket(id: string): Socket {
        return this.io.sockets.sockets.get(id);
    }

    getSocketsInRoom(room: string): Array<Socket> {
        return this.sockets.filter(s => Array.from(s.rooms.values()).includes(room));
    }

    joinRoom(socketId: string, room: string): this {
        const socket = this.getSocket(socketId);
        if (socket) {
            socket.join(room);
        }
        return this;
    }

    leaveRoom(socketId: string, room: string): this {
        const socket = this.getSocket(socketId);
        if (socket) {
            socket.leave(room);
        }
        return this;
    }

    sendUserAcceptedResponse(socketId: string, data: SpaceSimUserData): this {
        return this.socketEmit(socketId, Constants.Socket.USER_ACCEPTED, data);
    }

    sendInvalidUserDataResponse(socketId: string, message: string): this {
        return this.socketEmit(socketId, Constants.Socket.INVALID_USER_DATA, message);
    }

    sendInvalidRequestEvent(socketId: string, message: string): this {
        return this.socketEmit(socketId, Constants.Socket.INVALID_REQUEST, message);
    }

    sendUpdateStatsToRoom(room, stats: Array<Partial<GameStats>>): this {
        return this.roomEmit(room, Constants.Socket.UPDATE_STATS, stats);
    }

    sendJoinRoomResponse(socketId: string): this {
        return this.socketEmit(socketId, Constants.Socket.JOIN_ROOM);
    }

    sendSetShipIdResponse(socketId: string, shipId: string): this {
        return this.socketEmit(socketId, Constants.Socket.SET_PLAYER_ID, shipId);
    }

    /**
     * used to tell all sockets except the one originating the event that engines are enabled
     * for the specified ship id
     * @param socketId socket to not get event
     * @param room room to broadcast to
     * @param shipId the id of the ship with engine enabled
     * @returns this
     */
    broadcastEnableEngineEventToRoom(socketId: string, room: string, shipId: string): this {
        return this.socketRoomBroadcast(socketId, room, Constants.Socket.ENGINE_ENABLED, shipId);
    }

    /**
     * used to tell all sockets in a room that a ship has engines enabled
     * @param room the room to emit within
     * @param shipId the id of the ship with engine enabled
     * @returns this
     */
    sendEnableEngineEventToRoom(room: string, shipId: string): this {
        return this.roomEmit(room, Constants.Socket.ENGINE_ENABLED, shipId);
    }

    broadcastDisableEngineEventToRoom(socketId: string, room: string, shipId: string): this {
        return this.socketRoomBroadcast(socketId, room, Constants.Socket.ENGINE_DISABLED, shipId);
    }

    sendDisableEngineEventToRoom(room: string, shipId: string): this {
        return this.roomEmit(room, Constants.Socket.ENGINE_DISABLED, shipId);
    }

    broadcastEnableWeaponEventToRoom(socketId: string, room: string, shipId: string): this {
        return this.socketRoomBroadcast(socketId, room, Constants.Socket.WEAPON_ENABLED, shipId);
    }

    sendEnableWeaponEventToRoom(room: string, shipId: string): this {
        return this.roomEmit(room, Constants.Socket.WEAPON_ENABLED, shipId);
    }

    broadcastDisableWeaponEventToRoom(socketId: string, room: string, shipId: string): this {
        return this.socketRoomBroadcast(socketId, room, Constants.Socket.WEAPON_DISABLED, shipId);
    }

    sendDisableWeaponEventToRoom(room: string, shipId: string): this {
        return this.roomEmit(room, Constants.Socket.WEAPON_DISABLED, shipId);
    }

    sendShipDestroyedEventToRoom(room: string, shipId: string): this {
        return this.roomEmit(room, Constants.Socket.SHIP_DESTROYED, shipId);
    }

    /**
     * sent when a socket attempts to reconnect and their ship no longer
     * exists to let them know they should go to game over
     */
    sendShipDestroyedEventToSocket(socketId: string): this {
        return this.socketEmit(socketId, Constants.Socket.SHIP_DESTROYED);
    }

    sendUpdatePlayersEvent(room: string, configs: Array<ShipConfig>): this {
        return this.roomEmit(room, Constants.Socket.UPDATE_PLAYERS, configs);
    }

    sendUpdateSuppliesEvent(room: string, configs: Array<ShipSupplyOptions>): this {
        return this.roomEmit(room, Constants.Socket.UPDATE_SUPPLIES, configs);
    }

    sendFlickerSuppliesEvent(room: string, ...ids: Array<string>): this {
        return this.roomEmit(room, Constants.Socket.FLICKER_SUPPLIES, ...ids);
    }

    sendRemoveSuppliesEvent(room: string, ...ids: Array<string>): this {
        return this.roomEmit(room, Constants.Socket.REMOVE_SUPPLIES, ...ids);
    }

    private socketEmit(socketId: string, event: string, ...args: Array<any>): this {
        Helpers.trycatch(() => {
            const socket = this.getSocket(socketId);
            if (socket) {
                Helpers.log('trace', `sending '${event}' event with args ${JSON.stringify(args)} to client '${socketId}'...`);
                socket.emit(event, ...args);
            }
        }, 'warn', `[${Helpers.dts()}]: error sending event '${event}' to socket '${socketId}' with args: ${JSON.stringify(args)}`, 'all');
        return this;
    }

    private socketRoomBroadcast(socketId: string, room: string, event: string, ...args: Array<any>): this {
        Helpers.trycatch(() => {
            const socket = this.getSocket(socketId);
            if (socket) {
                Helpers.log('trace', `broadcasting event '${event}' with args ${JSON.stringify(args)} to room '${room}'...`);
                socket.broadcast.in(room).emit(event, ...args);
            }
        }, 'warn', `[${Helpers.dts()}]: error broadcasting event '${event}' to room '${room}' with args: ${JSON.stringify(args)}`, 'all');
        return this;
    }

    private roomEmit(room: string, event: string, ...args: Array<any>): this {
        Helpers.trycatch(() => {
            Helpers.log('trace', `sending '${event}' event with args ${JSON.stringify(args)} to room '${room}'...`);
            this.io.in(room).emit(event, ...args);
        }, 'warn', `[${Helpers.dts()}]: error sending event '${event}' to room '${room}' with args: ${JSON.stringify(args)}`, 'all');
        return this;
    }

    private _setupIo(): void {
        Helpers.trycatch(() => {
            this.io.on('connection', (socket: Socket) => {
                this._connections++;
                Helpers.log('info', `new socket connection (#${this._connections}): '${socket.id}' from '${socket.request.connection.remoteAddress}'`);
                // TODO: add measures to prevent abuse
                socket.once('disconnect', (reason: DisconnectReason) => {
                    this._handleDisconnectEvent(socket.id, reason)
                }).onAny((event: string, ...args: Array<any>) => {
                    this._handleSocketEvents(socket.id, event, ...args);
                });
            });
        }, 'error');
    }

    private _handleSocketEvents(socketId: string, event: string, ...args: Array<any>): void {
        Helpers.trycatch(() => {
            switch(event) {
                case 'disconnect':
                    Helpers.log('debug', `disconnect event received in 'onAny' handler`);
                    break;
                case Constants.Socket.SET_PLAYER_DATA:
                    Helpers.log('info', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleSetPlayerDataEvent(socketId, args[0]);
                    break;
                case Constants.Socket.JOIN_ROOM:
                    Helpers.log('info', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleJoinRoomEvent(socketId, args[0]);
                    break;
                case Constants.Socket.REQUEST_MAP:
                    Helpers.log('info', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleRequestMapResponse(socketId, args[0]);
                    break;
                case Constants.Socket.REQUEST_SHIP:
                    Helpers.log('info', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleRequestShipResponse(socketId, args[0]);
                    break;
                case Constants.Socket.ENGINE_ENABLED:
                    Helpers.log('debug', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleEnableEngineResponse(socketId, args[0]);
                    break;
                case Constants.Socket.ENGINE_DISABLED:
                    Helpers.log('debug', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleDisableEngineResponse(socketId, args[0]);
                    break;
                case Constants.Socket.WEAPON_ENABLED:
                    Helpers.log('debug', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleEnableWeaponResponse(socketId, args[0]);
                    break;
                case Constants.Socket.WEAPON_DISABLED:
                    Helpers.log('debug', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleDisableWeaponResponse(socketId, args[0]);
                    break;
                case Constants.Socket.SHIP_DESTROYED:
                    Helpers.log('info', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleShipDestroyedEvent(socketId, args[0]);
                    break;
                case Constants.Socket.SET_PLAYER_ANGLE:
                    Helpers.log('trace', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleSetPlayerAngleEvent(socketId, args[0], args[1]);
                    break;
                default:
                    Helpers.log('warn', `unknown socket event received from socket '${socketId}': event '${event}' with data:`, args);
                    break;
            }
        }, 'warn', `error handling event '${event}' from socket '${socketId}' with data: ${JSON.stringify(args)}`, 'all');
    }

    private _handleDisconnectEvent(socketId: string, reason: DisconnectReason): void {
        this._disconnects++;
        Helpers.log('info', `socket: ${socketId} disconnected (#${this._disconnects}) due to:`, reason);
        const user = SpaceSimServer.users.selectFirst({socketId: socketId});
        if (user?.room) {
            Helpers.log('info', `creating timeout to remove user`, user, `in ${Constants.Timing.DISCONNECT_TIMEOUT_MS} ms`);
            this._disconnectTimers.set(SpaceSimServer.users.getKey(user), window.setTimeout(() => {
                const scene = SpaceSim.game.scene.getScene(user.room) as BattleRoyaleScene;
                if (scene) {
                    scene.removePlayerFromScene(user);
                }
                SpaceSimServer.users.delete(user);
            }, Constants.Timing.DISCONNECT_TIMEOUT_MS));
        }
    }

    private _handleSetPlayerDataEvent(socketId: string, data: SpaceSimUserData): void {
        if (SpaceSimUserData.isValid(data)) {
            if (this._tryReconnectUser(socketId, data) || this._tryAddNewUser(socketId, data)) {
                this.sendUserAcceptedResponse(socketId, data);
                return;
            }
        }

        this.sendInvalidUserDataResponse(socketId, 'unable to reconnect or add new user using supplied data; please choose a different name and try again.');
    }

    private _tryReconnectUser(socketId: string, data: SpaceSimUserData): boolean {
        const previousConnection = SpaceSimServer.users.selectFirst(data);
        if (previousConnection) {
            Helpers.log('info', `known users list updated with user '${JSON.stringify(data)}' who is reconnecting over socket '${socketId}'`);
            // user is reconnecting...
            const updated: SpaceSimServerUserData = {
                ...previousConnection,
                socketId: socketId
            };
            SpaceSimServer.users.update(updated);
            const timerId = this._disconnectTimers.get(SpaceSimServer.users.getKey(updated));
            window.clearTimeout(timerId);
            this._disconnectTimers.delete(SpaceSimServer.users.getKey(updated));
            if (updated.room) {
                const scene = SpaceSim.game.scene.getScene(updated.room) as BattleRoyaleScene;
                scene.addPlayerToScene(updated);
            }
            return true;
        } else {
            return false;
        }
    }

    private _tryAddNewUser(socketId: string, data: SpaceSimUserData): boolean {
        if (SpaceSimServer.users.count({name: data.name}) > 0) {
            Helpers.log('debug', `name already in use so user cannot be added:`, data);
            return false;
        } else {
            const added = SpaceSimServer.users.add({
                ...data,
                socketId: socketId
            });
            if (added) {
                Helpers.log('info', `user '${JSON.stringify(data)}' added to known users over socket '${socketId}'`);
            } else {
                Helpers.log('warn', 'user with same fingerprint and name already exist:', data);
            }
            return added;
        }
    }

    private _handleJoinRoomEvent(socketId: string, data: SpaceSimUserData): void {
        let added: boolean = false;
        const user = SpaceSimServer.users.get(data);
        if (user) {
            Helpers.log('debug', `attempting to add user ${JSON.stringify(user)} to a room...`);
            // iterate over rooms and see if any have less than max allowed players
            for (let scene of SpaceSimServer.rooms()) {
                if (scene.getShips().length < Constants.Socket.MAX_USERS_PER_ROOM) {
                    scene.addPlayerToScene(user);
                    added = true;
                }
            }

            if (!added) {
                // create new scene + room and add
                const scene = new BattleRoyaleScene();
                Helpers.log('info', `starting new scene '${scene.ROOM_NAME}'`)
                SpaceSim.game.scene.add(scene.ROOM_NAME, scene, true);
                scene.addPlayerToScene(user);
            }
        } else {
            console.error(`unable to join room due to: no existing user found for socket '${socketId}' with data '${JSON.stringify(data)}'`);
            this.sendInvalidRequestEvent(socketId, 'no existing user found on server matching request to join room; please resubmit user data and try again');
        }
    }

    private _handleRequestMapResponse(socketId: string, data: SpaceSimUserData): void {
        const user = SpaceSimServer.users.selectFirst(data);
        if (user) {
            const scene = SpaceSimServer.rooms().find(r => r.ROOM_NAME === user.room);
            if (scene) {
                // TODO: add `GameLevel.config` method and use that data instead
                this.socketEmit(socketId, Constants.Socket.UPDATE_MAP, SpaceSimServer.MAP_OPTIONS);
            } else {
                Helpers.log('warn', `no scene could be found matching room '${user.room}' so map data will not be sent`);
                this.sendInvalidRequestEvent(socketId, 'supplied user is not in a room so is not allowed to request a GameLevel');
            }
        } else {
            Helpers.log('warn', `no user could be found using socket '${socketId}' so map data will not be sent`);
            this.sendInvalidRequestEvent(socketId, 'supplied user could not be found; please resend user data and try again');
        }
    }

    private _handleRequestShipResponse(socketId: string, data: SpaceSimUserData): void {
        const user = SpaceSimServer.users.selectFirst(data);
        if (user) {
            const scene = SpaceSimServer.rooms().find(r => r.ROOM_NAME === user.room);
            if (scene) {
                if (scene.getShips().length < 50) {
                    const battle = scene as BattleRoyaleScene;
                    const diff = 50 - scene.getShips().length;
                    for (let i=0; i<diff; i++) {
                        battle.createBot();
                    }
                }
                const ship = scene.getShip(user.shipId) ?? scene.createShip(user);
                Helpers.log('debug', `sending ship id ${ship.id} to client ${socketId}`);
                this.sendSetShipIdResponse(socketId, ship.id);
            } else {
                Helpers.log('warn', `no scene could be found matching room '${user.room}' so new ship not created`);
                this.sendInvalidRequestEvent(socketId, 'supplied user is not in a room so is not allowed to request a Ship');
            }
        } else {
            Helpers.log('warn', `no user could be found using socket '${socketId}' so new ship not created`);
            this.sendInvalidRequestEvent(socketId, 'supplied user could not be found; please resend user data and try again');
        }
    }

    private _handleEnableEngineResponse(socketId: string, data: SpaceSimUserData): void {
        const ship = this._getShipFromUserData(data);
        if (ship) {
            const room = SpaceSimServer.users.selectFirst(data).room;
            this.broadcastEnableEngineEventToRoom(socketId, room, ship.id);
            ship.engine.setEnabled(true);
        } else {
            this.sendShipDestroyedEventToSocket(socketId);
        }
    }

    private _handleDisableEngineResponse(socketId: string, data: SpaceSimUserData): void {
        const ship = this._getShipFromUserData(data);
        if (ship) {
            const room = SpaceSimServer.users.selectFirst(data).room;
            this.broadcastDisableEngineEventToRoom(socketId, room, ship.id);
            ship.engine.setEnabled(false);
        } else {
            this.sendShipDestroyedEventToSocket(socketId);
        }
    }

    private _handleEnableWeaponResponse(socketId: string, data: SpaceSimUserData): void {
        const ship = this._getShipFromUserData(data);
        if (ship) {
            const room = SpaceSimServer.users.selectFirst(data).room;
            this.broadcastEnableWeaponEventToRoom(socketId, room, ship.id);
            ship.weapon.setEnabled(true);
        } else {
            this.sendShipDestroyedEventToSocket(socketId);
        }
    }

    private _handleDisableWeaponResponse(socketId: string, data: SpaceSimUserData): void {
        const ship = this._getShipFromUserData(data);
        if (ship) {
            const room = SpaceSimServer.users.selectFirst(data).room;
            this.broadcastDisableWeaponEventToRoom(socketId, room, ship.id);
            ship.weapon.setEnabled(false);
        } else {
            this.sendShipDestroyedEventToSocket(socketId);
        }
    }

    private _handleShipDestroyedEvent(socketId: string, data: SpaceSimUserData): void {
        const user = SpaceSimServer.users.selectFirst(data);
        if (user) {
            const scene = SpaceSimServer.rooms().find(r => r.ROOM_NAME === user.room);
            if (scene) {
                const ship = scene.getShip(user.shipId);
                if (ship) {
                    scene.queueShipRemoval(ship.id);
                }
            } else {
                Helpers.log('warn', `no scene could be found matching room '${user.room}' so player death not registered`);
            }
        } else {
            Helpers.log('warn', `no user could be found using socket '${socketId}' so player death not registered`);
        }
    }

    private _handleSetPlayerAngleEvent(socketId: string, degrees: number, data: SpaceSimUserData): void {
        const ship = this._getShipFromUserData(data);
        if (ship) {
            const d: number = Phaser.Math.Angle.WrapDegrees(+degrees.toFixed(0));
            ship.rotationContainer.setAngle(d);
        } else {
            this.sendShipDestroyedEventToSocket(socketId);
        }
    }

    private _getShipFromUserData(data: SpaceSimUserData): Ship {
        let ship: Ship;
        const user = SpaceSimServer.users.selectFirst(data);
        if (user) {
            const scene = SpaceSimServer.rooms().find(r => r.ROOM_NAME === user.room);
            if (scene) {
                ship = scene.getShip(user.shipId);
            } else {
                Helpers.log('warn', `no scene containing user could be found from data:`, data);
            }
        } else {
            Helpers.log('warn', `no user could be found from data:`, data);
        }
        return ship;
    }
}