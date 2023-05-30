import { io, Socket } from "socket.io-client";
import { DisconnectDescription } from "socket.io-client/build/esm/socket";
import { BaseScene, GameLevelConfig, GameScoreTracker, Logging, ShipState, ShipSupplyOptions, SpaceSim, TryCatch } from "space-sim-shared";
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
    private _lastEventTimestamp: number = 0;

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
            Logging.log('debug', `sending '${event}' event to server...`);
            this.socket.emit(event, ...args);
        }
        return this;
    }

    sendSetPlayerDataRequest(data: SpaceSim.UserData): this {
        this._emit(SpaceSim.Constants.Socket.SET_PLAYER_DATA, data);
        return this;
    }

    sendRequestMapRequest(): this {
        this._emit(SpaceSim.Constants.Socket.REQUEST_MAP, SpaceSimClient.playerData);
        return this;
    }

    sendJoinRoomRequest(): this {
        this._emit(SpaceSim.Constants.Socket.JOIN_ROOM, SpaceSimClient.playerData);
        return this;
    }

    sendPlayerDeathNotice(): this {
        this._emit(SpaceSim.Constants.Socket.SHIP_DESTROYED, SpaceSimClient.playerData);
        return this;
    }

    sendRequestShipRequest(): this {
        this._emit(SpaceSim.Constants.Socket.REQUEST_SHIP, SpaceSimClient.playerData);
        return this;
    }

    sendSetShipAngleRequest(degrees: number): this {
        this._emit(SpaceSim.Constants.Socket.SET_PLAYER_ANGLE, SpaceSimClient.playerData, degrees);
        return this;
    }

    sendEngineOnRequest(enabled: boolean): this {
        this._emit(SpaceSim.Constants.Socket.ENGINE_ON, SpaceSimClient.playerData, enabled);
        return this;
    }

    sendWeaponFiringRequest(firing: boolean): this {
        this._emit(SpaceSim.Constants.Socket.WEAPON_FIRING, SpaceSimClient.playerData, firing);
        return this;
    }

    private _handleAllEvents(event: string, ...args: Array<any>): void {
        if (SpaceSimClient.mode === 'multiplayer') {
            if (this._shouldProcess(...args)) {
                if (![SpaceSim.Constants.Socket.UPDATE_PLAYERS, SpaceSim.Constants.Socket.UPDATE_STATS, SpaceSim.Constants.Socket.UPDATE_SUPPLIES].includes(event)) {
                    Logging.log('debug', `received '${event}' event from server...`);
                }
                TryCatch.run(() => {
                    switch(event) {
                        case 'connect':
                            this._handleConnectEvent();
                            break;
                        case 'disconnect':
                            this._handleDisconnectEvent(args[0], args[1]);
                            break;
                        case SpaceSim.Constants.Socket.INVALID_USER_DATA:
                            this._handleInvalidUserDataEvent(args[0].data[0]);
                            break;
                        case SpaceSim.Constants.Socket.USER_ACCEPTED:
                            this._handleUserAcceptedEvent(args[0].data[0]);
                            break;
                        case SpaceSim.Constants.Socket.JOIN_ROOM: 
                            this._handleJoinRoomEvent();
                            break;
                        case SpaceSim.Constants.Socket.UPDATE_SUPPLIES:
                            this._handleUpdateSuppliesEvent(args[0].data[0]);
                            break;
                        case SpaceSim.Constants.Socket.REMOVE_SUPPLIES:
                            this._handleRemoveSuppliesEvent(...args[0].data);
                            break;
                        case SpaceSim.Constants.Socket.FLICKER_SUPPLIES:
                            this._handleFlickerSuppliesEvent(...args[0].data);
                            break;
                        case SpaceSim.Constants.Socket.UPDATE_PLAYERS:
                            this._handleUpdatePlayersEvent(args[0].data[0]);
                            break;
                        case SpaceSim.Constants.Socket.SHIP_DESTROYED:
                            this._handlePlayerDeathEvent(args[0].data[0]);
                            break;
                        case SpaceSim.Constants.Socket.UPDATE_STATS:
                            this._handleUpdateStatsEvent(args[0].data[0]);
                            break;
                        case SpaceSim.Constants.Socket.UPDATE_MAP:
                            this._handleUpdateMapEvent(args[0].data[0]);
                            break;
                        case SpaceSim.Constants.Socket.SET_PLAYER_ID:
                            this._handleSetPlayerIdEvent(args[0].data[0]);
                            break;
                        case SpaceSim.Constants.Socket.ENGINE_ON:
                            this._handleEngineOnEvent(args[0].data[0], args[0].data[1]);
                            break;
                        case SpaceSim.Constants.Socket.WEAPON_FIRING:
                            this._handleEnableWeaponEvent(args[0].data[0], args[0].data[1]);
                            break;
                        case SpaceSim.Constants.Socket.INVALID_REQUEST:
                            this._handleInvalidRequestEvent(args[0].data[0]);
                            break;
                        default:
                            Logging.log('warn', `unknown socket event received from server: event '${event}', args ${JSON.stringify(args)}`);
                            break;
                    }
                }, 'warn', `[${Logging.dts()}]: error handling event '${event}' with arguments: ${JSON.stringify(args)}`, 'none');
            } else {
                Logging.log('debug', 'ignoring event from', args[0].sent, 'because it was older than', this._lastEventTimestamp);
            }
        }
    }

    /**
     * determines if an event should be ignored because it was received out of order 
     * and a newer event has already been processed
     * @param eventData the `args` array sent with any event
     * @returns `true` if the event either has a timestamp greater than the 
     * last processed event or no timestamp at all, otherwise `false`
     */
    private _shouldProcess(...eventData: Array<any>): boolean {
        if (eventData?.length && eventData[0]) {
            if (eventData[0]?.['sent'] != null && typeof eventData[0]['sent'] === 'number') {
                if (eventData[0].sent < this._lastEventTimestamp) {
                    return false;
                }
                this._lastEventTimestamp = eventData[0].sent;
            }
        }
        return true;
    }

    private _handleConnectEvent(): void {
        this._connects++;
        Logging.log('debug', `connected to server at: ${this.url}`);
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
            Logging.log('info', `attempting to reconnect to server...`);
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

    private _handleInvalidRequestEvent(message: string): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            if (scene) {
                scene.queueEndScene();
            }
        } else {
            window.alert(message);
            SpaceSim.game.scene.getScenes(true).forEach(s => SpaceSim.game.scene.stop(s));
            SpaceSim.game.scene.start(SetNameSceneConfig.key);
        }
    }

    private _handleUserAcceptedEvent(data: SpaceSim.UserData): void {
        SpaceSimClient.playerData = data;
        if (SpaceSim.game.scene.isActive(SetNameSceneConfig.key)) {
            this.sendJoinRoomRequest();
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
                scene.queueSupplyUpdates(...opts);
                const updatedIds = Array.from(new Set(opts.map(o => o.id)));
                const zombieIds = scene.getSupplies().map(s => s.id).filter(id => !updatedIds.includes(id));
                scene.queueSupplyRemoval(...zombieIds);
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

    private _handleUpdatePlayersEvent(opts: Array<ShipState>): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            if (scene) {
                scene.queueShipUpdates?.(...opts);
                const updatedIds = Array.from(new Set(opts?.map(o => o.id)));
                const zombieIds = scene.getShips?.().map(s => s.id).filter(id => !updatedIds.includes(id));
                scene.queueShipRemoval?.(...zombieIds);
            }
        }
    }

    private _handlePlayerDeathEvent(id?: string): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            if (scene) {
                if (!id) {
                    id = SpaceSimClient.playerShipId;
                }
                scene.queueShipRemoval(id);
            }
        }
    }

    private _handleUpdateStatsEvent(stats: Array<GameScoreTracker.GameStats>): void {
        if (SpaceSimClient.mode === 'multiplayer') {
            SpaceSim.stats.updateAllStats(...stats);
        }
    }

    private _handleUpdateMapEvent(config: GameLevelConfig): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            if (scene) {
                scene.queueGameLevelUpdate?.(config);
            }
        }
    }

    private _handleSetPlayerIdEvent(id: string): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            SpaceSimClient.playerShipId = id;
        }
    }

    private _handleEngineOnEvent(id: string, enabled: boolean): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            scene?.getShip?.(id)?.engine?.setEnabled(enabled);
        }
    }

    private _handleEnableWeaponEvent(id: string, firing: boolean): void {
        if (SpaceSim.game.scene.isActive(MultiplayerSceneConfig.key)) {
            const scene: BaseScene = SpaceSim.game.scene.getScene(MultiplayerSceneConfig.key) as BaseScene;
            scene?.getShip?.(id)?.weapon?.setEnabled(firing);
        }
    }
}