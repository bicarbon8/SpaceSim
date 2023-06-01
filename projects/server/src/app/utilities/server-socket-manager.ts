import { Server, Socket } from "socket.io";
import { DisconnectReason } from "socket.io/dist/socket";
import { GameLevelConfig, GameScoreTracker, Logging, Ship, ShipState, ShipSupplyOptions, SpaceSim, TryCatch } from "space-sim-shared";
import { BattleRoyaleScene } from "../scenes/battle-royale-scene";
import { SpaceSimServer } from "../space-sim-server";

export type ServerSocketManagerOptions = {
    io: Server;
};

export class ServerSocketManager {
    public readonly io: Server;

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

    sendUserAcceptedResponse(socketId: string, data: SpaceSim.UserData): this {
        return this.socketEmit(socketId, SpaceSim.Constants.Socket.USER_ACCEPTED, data);
    }

    sendInvalidUserDataResponse(socketId: string, message: string): this {
        return this.socketEmit(socketId, SpaceSim.Constants.Socket.INVALID_USER_DATA, message);
    }

    sendInvalidRequestEvent(socketId: string, message: string): this {
        return this.socketEmit(socketId, SpaceSim.Constants.Socket.INVALID_REQUEST, message);
    }

    sendUpdateStatsToRoom(room, stats: Array<Partial<GameScoreTracker.GameStats>>): this {
        return this.roomEmit(room, SpaceSim.Constants.Socket.UPDATE_STATS, stats);
    }

    sendJoinRoomResponse(socketId: string): this {
        return this.socketEmit(socketId, SpaceSim.Constants.Socket.JOIN_ROOM);
    }

    sendSetShipIdResponse(socketId: string, shipId: string): this {
        return this.socketEmit(socketId, SpaceSim.Constants.Socket.SET_PLAYER_ID, shipId);
    }

    /**
     * used to tell all sockets in a room the state of a ship's engines
     * @param room the room to emit within
     * @param shipId the id of the ship
     * @param enabled a boolean indicating if the engines are on or off
     * @returns this
     */
    sendEngineOnEventToRoom(room: string, shipId: string, enabled: boolean): this {
        return this.roomEmit(room, SpaceSim.Constants.Socket.ENGINE_ON, shipId, enabled);
    }

    /**
     * used to tell all sockets in a room the state of a ship's weapon
     * @param room the room to emit within
     * @param shipId the id of the ship
     * @param firing a boolean indicating if the weapon is firing
     * @returns this
     */
    sendWeaponFiringEventToRoom(room: string, shipId: string, firing: boolean): this {
        return this.roomEmit(room, SpaceSim.Constants.Socket.WEAPON_FIRING, shipId, firing);
    }

    sendShipDestroyedEventToRoom(room: string, shipId: string): this {
        return this.roomEmit(room, SpaceSim.Constants.Socket.SHIP_DESTROYED, shipId);
    }

    sendUpdateGameLevelToRoom(room: string, config: GameLevelConfig): this {
        return this.roomEmit(room, SpaceSim.Constants.Socket.UPDATE_MAP, config);
    }

    /**
     * sent when a socket attempts to reconnect and their ship no longer
     * exists to let them know they should go to game over
     */
    sendShipDestroyedEventToSocket(socketId: string): this {
        return this.socketEmit(socketId, SpaceSim.Constants.Socket.SHIP_DESTROYED);
    }

    sendUpdatePlayersEvent(room: string, shipsState: Array<ShipState>): this {
        return this.roomEmit(room, SpaceSim.Constants.Socket.UPDATE_PLAYERS, shipsState);
    }

    sendUpdateSuppliesEvent(room: string, suppliesState: Array<ShipSupplyOptions>): this {
        return this.roomEmit(room, SpaceSim.Constants.Socket.UPDATE_SUPPLIES, suppliesState);
    }

    sendFlickerSuppliesEvent(room: string, ...ids: Array<string>): this {
        return this.roomEmit(room, SpaceSim.Constants.Socket.FLICKER_SUPPLIES, ...ids);
    }

    sendRemoveSuppliesEvent(room: string, ...ids: Array<string>): this {
        return this.roomEmit(room, SpaceSim.Constants.Socket.REMOVE_SUPPLIES, ...ids);
    }

    private socketEmit(socketId: string, event: string, ...args: Array<any>): this {
        TryCatch.run(() => {
            const socket = this.getSocket(socketId);
            if (socket) {
                Logging.log('debug', `sending '${event}' event with args ${JSON.stringify(args)} to client '${socketId}'...`);
                socket.emit(event, {
                    sent: Date.now(),
                    data: args
                });
            }
        }, 'warn', `[${Logging.dts()}]: error sending event '${event}' to socket '${socketId}' with args: ${JSON.stringify(args)}`, 'all');
        return this;
    }

    private roomEmit(room: string, event: string, ...args: Array<any>): this {
        TryCatch.run(() => {
            Logging.log('debug', `sending '${event}' event with args ${JSON.stringify(args)} to room '${room}'...`);
            this.io.in(room).emit(event, {
                sent: Date.now(),
                data: args
            });
        }, 'warn', `[${Logging.dts()}]: error sending event '${event}' to room '${room}' with args: ${JSON.stringify(args)}`, 'all');
        return this;
    }

    private _setupIo(): void {
        TryCatch.run(() => {
            this.io.on('connection', (socket: Socket) => {
                this._connections++;
                Logging.log('info', `new socket connection (#${this._connections}): '${socket.id}' from '${socket.request.connection.remoteAddress}'`);
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
        TryCatch.run(() => {
            switch(event) {
                case 'disconnect':
                    Logging.log('debug', `disconnect event received in 'onAny' handler`);
                    break;
                case SpaceSim.Constants.Socket.SET_PLAYER_DATA:
                    Logging.log('info', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleSetPlayerDataEvent(socketId, args[0]);
                    break;
                case SpaceSim.Constants.Socket.JOIN_ROOM:
                    Logging.log('info', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleJoinRoomEvent(socketId, args[0]);
                    break;
                case SpaceSim.Constants.Socket.REQUEST_MAP:
                    Logging.log('info', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleRequestMapResponse(socketId, args[0]);
                    break;
                case SpaceSim.Constants.Socket.REQUEST_SHIP:
                    Logging.log('info', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleRequestShipResponse(socketId, args[0]);
                    break;
                case SpaceSim.Constants.Socket.ENGINE_ON:
                    Logging.log('debug', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleEngineOnResponse(socketId, args[0], args[1]);
                    break;
                case SpaceSim.Constants.Socket.WEAPON_FIRING:
                    Logging.log('debug', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleWeaponFiringResponse(socketId, args[0], args[1]);
                    break;
                case SpaceSim.Constants.Socket.SHIP_DESTROYED:
                    Logging.log('info', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleShipDestroyedEvent(socketId, args[0]);
                    break;
                case SpaceSim.Constants.Socket.SET_PLAYER_ANGLE:
                    Logging.log('trace', `received '${event}' event from socket '${socketId}' with data:`, args);
                    this._handleSetPlayerAngleEvent(socketId, args[0], args[1]);
                    break;
                default:
                    Logging.log('warn', `unknown socket event received from socket '${socketId}': event '${event}' with data:`, args);
                    break;
            }
        }, 'warn', `error handling event '${event}' from socket '${socketId}' with data: ${JSON.stringify(args)}`, 'all');
    }

    private _handleDisconnectEvent(socketId: string, reason: DisconnectReason): void {
        this._disconnects++;
        Logging.log('info', `socket: ${socketId} disconnected (#${this._disconnects}) due to:`, reason);
        const user = SpaceSimServer.users.select({socketId: socketId}).first;
        if (user?.room) {
            user.deleteAt = Date.now() + SpaceSim.Constants.Timing.DISCONNECT_TIMEOUT_MS;
            Logging.log('info', `setting user.deleteAt for user:`, user, 'where now is:', Date.now());
            SpaceSimServer.users.update(user);
        }
    }

    private _handleSetPlayerDataEvent(socketId: string, data: SpaceSim.UserData): void {
        if (SpaceSim.UserData.isValid(data)) {
            if (this._tryReconnectUser(socketId, data) || this._tryAddNewUser(socketId, data)) {
                this.sendUserAcceptedResponse(socketId, data);
                return;
            }
        }

        this.sendInvalidUserDataResponse(socketId, 'unable to reconnect or add new user using supplied data; please choose a different name and try again.');
    }

    private _tryReconnectUser(socketId: string, data: SpaceSim.UserData): boolean {
        const previousConnection = SpaceSimServer.users.select(data).first;
        if (previousConnection) {
            Logging.log('info', `known users list updated with user '${JSON.stringify(data)}' who is reconnecting over socket '${socketId}'`);
            // user is reconnecting...
            const updated: SpaceSimServer.UserData = {
                ...previousConnection,
                socketId: socketId,
                deleteAt: null
            };
            SpaceSimServer.users.update(updated);
            if (updated.room) {
                const scene = SpaceSim.game.scene.getScene(updated.room) as BattleRoyaleScene;
                scene.addPlayerToScene(updated);
            }
            return true;
        } else {
            return false;
        }
    }

    private _tryAddNewUser(socketId: string, data: SpaceSim.UserData): boolean {
        if (!SpaceSimServer.users.add({
            ...data,
            socketId: socketId
        })) {
            Logging.log('debug', `name already in use so user cannot be added:`, data);
            return false;
        } else {
            Logging.log('info', `user '${JSON.stringify(data)}' added to known users over socket '${socketId}'`);
            return true;
        }
    }

    private _handleJoinRoomEvent(socketId: string, data: SpaceSim.UserData): void {
        let added: boolean = false;
        const user = SpaceSimServer.users.select(data).first;
        if (user) {
            Logging.log('debug', `attempting to add user ${JSON.stringify(user)} to a room...`);
            // iterate over rooms and see if any have less than max allowed players
            for (let scene of SpaceSimServer.rooms()) {
                if (scene.getShips().length < SpaceSim.Constants.Socket.MAX_USERS_PER_ROOM) {
                    scene.addPlayerToScene(user);
                    added = true;
                }
            }

            if (!added) {
                // create new scene + room and add
                const scene = new BattleRoyaleScene();
                Logging.log('info', `starting new scene '${scene.ROOM_NAME}'`)
                SpaceSim.game.scene.add(scene.ROOM_NAME, scene, true);
                scene.events.on(Phaser.Core.Events.READY, () => scene.addPlayerToScene(user));
            }
        } else {
            console.error(`unable to join room due to: no existing user found for socket '${socketId}' with data '${JSON.stringify(data)}'`);
            this.sendInvalidRequestEvent(socketId, 'no existing user found on server matching request to join room; please resubmit user data and try again');
        }
    }

    private _handleRequestMapResponse(socketId: string, data: SpaceSim.UserData): void {
        const user = SpaceSimServer.users.select(data).first;
        if (user) {
            const scene = SpaceSimServer.rooms().find(r => r.ROOM_NAME === user.room);
            if (scene) {
                // TODO: add `GameLevel.config` method and use that data instead
                this.socketEmit(socketId, SpaceSim.Constants.Socket.UPDATE_MAP, SpaceSimServer.Constants.Map.MAP_OPTIONS);
            } else {
                Logging.log('warn', `no scene could be found matching room '${user.room}' so map data will not be sent`);
                this.sendInvalidRequestEvent(socketId, 'supplied user is not in a room so is not allowed to request a GameLevel');
            }
        } else {
            Logging.log('warn', `no user could be found using socket '${socketId}' so map data will not be sent`);
            this.sendInvalidRequestEvent(socketId, 'supplied user could not be found; please resend user data and try again');
        }
    }

    private _handleRequestShipResponse(socketId: string, data: SpaceSim.UserData): void {
        const user = SpaceSimServer.users.select(data).first;
        if (user) {
            const scene = SpaceSimServer.rooms().find(r => r.ROOM_NAME === user.room);
            if (scene) {
                if (scene.getShips().length < SpaceSimServer.Constants.Rooms.MAX_BOTS) {
                    const battle = scene as BattleRoyaleScene;
                    const diff = SpaceSimServer.Constants.Rooms.MAX_BOTS - scene.getShips().length;
                    for (let i=0; i<diff; i++) {
                        battle.createBot();
                    }
                }
                const ship = scene.getShip(user.shipId) ?? scene.createShip(user);
                if (ship) {
                    Logging.log('debug', `sending ship id ${ship.id} to client ${socketId}`);
                    this.sendSetShipIdResponse(socketId, ship.id);
                } else {
                    Logging.log('warn', 'unable to get existing or create new ship for user', {user});
                    this.sendInvalidRequestEvent(socketId, 'some error occurred when getting existing or creating new ship; please try again');
                }
            } else {
                Logging.log('warn', `no scene could be found matching room '${user.room}' so new ship not created`);
                this.sendInvalidRequestEvent(socketId, 'supplied user is not in a room so is not allowed to request a Ship');
            }
        } else {
            Logging.log('warn', `no user could be found using socket '${socketId}' so new ship not created`);
            this.sendInvalidRequestEvent(socketId, 'supplied user could not be found; please resend user data and try again');
        }
    }

    private _handleEngineOnResponse(socketId: string, data: SpaceSim.UserData, enabled: boolean): void {
        const ship = this._getShipFromUserData(data);
        if (ship) {
            const room = SpaceSimServer.users.select(data).first.room;
            ship.engine.setEnabled(enabled);
            this.sendEngineOnEventToRoom(room, ship.id, enabled);
        } else {
            this.sendShipDestroyedEventToSocket(socketId);
        }
    }

    private _handleWeaponFiringResponse(socketId: string, data: SpaceSim.UserData, firing: boolean): void {
        const ship = this._getShipFromUserData(data);
        if (ship) {
            const room = SpaceSimServer.users.select(data).first.room;
            ship.weapon.setEnabled(firing);
            this.sendWeaponFiringEventToRoom(room, ship.id, firing);
        } else {
            this.sendShipDestroyedEventToSocket(socketId);
        }
    }

    private _handleShipDestroyedEvent(socketId: string, data: SpaceSim.UserData): void {
        const user = SpaceSimServer.users.select(data).first;
        if (user) {
            const scene = SpaceSimServer.rooms().find(r => r.ROOM_NAME === user.room);
            if (scene) {
                const ship = scene.getShip(user.shipId);
                if (ship) {
                    scene.events.emit(SpaceSim.Constants.Events.SHIP_DEATH, ship.currentState);
                }
            } else {
                Logging.log('warn', `no scene could be found matching room '${user.room}' so player death not registered`);
            }
        } else {
            Logging.log('warn', `no user could be found using socket '${socketId}' so player death not registered`);
        }
    }

    private _handleSetPlayerAngleEvent(socketId: string, data: SpaceSim.UserData, degrees: number): void {
        const ship = this._getShipFromUserData(data);
        if (ship) {
            const d: number = Phaser.Math.Angle.WrapDegrees(Number(degrees.toFixed(0)));
            ship.rotationContainer.setAngle(d);
        } else {
            this.sendShipDestroyedEventToSocket(socketId);
        }
    }

    private _getShipFromUserData(data: SpaceSim.UserData): Ship {
        let ship: Ship;
        const user = SpaceSimServer.users.select(data).first;
        if (user) {
            const scene = SpaceSimServer.rooms().find(r => r.ROOM_NAME === user.room);
            if (scene) {
                ship = scene.getShip(user.shipId);
            } else {
                Logging.log('warn', `no scene containing user could be found from data:`, data);
            }
        } else {
            Logging.log('warn', `no user could be found from data:`, data);
        }
        return ship;
    }
}