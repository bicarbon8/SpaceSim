import * as Phaser from "phaser";
import { BaseScene, GameLevel, Ship, ShipOptions, ShipSupply, SpaceSimUserData, Constants, Exploder, GameScoreTracker, Helpers, ShipSupplyOptions, AmmoSupply, CoolantSupply, FuelSupply, RepairsSupply, GameLevelOptions, SpaceSim } from "space-sim-shared";
import { SpaceSimServer } from "../space-sim-server";
import { SpaceSimServerUserData } from "../space-sim-server-user-data";

export class BattleRoyaleScene extends BaseScene {
    override setLevel<T extends GameLevelOptions>(opts: T): BaseScene {
        throw new Error("Method not implemented.");
    }
    override updateShips<T extends ShipOptions>(opts: T[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    override removeShips(...ids: string[]): BaseScene {
        if (SpaceSim.debug) {
            console.debug(`${Date.now()}: queuing ships ${JSON.stringify(ids)} to be removed...`);
        }
        this._removeShipQueue.splice(this._removeShipQueue.length, 0, ...ids);
        return this;
    }
    override updateSupplies<T extends ShipSupplyOptions>(opts: T[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    override removeSupplies(...ids: string[]): BaseScene {
        if (SpaceSim.debug) {
            console.debug(`${Date.now()}: queuing supplies to be removed ${JSON.stringify(ids)}...`);
        }
        this._removeSuppliesQueue.splice(this._removeSuppliesQueue.length, 0, ...ids);
        return this;
    }
    override flickerSupplies(...ids: string[]): BaseScene {
        if (SpaceSim.debug) {
            console.debug(`${Date.now()}: queuing supplies to start flickering ${JSON.stringify(ids)}...`);
        }
        this._flickerSuppliesQueue.splice(this._flickerSuppliesQueue.length, 0, ...ids);
        return this;
    }
    override endScene(): BaseScene {
        throw new Error("Method not implemented.");
    }

    readonly ROOM_NAME: string;
    
    /**
     * mapping of `fingerprint-name` to ship.id since socket disconnect
     * results in new socket id on reconnect so it can't be used.
     */
    private readonly _dataToShipId = new Map<string, string>();
    private readonly _supplies = new Map<string, ShipSupply>();
    private readonly _ships = new Map<string, Ship>();
    private readonly _removeShipQueue = new Array<string>();
    private readonly _removeSuppliesQueue = new Array<string>();
    private readonly _flickerSuppliesQueue = new Array<string>();
    
    private _gameLevel: GameLevel;
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

        if (this._ships.size > 0) {
            this._processRemoveShipQueue();
            Helpers.trycatch(() => this.getShips().forEach(ship => ship?.update(time, delta)));
            
            // 30 fps
            if (this._medPriUpdateAt >= Constants.Timing.MED_PRI_UPDATE_FREQ) {
                this._medPriUpdateAt = 0;
                SpaceSimServer.io.sendUpdatePlayersEvent(this.ROOM_NAME, this.getShips().map(s => s.config));
            }

            // 15 fps
            if (this._lowPriUpdateAt >= Constants.Timing.LOW_PRI_UPDATE_FREQ) {
                this._lowPriUpdateAt = 0;
                SpaceSimServer.io.sendUpdateSuppliesEvent(this.ROOM_NAME, this.getSupplies().map(s => s.config));
            }

            // 1 fps
            if (this._ultraLowPriUpdateAt >= Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ) {
                this._ultraLowPriUpdateAt = 0;
                // TODO: filter out stats from other rooms
                SpaceSimServer.io.sendUpdateStatsToRoom(this.ROOM_NAME, GameScoreTracker.getAllStats());
                this._processRemoveSupplyQueue();
                this._processFlickerSupplyQueue();
                Helpers.trycatch(() => this._cleanup());
            }
        }
    }

    getShip(data: SpaceSimUserData): Ship {
        const id = this._dataToShipId.get(SpaceSimServer.users.generateKey(data));
        let ship: Ship;
        if (id) {
            ship = this._ships.get(id);
        }
        return ship;
    }

    createShip(data: SpaceSimUserData): Ship {
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
        if (SpaceSim.debug) {
            console.debug(`adding ship with fingerprint: ${data.fingerprint},`,
                `name: ${data.name.substring(0, 10)},`,
                `and id: ${ship.id} at x: ${ship.location.x}, y: ${ship.location.y}`);
        }
        this._ships.set(ship.id, ship);
        GameScoreTracker.start(ship.config);

        const key = SpaceSimServer.users.generateKey(data);
        console.info(`created new ship and associating data '${key}' to ship '${ship.id}'`);
        this._dataToShipId.set(key, ship.id);
        
        return ship;
    }

    addPlayer(player: SpaceSimServerUserData): void {
        if (player) {
            console.debug(`adding player ${JSON.stringify(player)} to scene ${this.ROOM_NAME}`);
            player.room = this.ROOM_NAME;
            SpaceSimServer.io.joinRoom(player.socketId, this.ROOM_NAME);
            SpaceSimServer.io.sendJoinRoomResponse(player.socketId);
        }
    }

    removePlayer(player: SpaceSimServerUserData): void {
        console.debug(`removing player '${JSON.stringify(player)}' and associated ship...`);
        const id = this._dataToShipId.get(SpaceSimServer.users.generateKey(player));
        this.removeShips(id);
        player.room = null;
        SpaceSimServer.io.leaveRoom(player.socketId, this.ROOM_NAME);
    }

    private _setupSceneEventHandling(): void {
        // setup listener for player death event (sent from ship.destroy())
        this.events.on(Constants.Events.PLAYER_DEATH, (shipOpts: ShipOptions) => {
            this.removeShips(shipOpts.id);
        });
    }

    private _createMap(): void {
        console.debug(`creating GameLevel in room ${this.ROOM_NAME}`);
        const map = new GameLevel(this, SpaceSimServer.MAP_OPTIONS);
        this._gameLevel = map;
    }

    private _removeShip(opts: ShipOptions): void {
        if (SpaceSim.debug) {
            console.debug(`attempting to remove ship id: '${opts.id}' with name: '${opts.name}'...`);
        }

        const userDataKeys = Helpers.getMapKeysByValue(this._dataToShipId, opts.id).filter(sid => sid != null);
        if (SpaceSim.debug) {
            console.debug(`found ${userDataKeys.length} user data keys associated with ship '${opts.id}'`);
        }
        for (let userDataKey of userDataKeys) {
            const user = SpaceSimServer.users.selectFirst(SpaceSimServer.users.parseKey(userDataKey));
            if (user?.socketId) {
                if (SpaceSim.debug) {
                    console.debug(`${Date.now()}: sending player death notice to socket '${user.socketId}' for ship '${opts.id}'`);
                }
                SpaceSimServer.io.sendPlayerDeathEvent(user.socketId, opts.id);
            }
        }

        if (this._ships.has(opts.id)) {
            // prevent further updates to ship
            const player = this._ships.get(opts.id);
            this._ships.delete(opts.id);
            
            this._expelSupplies(opts);

            if (SpaceSim.debug) {
                console.debug(`calling ship.destroy(false) for ship: ${opts.id}, with name: ${opts.name}`);
            }
            player?.destroy(false); // don't emit event locally
        } else {
            console.warn(`no ship with id '${opts.id}' was found.`);
        }
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
                SpaceSimServer.io.sendRemoveSuppliesEvent(supply.id);
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
                SpaceSimServer.io.sendRemoveSuppliesEvent(supply.id);
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
            this.flickerSupplies(...supplies.map(s => s.id));
            window.setTimeout(() => {
                this.removeSupplies(...supplies.map(s => s.id));
            }, 5000);
        }, 25000);
    }

    private _cleanup(): void {
        // this._removeSocketsFromRoomWhoAreNotInMultiplayerGame();
        this._removeSocketToShipMappingForNonexistingShips();
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

    private _processRemoveShipQueue(): void {
        const removeShipIds = this._removeShipQueue.splice(0, this._removeShipQueue.length);
        for (let id of removeShipIds) {
            let ship = this._ships.get(id);
            if (ship) {
                Helpers.trycatch(() => this._removeShip(ship.config));
            }
        }
    }

    private _processRemoveSupplyQueue(): void {
        const removeSupplies = this._removeSuppliesQueue.splice(0, this._removeSuppliesQueue.length);
        for (let id of removeSupplies) {
            let supply = this._supplies.get(id);
            if (supply) {
                this._supplies.delete(id);
                supply.destroy();
            }
        }
        SpaceSimServer.io.sendRemoveSuppliesEvent(this.ROOM_NAME, ...removeSupplies);
    }

    /**
     * NOTE: this is a client only event as the server doesn't flicker supplies
     */
    private _processFlickerSupplyQueue(): void {
        const flickerSupplies = this._flickerSuppliesQueue.splice(0, this._flickerSuppliesQueue.length);
        SpaceSimServer.io.sendFlickerSuppliesEvent(this.ROOM_NAME, ...flickerSupplies);
    }
}