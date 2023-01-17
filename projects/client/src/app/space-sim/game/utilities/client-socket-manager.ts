import { io, Socket } from "socket.io-client";
import { DisconnectDescription } from "socket.io-client/build/esm/socket";
import { BaseScene, Constants, GameLevelOptions, GameScoreTracker, GameStats, Helpers, ShipOptions, ShipSupplyOptions, SpaceSim, SpaceSimUserData } from "space-sim-shared";
import { MultiplayerSceneConfig } from "../scenes/multiplayer-scene";
import { SetNameSceneConfig } from "../scenes/set-name-scene";
import { SpaceSimClient } from "../space-sim-client";

export type ClientSocketManagerOptions = {
    serverUrl: string;
}

export class ClientSocketManager {
    public readonly socket: Socket;
    public readonly url: string;

    private _connects: number = 0;
    private _disconnects: number = 0;

    constructor(options: ClientSocketManagerOptions) {
        this.url = options.serverUrl;
        this.socket = io(this.url);
        this.socket.onAny((event: string, ...args: any[]) => {
            this._handleAllEvents(event, ...args);
        });
    }

    get connected(): boolean {
        return this.socket?.connected ?? false;
    }

    get disconnected(): boolean {
        return !this.connected;
    }

    isReconnect(): boolean {
        return this._connects > 1 && this._disconnects > 0;
    }

    private _emit(event: string, ...args: Array<any>): this {
        if (SpaceSimClient.mode === 'multiplayer') {
            if (SpaceSim.debug) {
                console.debug(`${Date.now()}: sending '${event}' event to server...`);
            }
            this.socket.emit(event, ...args);
        }
        return this;
    }

    sendSetPlayerDataRequest(data: SpaceSimUserData): this {
        this._emit(Constants.Socket.SET_PLAYER_DATA, data);
        return this;
    }

    sendRequestMapRequest(data: SpaceSimUserData): this {
        this._emit(Constants.Socket.REQUEST_MAP, data);
        return this;
    }

    sendJoinRoomRequest(data: SpaceSimUserData): this {
        this._emit(Constants.Socket.JOIN_ROOM, data);
        return this;
    }

    sendPlayerDeathNotice(data: SpaceSimUserData): this {
        this._emit(Constants.Socket.PLAYER_DEATH, data);
        return this;
    }

    sendRequestShipRequest(data: SpaceSimUserData): this {
        this._emit(Constants.Socket.REQUEST_SHIP, data);
        return this;
    }

    sendSetShipAngleRequest(degrees: number, data: SpaceSimUserData): this {
        this._emit(Constants.Socket.SET_PLAYER_ANGLE, degrees, data);
        return this;
    }

    sendTriggerEngineRequest(data: SpaceSimUserData): this {
        this._emit(Constants.Socket.TRIGGER_ENGINE, data);
        return this;
    }

    sendTriggerWeaponRequest(data: SpaceSimUserData): this {
        this._emit(Constants.Socket.TRIGGER_WEAPON, data);
        return this;
    }

    private _handleAllEvents(event: string, ...args: Array<any>): void {
        if (SpaceSimClient.mode === 'multiplayer') {
            if (SpaceSim.debug) {
                console.debug(`${Date.now()}: received '${event}' event from server...`);
            }
            Helpers.trycatch(() => {
                switch(event) {
                    case 'connect':
                        this._handleConnectEvent();
                        break;
                    case 'disconnect':
                        this._handleDisconnectEvent(args[0], args[1]);
                        break;
                    case Constants.Socket.INVALID_USER_DATA:
                        this._handleInvalidUserDataEvent();
                        break;
                    case Constants.Socket.USER_ACCEPTED:
                        this._handleUserAcceptedEvent(args[0]);
                        break;
                    case Constants.Socket.JOIN_ROOM: 
                        this._handleJoinRoomEvent();
                        break;
                    case Constants.Socket.UPDATE_SUPPLIES:
                        this._handleUpdateSuppliesEvent(args[0]);
                        break;
                    case Constants.Socket.REMOVE_SUPPLIES:
                        this._handleRemoveSuppliesEvent(...args);
                        break;
                    case Constants.Socket.FLICKER_SUPPLIES:
                        this._handleFlickerSuppliesEvent(...args);
                        break;
                    case Constants.Socket.UPDATE_PLAYERS:
                        this._handleUpdatePlayersEvent(args[0]);
                        break;
                    case Constants.Socket.PLAYER_DEATH:
                        this._handlePlayerDeathEvent(args[0]);
                        break;
                    case Constants.Socket.UPDATE_STATS:
                        this._handleUpdateStatsEvent(args[0]);
                        break;
                    case Constants.Socket.UPDATE_MAP:
                        this._handleUpdateMapEvent(args[0]);
                        break;
                    case Constants.Socket.SET_PLAYER_ID:
                        this._handleSetPlayerIdEvent(args[0]);
                        break;
                    case Constants.Socket.TRIGGER_ENGINE:
                        this._handleTriggerEngineEvent(args[0]);
                        break;
                    case Constants.Socket.TRIGGER_WEAPON:
                        this._handleTriggerWeaponEvent(args[0]);
                        break;
                    default:
                        console.warn(`${Date.now()}: unknown socket event received from server: event '${event}', args ${JSON.stringify(args)}`);
                        break;
                }
            }, 'warn', `${Date.now()}: error handling event '${event}' with arguments: ${JSON.stringify(args)}`, 'none');
        }
    }

    private _handleConnectEvent(): void {
        this._connects++;
        if (SpaceSim.debug) {
            console.debug(`${Date.now()}: connected to server at: ${this.url}`);
        }
        if (this.isReconnect() && SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            // handle reconnect scenario
            this.sendSetPlayerDataRequest(SpaceSimClient.playerData);
        }
    }

    private _handleDisconnectEvent(reason: Socket.DisconnectReason, description: DisconnectDescription): void {
        this._disconnects++;
        console.warn(`socket disconnected`, reason, description);
        if (reason === "io server disconnect") {
            // the disconnection was initiated by the server, you need to reconnect manually
            console.info(`attempting to reconnect to server...`);
            this.socket.connect();
        }
    }

    private _handleInvalidUserDataEvent(): void {
        SpaceSimClient.playerData = null;
        if (SpaceSim.game.scene.isActive(SetNameSceneConfig.key)) {
            window.alert(`user data either already in use or is invalid; please pick a different value.`);
        }
    }

    private _handleUserAcceptedEvent(data: SpaceSimUserData): void {
        SpaceSimClient.playerData = data;
        if (SpaceSim.game.scene.isActive(SetNameSceneConfig.key)) {
            this.sendJoinRoomRequest(data);
        }
    }

    private _handleJoinRoomEvent(): void {
        if (SpaceSim.game.scene.isActive(SetNameSceneConfig.key)) {
            SpaceSim.game.scene.stop(SetNameSceneConfig.key);
        }
        if (!SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            SpaceSim.game.scene.start(MultiplayerSceneConfig.key);
        }
    }

    private _handleUpdateSuppliesEvent(opts: Array<ShipSupplyOptions>): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            if (scene) {
                scene.queueSupplyUpdates(opts);
            }
        }
    }

    private _handleRemoveSuppliesEvent(...ids: Array<string>): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            if (scene) {
                scene.queueSupplyRemoval(...ids);
            }
        }
    }

    private _handleFlickerSuppliesEvent(...ids: Array<string>): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            if (scene) {
                scene.queueSupplyFlicker(...ids);
            }
        }
    }

    private _handleUpdatePlayersEvent(opts: Array<ShipOptions>): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            if (scene) {
                scene.queueShipUpdates(opts);
            }
        }
    }

    private _handlePlayerDeathEvent(id?: string): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            if (!id) {
                if (SpaceSimClient.playerShipId) {
                    id = SpaceSimClient.playerShipId;
                } else {
                    if (scene) {
                        scene.queueEndScene();
                        return;
                    }
                }
            }
            if (scene) {
                scene.queueShipRemoval(id);
            }
        }
    }

    private _handleUpdateStatsEvent(stats: Array<GameStats>): void {
        if (SpaceSimClient.mode === 'multiplayer') {
            GameScoreTracker.updateAllStats(...stats);
        }
    }

    private _handleUpdateMapEvent(opts: GameLevelOptions): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            if (scene) {
                scene.queueGameLevelUpdate(opts);
            }
        }
    }

    private _handleSetPlayerIdEvent(id: string): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            SpaceSimClient.playerShipId = id;
        }
    }

    private _handleTriggerEngineEvent(id: string): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            const ship = scene?.getShip(id);
            if (ship) {
                ship.getThruster().trigger();
            }
        }
    }

    private _handleTriggerWeaponEvent(id: string): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            const ship = scene?.getShip(id);
            if (ship) {
                ship.getWeapons().trigger();
            }
        }
    }
}