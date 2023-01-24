import { io, Socket } from "socket.io-client";
import { DisconnectDescription } from "socket.io-client/build/esm/socket";
import { BaseScene, Constants, GameLevelOptions, GameScoreTracker, GameStats, Helpers, ShipConfig, ShipOptions, ShipSupplyOptions, SpaceSim, SpaceSimUserData } from "space-sim-shared";
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
            Helpers.log('debug', `sending '${event}' event to server...`);
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
        this._emit(Constants.Socket.SHIP_DESTROYED, data);
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

    sendEnableEngineRequest(data: SpaceSimUserData): this {
        this._emit(Constants.Socket.ENGINE_ENABLED, data);
        return this;
    }

    sendDisableEngineRequest(data: SpaceSimUserData): this {
        this._emit(Constants.Socket.ENGINE_DISABLED, data);
        return this;
    }

    sendEnableWeaponRequest(data: SpaceSimUserData): this {
        this._emit(Constants.Socket.WEAPON_ENABLED, data);
        return this;
    }

    sendDisableWeaponRequest(data: SpaceSimUserData): this {
        this._emit(Constants.Socket.WEAPON_DISABLED, data);
        return this;
    }

    private _handleAllEvents(event: string, ...args: Array<any>): void {
        if (SpaceSimClient.mode === 'multiplayer') {
            if (![Constants.Socket.UPDATE_PLAYERS, Constants.Socket.UPDATE_STATS, Constants.Socket.UPDATE_SUPPLIES].includes(event)) {
                Helpers.log('debug', `received '${event}' event from server...`);
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
                        this._handleInvalidUserDataEvent(args[0]);
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
                    case Constants.Socket.SHIP_DESTROYED:
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
                    case Constants.Socket.ENGINE_ENABLED:
                        this._handleEnableEngineEvent(args[0]);
                        break;
                    case Constants.Socket.ENGINE_DISABLED:
                        this._handleDisableEngineEvent(args[0]);
                        break;
                    case Constants.Socket.WEAPON_ENABLED:
                        this._handleEnableWeaponEvent(args[0]);
                        break;
                    case Constants.Socket.WEAPON_DISABLED:
                        this._handleDisableWeaponEvent(args[0]);
                        break;
                    default:
                        Helpers.log('warn', `unknown socket event received from server: event '${event}', args ${JSON.stringify(args)}`);
                        break;
                }
            }, 'warn', `[${Helpers.dts()}]: error handling event '${event}' with arguments: ${JSON.stringify(args)}`, 'none');
        }
    }

    private _handleConnectEvent(): void {
        this._connects++;
        Helpers.log('debug', `connected to server at: ${this.url}`);
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
            Helpers.log('info', `attempting to reconnect to server...`);
            this.socket.connect();
        }
    }

    private _handleInvalidUserDataEvent(message: string): void {
        SpaceSimClient.playerData = null;
        if (!SpaceSim.game.scene.isActive(SetNameSceneConfig.key)) {
            SpaceSim.game.scene.getScenes(true).forEach(s => SpaceSim.game.scene.stop(s));
            SpaceSim.game.scene.start(SetNameSceneConfig.key);
        }
        window.alert(message ?? `user data either already in use or is invalid; please pick a different value.`);
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

    private _handleUpdatePlayersEvent(opts: Array<ShipConfig>): void {
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

    private _handleEnableEngineEvent(id: string): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            const ship = scene?.getShip(id);
            if (ship) {
                ship.engine.setEnabled(true);
            }
        }
    }

    private _handleDisableEngineEvent(id: string): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            const ship = scene?.getShip(id);
            if (ship) {
                ship.engine.setEnabled(false);
            }
        }
    }

    private _handleEnableWeaponEvent(id: string): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            const ship = scene?.getShip(id);
            if (ship) {
                ship.weapon.setEnabled(true);
            }
        }
    }

    private _handleDisableWeaponEvent(id: string): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            const ship = scene?.getShip(id);
            if (ship) {
                ship.weapon.setEnabled(false);
            }
        }
    }
}