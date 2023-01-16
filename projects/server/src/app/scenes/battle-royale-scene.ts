import * as Phaser from "phaser";
import { Socket } from "socket.io";
import { BaseScene, GameLevel, Ship, ShipOptions, ShipSupply, SpaceSimUserData, Constants, Exploder, GameScoreTracker, Helpers, ShipSupplyOptions, AmmoSupply, CoolantSupply, FuelSupply, RepairsSupply, GameLevelOptions } from "space-sim-shared";
import { SpaceSimServer } from "../space-sim-server";
import { SpaceSimServerUserData } from "../space-sim-server-user-data";

export class BattleRoyaleScene extends BaseScene {
    setLevel<T extends GameLevelOptions>(opts: T): BaseScene {
        throw new Error("Method not implemented.");
    }
    updateShips<T extends ShipOptions>(opts: T[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    removeShips(...ids: string[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    updateSupplies<T extends ShipSupplyOptions>(opts: T[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    removeSupplies(...ids: string[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    flickerSupplies(...ids: string[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    endScene(): BaseScene {
        throw new Error("Method not implemented.");
    }
    readonly ROOM_NAME: string;
    
    /**
     * mapping of `fingerprint-name` to ship.id since socket disconnect
     * results in new sockeet id on reconnect so it can't be used.
     */
    private readonly _dataToShipId = new Map<string, string>();
    private readonly _supplies = new Map<string, ShipSupply>();
    private readonly _ships = new Map<string, Ship>();
    private _gameLevel: GameLevel;

    private _disconnectTimers = new Map<string, number>();

    private _exploder: Exploder;

    private _medPriUpdateAt: number = Constants.Timing.MED_PRI_UPDATE_FREQ;
    private _lowPriUpdateAt: number = Constants.Timing.LOW_PRI_UPDATE_FREQ;
    private _ultraLowPriUpdateAt: number = Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ;

    constructor(options?: Phaser.Types.Scenes.SettingsConfig) {
        const room = options?.key ?? Phaser.Math.RND.uuid();
        super({
            ...options,
            key: room
        });
        this.ROOM_NAME = room;
    }

    get players(): Array<Socket> {
        return Array.from(SpaceSimServer.io.sockets.sockets.values())
            .filter(socket => Array.from(socket.rooms.values()).includes(this.ROOM_NAME));
    }

    override getShipsMap<T extends Ship>(): Map<string, T> {
        return this._ships as Map<string, T>;
    }

    override getShips<T extends Ship>(): Array<T> {
        return Array.from(this._ships.values()) as Array<T>;
    }

    override getSuppliesMap<T extends ShipSupply>(): Map<string, T> {
        return this._supplies as Map<string, T>;
    }

    override getSupplies<T extends ShipSupply>(): Array<T> {
        return Array.from(this._supplies.values()) as Array<T>;
    }

    override getLevel<T extends GameLevel>(): T {
        return this._gameLevel as T;
    }

    preload(): void {
        this.load.image('bullet', `assets/sprites/bullet.png`);

        this.load.image('metaltiles', `assets/tiles/metaltiles_lg.png`);
        this.load.image('minimaptile', `assets/tiles/minimap-tile.png`);
    }

    create(): void {
        this._exploder = new Exploder(this);
        this._createMap();
        this._setupSceneEventHandling();
    }

    update(time: number, delta: number): void {
        this._medPriUpdateAt += delta;
        this._lowPriUpdateAt += delta;
        this._ultraLowPriUpdateAt += delta;

        Helpers.trycatch(() => this.getShips().forEach(ship => ship?.update(time, delta)));
        
        // 30 fps
        if (this._medPriUpdateAt >= Constants.Timing.MED_PRI_UPDATE_FREQ) {
            this._medPriUpdateAt = 0;
            Helpers.trycatch(() => this._sendPlayersUpdate());
        }

        // 15 fps
        if (this._lowPriUpdateAt >= Constants.Timing.LOW_PRI_UPDATE_FREQ) {
            this._lowPriUpdateAt = 0;
            Helpers.trycatch(() => this._sendSuppliesUpdate());
        }

        // 1 fps
        if (this._ultraLowPriUpdateAt >= Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ) {
            this._ultraLowPriUpdateAt = 0;
            SpaceSimServer.io.to(this.ROOM_NAME).emit(Constants.Socket.UPDATE_STATS, GameScoreTracker.getAllStats());
            Helpers.trycatch(() => this._cleanup());
        }
    }

    addPlayer(player: SpaceSimServerUserData): void {
        const socket = SpaceSimServer.io.sockets.sockets.get(player.socketId);
        if (socket) {
            console.debug(`adding player ${JSON.stringify(player)} to scene ${this.ROOM_NAME}`);
            socket.join(this.ROOM_NAME);
            player.room = this.ROOM_NAME;
            socket.emit(Constants.Socket.JOIN_ROOM);

            socket.on(Constants.Socket.REQUEST_MAP, () => {
                Helpers.trycatch(() => {
                    console.debug(`received map request from: ${socket.id}`);
                    this._sendMap(socket);
                }, 'warn', `error in handling '${Constants.Socket.REQUEST_MAP}' event`, 'all');
            }).on(Constants.Socket.REQUEST_SHIP, (data: SpaceSimUserData) => {
                Helpers.trycatch(() => {
                    console.debug(`received new ship request from: ${socket.id} in room ${this.ROOM_NAME}`);
                    const ship = this._getShip(data, socket) ?? this._createShip(player);
                    console.debug(`associating socket ${socket.id} to ship ${ship.id}`);
                    this._dataToShipId.set(SpaceSimUserData.uniqueKey(data), ship.id);
                    console.debug(`sending ship id ${ship.id} to client ${socket.id}`);
                    socket.emit(Constants.Socket.SET_PLAYER_ID, ship.id);
                }, 'warn', `error in handling '${Constants.Socket.REQUEST_SHIP}' event`, 'all');
            }).on(Constants.Socket.TRIGGER_ENGINE, (data: SpaceSimUserData) => {
                Helpers.trycatch(() => {
                    const ship = this._getShip(data, socket);
                    if (ship) {
                        console.debug(`triggering engine for ${ship.id} at angle ${ship.angle}`);
                        socket.broadcast.in(this.ROOM_NAME).emit(Constants.Socket.TRIGGER_ENGINE, ship.id);
                        ship.getThruster().trigger();
                    } else {
                        socket.emit(Constants.Socket.PLAYER_DEATH);
                    }
                }, 'warn', `error in handling '${Constants.Socket.TRIGGER_ENGINE}' event`, 'all');
            }).on(Constants.Socket.TRIGGER_WEAPON, (data: SpaceSimUserData) => {
                Helpers.trycatch(() => {
                    const ship = this._getShip(data, socket);
                    if (ship) {
                        console.debug(`triggering weapon for ${ship.id} at angle ${ship.angle}`);
                        socket.broadcast.in(this.ROOM_NAME).emit(Constants.Socket.TRIGGER_WEAPON, ship.id);
                        ship.getWeapons().trigger();
                    } else {
                        socket.emit(Constants.Socket.PLAYER_DEATH);
                    }
                }, 'warn', `error in handling '${Constants.Socket.TRIGGER_WEAPON}' event`, 'all');
            }).on(Constants.Socket.SET_PLAYER_ANGLE, (degrees: number, data: SpaceSimUserData) => {
                Helpers.trycatch(() => {
                    // console.debug(`received set angle to '${degrees}' request from: ${socket.id}`);
                    const ship = this._getShip(data, socket);
                    if (ship) {
                        const d: number = Phaser.Math.Angle.WrapDegrees(+degrees.toFixed(0));
                        ship.setRotation(d);
                    } else {
                        socket.emit(Constants.Socket.PLAYER_DEATH);
                    }
                }, 'warn', `error in handling '${Constants.Socket.SET_PLAYER_ANGLE}' event`, 'all');
            }).on(Constants.Socket.PLAYER_DEATH, (data: SpaceSimUserData) => {
                Helpers.trycatch(() => {
                    console.debug(`received player death notice from: ${socket.id}`);
                    const ship = this._getShip(data, socket);
                    if (ship) {
                        this._removeShip(ship.config);
                    }
                }, 'warn', `error in handling '${Constants.Socket.PLAYER_DEATH}' event`, 'all');
            });
        }
    }

    removePlayer(player: SpaceSimServerUserData): void {
        console.debug(`removing player '${JSON.stringify(player)}' and associated ship...`);
        const id = this._dataToShipId.get(SpaceSimUserData.uniqueKey(player));
        const ship = this._ships.get(id);
        if (ship) {
            const config = ship.config;
            this._removeShip(config);
        }
    }

    private _setupSceneEventHandling(): void {
        // setup listener for player death event (sent from ship.destroy())
        this.events.on(Constants.Events.PLAYER_DEATH, (shipOpts: ShipOptions) => {
            this._removeShip(shipOpts);
        });
    }

    private _createMap(): void {
        console.debug(`creating GameLevel in room ${this.ROOM_NAME}`);
        const map = new GameLevel(this, SpaceSimServer.MAP_OPTIONS);
        this._gameLevel = map;
    }

    private _createShip(data: SpaceSimUserData): Ship {
        const room = this.getLevel().getRooms()[0];
        const topleft: Phaser.Math.Vector2 = this.getLevel().getMapTileWorldLocation(room.left+1, room.top+1);
        const botright: Phaser.Math.Vector2 = this.getLevel().getMapTileWorldLocation(room.right-1, room.bottom-1);
        let loc: Phaser.Math.Vector2;
        do {
            let x = Phaser.Math.RND.realInRange(topleft.x, botright.x);
            let y = Phaser.Math.RND.realInRange(topleft.y, botright.y);
            loc = Helpers.vector2(x, y);
        } while (this._isMapLocationOccupied(loc, 100));
        const ship = new Ship(this, {
            location: loc,
            fingerprint: data.fingerprint,
            name: data.name,
            weaponsKey: Phaser.Math.RND.between(1, 3),
            wingsKey: Phaser.Math.RND.between(1, 3),
            cockpitKey: Phaser.Math.RND.between(1, 3),
            engineKey: Phaser.Math.RND.between(1, 3)
        });
        this.physics.add.collider(ship.getGameObject(), this.getLevel().getGameObject());
        this._addPlayerCollisionPhysicsWithPlayers(ship);
        this._addPlayerCollisionPhysicsWithSupplies(ship);
        console.debug(`adding ship with fingerprint: ${data.fingerprint},`,
            `name: ${data.name.substring(0, 10)},`,
            `and id: ${ship.id} at x: ${ship.location.x}, y: ${ship.location.y}`);
        this._ships.set(ship.id, ship);
        GameScoreTracker.start(ship.config);
        
        return ship;
    }

    private _removeShip(opts: ShipOptions): void {
        console.debug(`attempting to remove ship '${JSON.stringify(opts)}'...`);
        if (this._ships.has(opts.id)) {
            // prevent further updates to ship
            const player = this._ships.get(opts.id);
            this._ships.delete(opts.id);
            let socketId: string;
            for (var [key, val] of this._dataToShipId) {
                if (val === opts.id) {
                    socketId = this._dataToShipId.get(key);
                    this._dataToShipId.delete(key);
                    break;
                }
            }
            
            console.debug(`sending player death notice to clients for ship ${opts.id}`);
            SpaceSimServer.io.to(this.ROOM_NAME).emit(Constants.Socket.PLAYER_DEATH, opts.id);
            
            this._expelSupplies(opts);

            console.debug(`calling ship.destroy(false) for ship: ${opts.id}, with name: ${opts.name}`);
            player?.destroy(false); // don't emit event locally
            const socket = SpaceSimServer.io.sockets.sockets.get(socketId);
            if (socket) {
                console.debug(`removing socket '${socket.id}' from room as part of removing ship '${opts.id}'`);
                socket.leave(this.ROOM_NAME);
            }
        } else {
            console.warn(`no ship with id '${opts.id}' was found.`);
        }
    }

    private _sendMap(socket: Socket): void {
        socket.emit(Constants.Socket.UPDATE_MAP, SpaceSimServer.MAP_OPTIONS);
    }

    private _sendPlayersUpdate(): void {
        SpaceSimServer.io.to(this.ROOM_NAME).emit(Constants.Socket.UPDATE_PLAYERS, this.getShips().map(p => p.config));
    }

    private _sendSuppliesUpdate(): void {
        SpaceSimServer.io.to(this.ROOM_NAME).emit(Constants.Socket.UPDATE_SUPPLIES, this.getSupplies().map(s => s.config));
    }

    private _isMapLocationOccupied(location: Phaser.Types.Math.Vector2Like, radius: number): boolean {
        const circleA = new Phaser.Geom.Circle(location.x, location.y, radius);

        // ensure within walls of room
        const tiles: Array<Phaser.Tilemaps.Tile> = this.getLevel().getLayer()
            .getTilesWithinShape(circleA)?.filter(t => t.collides);
        if (tiles?.length > 0) {
            console.debug(`location collides with map tiles: `, location);
            return true;
        }

        // ensure space not occupied by other player(s)
        const players = Array.from(this._ships.values());
        for (var i=0; i<players.length; i++) {
            const p = players[i];
            const loc = p.getLocation();
            const circleB = new Phaser.Geom.Circle(loc.x, loc.y, p.getGameObject().width / 2)
            const occupied = Phaser.Geom.Intersects.CircleToCircle(circleA, circleB);
            if (occupied) {
                console.debug(`location collides with existing player: `, location);
                return true;
            }
        }
        return false;
    }

    private _expelSupplies(shipCfg: ShipOptions): void {
        console.debug(`expelling supplies at:`, shipCfg.location);
        const supplyOpts = this._exploder.emitSupplies(shipCfg);
        const supplies = this._addSupplyCollisionPhysics(...supplyOpts);
        for (let supply of supplies) {
            this._supplies.set(supply.id, supply);
        }
        this._cleanupSupplies(...supplies);
        console.debug(`${supplyOpts.length} supplies expelled from ship ${shipCfg.id}`);
    }

    private _addSupplyCollisionPhysics(...options: Array<ShipSupplyOptions>): Array<ShipSupply> {
        const supplies = new Array<ShipSupply>();
        for (let opts of options) {
            switch(opts.supplyType) {
                case 'ammo':
                    supplies.push(new AmmoSupply(this, opts));
                    break;
                case 'coolant':
                    supplies.push(new CoolantSupply(this, opts));
                    break;
                case 'fuel':
                    supplies.push(new FuelSupply(this, opts));
                    break;
                case 'repairs':
                    supplies.push(new RepairsSupply(this, opts));
                    break;
                default:
                    console.warn(`unknown supplyType sent to _addSupplyCollisionPhysicsWithPlayers:`, opts.supplyType);
                    break;
            }
        }
        this.physics.add.collider(supplies, this.getLevel().getGameObject());
        this.physics.add.collider(supplies, this.getShips()
            .filter(p => p?.active)
            .map(o => o?.getGameObject()), 
            (obj1, obj2) => {
                let shipGameObj: Phaser.GameObjects.Container;
                let supplyGameObj: Phaser.GameObjects.Container;
                if (supplies.map(s => s as Phaser.GameObjects.GameObject).includes(obj1)) {
                    shipGameObj = obj2 as Phaser.GameObjects.Container;
                    supplyGameObj = obj1 as Phaser.GameObjects.Container;
                } else {
                    shipGameObj = obj1 as Phaser.GameObjects.Container;
                    supplyGameObj = obj2 as Phaser.GameObjects.Container;
                }
                const ship: Ship = this.getShips().find(p => {
                    const go = p.getGameObject();
                    if (go === shipGameObj) {
                        return true;
                    }
                    return false;
                });
                const supply: ShipSupply = this.getSupplies().find(p => {
                    const go = p as Phaser.GameObjects.GameObject;
                    if (go === supplyGameObj) {
                        return true;
                    }
                    return false;
                });
                SpaceSimServer.io.to(this.ROOM_NAME).emit(Constants.Socket.REMOVE_SUPPLIES, supply.id);
                this._supplies.delete(supply.id);
                supply.apply(ship);
                supply.destroy();
            }
        );
        return supplies;
    }

    private _addPlayerCollisionPhysicsWithSupplies(ship: Ship): void {
        this.physics.add.collider(ship.getGameObject(), this.getSupplies().filter(p => p?.active), 
            (obj1, obj2) => {
                let supply: ShipSupply;
                if (obj1 === ship.getGameObject()) {
                    supply = obj2 as ShipSupply;
                } else {
                    supply = obj1 as ShipSupply;
                }
                SpaceSimServer.io.to(this.ROOM_NAME).emit(Constants.Socket.REMOVE_SUPPLIES, supply.id);
                this._supplies.delete(supply.id);
                supply.apply(ship);
                supply.destroy();
            }
        );
    }

    private _addPlayerCollisionPhysicsWithPlayers(ship: Ship): void {
        this.physics.add.collider(ship.getGameObject(), this.getShips().map(p => p?.getGameObject()));
    }

    /**
     * removes a `ShipSupply` after 30 seconds
     * @param supply a `ShipSupply` to remove
     */
    private _cleanupSupplies(...supplies: Array<ShipSupply>): void {
        window.setTimeout(() => {
            SpaceSimServer.io.to(this.ROOM_NAME).emit(Constants.Socket.FLICKER_SUPPLIES, ...supplies.map(s => s.id));
            for (let supply of supplies) {
                window.setTimeout(() => {
                    this._supplies.delete(supply.id);
                    supply.destroy();
                    SpaceSimServer.io.to(this.ROOM_NAME).emit(Constants.Socket.REMOVE_SUPPLIES, ...supplies.map(s => s.id));
                }, 5000);
            }
        }, 25000);
    }

    /**
     * attempts to get client's ship based on the following rules:
     * 1. lookup `ship.id` based on `socket.id` map
     * 2. if none, lookup `ship.id` based on `data.fingerprint` and `data.name`
     * 3. if still none tell client they were destroyed; otherwise get `Ship` and return
     * @param socket a socket.io `Socket` used by the client
     * @param data a `SpaceSimPlayerData` object sent from the client
     * @returns a valid `Ship` or `undefined` if no ship found for client details
     */
    private _getShip(data: SpaceSimUserData, socket: Socket): Ship {
        const id = this._dataToShipId.get(SpaceSimUserData.uniqueKey(data));
        let ship: Ship;
        if (id) {
            ship = this._ships.get(id);
            if (ship) {
                const timer = this._disconnectTimers.get(ship.id);
                window.clearTimeout(timer);
                this._disconnectTimers.delete(ship.id);
                this._ensureSocketInRoom(socket);
            }
        }
        return ship;
    }

    private _ensureSocketInRoom(socket: Socket): void {
        if (socket && !Array.from(socket.rooms.keys()).includes(this.ROOM_NAME)) {
            console.debug(`rejoining socket '${socket.id}' to room '${this.ROOM_NAME}'`);
            socket.join(this.ROOM_NAME);
        }
    }

    private _cleanup(): void {
        // this._removeSocketsFromRoomWhoAreNotInMultiplayerGame();
        this._removeSocketToShipMappingForNonexistingShips();
    }

    private _removeSocketsFromRoomWhoAreNotInMultiplayerGame(): void {
        const sockets = Array.from(SpaceSimServer.io.sockets.sockets.values())
            .filter(s => s.rooms.has(this.ROOM_NAME));
        if (sockets?.length) {
            for (let socket of sockets) {
                if (!this._dataToShipId.has(socket.id)) {
                    console.debug(`removing socket: '${socket.id}' from room: ${this.ROOM_NAME}`)
                    socket.leave(this.ROOM_NAME);
                }
            }
        }
    }

    private _removeSocketToShipMappingForNonexistingShips(): void {
        const shipids = Array.from(this._dataToShipId.values());
        if (shipids?.length) {
            for (let shipid of shipids) {
                if (!this._ships.has(shipid)) {
                    const socketids = Helpers.getMapKeysByValue(this._dataToShipId, shipid);
                    for (let socketid of socketids) {
                        console.debug(`removing socketToShipId mapping for socket: '${socketid}'`);
                        this._dataToShipId.delete(socketid);
                    }
                }
            }
        }
    }
}