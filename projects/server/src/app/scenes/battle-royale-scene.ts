import * as Phaser from "phaser";
import { BaseScene, GameLevel, Ship, ShipOptions, ShipSupply, SpaceSimUserData, Constants, GameScoreTracker, Helpers, ShipSupplyOptions, AmmoSupply, CoolantSupply, FuelSupply, RepairsSupply, GameLevelOptions, SpaceSim } from "space-sim-shared";
import { ServerBulletFactory } from "../ships/attachments/offence/server-bullet-factory";
import { ServerShip } from "../ships/server-ship";
import { SpaceSimServer } from "../space-sim-server";
import { SpaceSimServerUserData } from "../space-sim-server-user-data";
import { NonUiExploder } from "../utilities/non-ui-exploder";

export class BattleRoyaleScene extends BaseScene {
    override queueGameLevelUpdate<T extends GameLevelOptions>(opts: T): BaseScene {
        throw new Error("Method not implemented.");
    }
    override queueShipUpdates<T extends ShipOptions>(opts: T[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    override queueShipRemoval(...ids: string[]): BaseScene {
        if (SpaceSim.debug) {
            console.debug(`[${Date.now()}]: queuing ships ${JSON.stringify(ids)} to be removed...`);
        }
        this._removeShipQueue.splice(this._removeShipQueue.length, 0, ...ids);
        return this;
    }
    override queueSupplyUpdates<T extends ShipSupplyOptions>(opts: T[]): BaseScene {
        throw new Error("Method not implemented.");
    }
    override queueSupplyRemoval(...ids: string[]): BaseScene {
        if (SpaceSim.debug) {
            console.debug(`[${Date.now()}]: queuing supplies to be removed ${JSON.stringify(ids)}...`);
        }
        this._removeSuppliesQueue.splice(this._removeSuppliesQueue.length, 0, ...ids);
        return this;
    }
    override queueSupplyFlicker(...ids: string[]): BaseScene {
        if (SpaceSim.debug) {
            console.debug(`[${Date.now()}]: queuing supplies to start flickering ${JSON.stringify(ids)}...`);
        }
        this._flickerSuppliesQueue.splice(this._flickerSuppliesQueue.length, 0, ...ids);
        return this;
    }
    override queueEndScene(): BaseScene {
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
    private _exploder: NonUiExploder;
    private _bulletFactory: ServerBulletFactory;
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

    override getShip<T extends Ship>(id: string): T {
        return this._ships.get(id) as T;
    }

    override getShips<T extends Ship>(): Array<T> {
        return Array.from(this._ships.values()) as Array<T>;
    }

    override getSupply<T extends ShipSupply>(id: string): T {
        return this._supplies.get(id) as T;
    }

    override getSupplies<T extends ShipSupply>(): Array<T> {
        return Array.from(this._supplies.values()) as Array<T>;
    }

    override getLevel<T extends GameLevel>(): T {
        return this._gameLevel as T;
    }

    preload(): void {
        this.load.image('metaltiles', `assets/tiles/metaltiles_lg.png`);
        this.load.image('minimaptile', `assets/tiles/minimap-tile.png`);
    }

    create(): void {
        this._exploder = new NonUiExploder(this);
        this._bulletFactory = new ServerBulletFactory(this);
        this._createMap();
        this._setupSceneEventHandling();
    }

    update(time: number, delta: number): void {
        this._medPriUpdateAt += delta;
        this._lowPriUpdateAt += delta;
        this._ultraLowPriUpdateAt += delta;

        Helpers.trycatch(() => this._processRemoveShipQueue());
        Helpers.trycatch(() => {
            this.getShips()
                .filter(s => s.active)
                .forEach(ship => ship?.update(time, delta));
        });
        
        // 30 fps
        if (this._medPriUpdateAt >= Constants.Timing.MED_PRI_UPDATE_FREQ) {
            this._medPriUpdateAt = 0;
            Helpers.trycatch(() => {
                const ships = this.getShips()
                    .filter(s => s.active)
                    .map(s => s.config);
                if (ships) {
                    SpaceSimServer.io.sendUpdatePlayersEvent(this.ROOM_NAME, ships);
                }
            }, 'warn');
        }

        // 15 fps
        if (this._lowPriUpdateAt >= Constants.Timing.LOW_PRI_UPDATE_FREQ) {
            this._lowPriUpdateAt = 0;
            Helpers.trycatch(() => {
                const supplies = this.getSupplies()
                    .filter(s => s.active)
                    .map(s => s.config);
                if (supplies.length) {
                    SpaceSimServer.io.sendUpdateSuppliesEvent(this.ROOM_NAME, supplies);
                }
            }, 'warn');
        }

        // 1 fps
        if (this._ultraLowPriUpdateAt >= Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ) {
            this._ultraLowPriUpdateAt = 0;
            Helpers.trycatch(() => {
                // TODO: filter out stats from other rooms
                SpaceSimServer.io.sendUpdateStatsToRoom(this.ROOM_NAME, GameScoreTracker.getAllStats());
                this._processRemoveSupplyQueue();
                this._processFlickerSupplyQueue();
                this._cleanup()
            }, 'warn');
        }
    }

    getShipByData(data: SpaceSimUserData): Ship {
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
        const ship = new ServerShip(this, {
            location: loc,
            fingerprint: data.fingerprint,
            name: data.name,
            weaponsKey: Phaser.Math.RND.between(1, 3),
            wingsKey: Phaser.Math.RND.between(1, 3),
            cockpitKey: Phaser.Math.RND.between(1, 3),
            engineKey: Phaser.Math.RND.between(1, 3),
            exploder: this._exploder,
            bulletFactory: this._bulletFactory
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
            console.debug(`[${Date.now()}]: adding player ${JSON.stringify(player)} to scene ${this.ROOM_NAME}`);
            player.room = this.ROOM_NAME;
            SpaceSimServer.io.joinRoom(player.socketId, this.ROOM_NAME);
            SpaceSimServer.io.sendJoinRoomResponse(player.socketId);
        }
    }

    removePlayer(player: SpaceSimServerUserData): void {
        console.debug(`[${Date.now()}]: removing player '${JSON.stringify(player)}' and associated ship...`);
        const id = this._dataToShipId.get(SpaceSimServer.users.generateKey(player));
        this.queueShipRemoval(id);
        player.room = null;
        SpaceSimServer.io.leaveRoom(player.socketId, this.ROOM_NAME);
    }

    private _setupSceneEventHandling(): void {
        // setup listener for player death event (sent from ship.destroy())
        this.events.on(Constants.Events.PLAYER_DEATH, (shipOpts: ShipOptions) => {
            this.queueShipRemoval(shipOpts.id);
        });
    }

    private _createMap(): void {
        console.debug(`[${Date.now()}]: creating GameLevel in room ${this.ROOM_NAME}`);
        const map = new GameLevel(this, SpaceSimServer.MAP_OPTIONS);
        this._gameLevel = map;
    }

    private _removeShip(opts: Partial<ShipOptions>): void {
        if (SpaceSim.debug) {
            console.debug(`[${Date.now()}]: attempting to remove ship id: '${opts.id}' with name: '${opts.name}'...`);
        }

        SpaceSimServer.io.broadcastPlayerDeathEvent(this.ROOM_NAME, opts.id);

        if (this._ships.has(opts.id)) {
            // prevent further updates to ship
            const player = this.getShip<ServerShip>(opts.id);
            this._ships.delete(opts.id);
            
            this._expelSupplies(opts);

            if (SpaceSim.debug) {
                console.debug(`[${Date.now()}]: calling ship.destroyObjects(false) for ship: ${opts.id}, with name: ${opts.name}`);
            }
            player?.destroyObjects(false); // don't emit event locally
        } else {
            console.warn(`[${Date.now()}]: no ship with id '${opts.id}' was found.`);
        }
    }

    private _isMapLocationOccupied(location: Phaser.Types.Math.Vector2Like, radius: number): boolean {
        const circleA = new Phaser.Geom.Circle(location.x, location.y, radius);

        // ensure within walls of room
        const tiles: Array<Phaser.Tilemaps.Tile> = this.getLevel().getLayer()
            .getTilesWithinShape(circleA)?.filter(t => t.collides);
        if (tiles?.length > 0) {
            console.debug(`[${Date.now()}]: location collides with map tiles: `, location);
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
                console.debug(`[${Date.now()}]: location collides with existing player: `, location);
                return true;
            }
        }
        return false;
    }

    private _expelSupplies(shipCfg: Partial<ShipOptions>): void {
        console.debug(`[${Date.now()}]: expelling supplies at:`, shipCfg.location);
        const supplyOpts = this._exploder.emitSupplies(shipCfg);
        const supplies = this._addSupplyCollisionPhysics(...supplyOpts);
        for (let supply of supplies) {
            this._supplies.set(supply.id, supply);
        }
        this._cleanupSupplies(...supplies);
        console.debug(`[${Date.now()}]: ${supplyOpts.length} supplies expelled from ship ${shipCfg.id}`);
    }

    private _addSupplyCollisionPhysics(...options: Array<ShipSupplyOptions>): Array<ShipSupply> {
        const supplies = new Array<ShipSupply>();
        for (let opts of options) {
            let supply: ShipSupply;
            switch(opts.supplyType) {
                case 'ammo':
                    supply = new AmmoSupply(this, opts);
                    break;
                case 'coolant':
                    supply = new CoolantSupply(this, opts);
                    break;
                case 'fuel':
                    supply = new FuelSupply(this, opts);
                    break;
                case 'repairs':
                    supply = new RepairsSupply(this, opts);
                    break;
                default:
                    console.warn(`unknown supplyType sent to _addSupplyCollisionPhysicsWithPlayers:`, opts.supplyType);
                    break;
            }
            this.physics.add.collider(supply, this.getLevel().getGameObject());
            const activeShips = this.getShips().filter(p => p?.active);
            for (let activeShip of activeShips) {
                this.physics.add.collider(supply, activeShip.getGameObject(), () => {
                        this.queueSupplyRemoval(supply.id);
                        supply.apply(activeShip);
                    }
                );
            }
            supplies.push(supply);
        }
        
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
            this.queueSupplyFlicker(...supplies.map(s => s.id));
            window.setTimeout(() => {
                this.queueSupplyRemoval(...supplies.map(s => s.id));
            }, 5000);
        }, 25000);
    }

    private _cleanup(): void {
        this._removeSocketToShipMappingForNonexistingShips();
    }

    private _removeSocketToShipMappingForNonexistingShips(): void {
        const shipids = Array.from(this._dataToShipId.values());
        if (shipids?.length) {
            for (let shipid of shipids) {
                if (!this._ships.has(shipid)) {
                    const socketids = Helpers.getMapKeysByValue(this._dataToShipId, shipid);
                    for (let socketid of socketids) {
                        console.debug(`[${Date.now()}]: removing socketToShipId mapping for socket: '${socketid}'`);
                        this._dataToShipId.delete(socketid);
                    }
                }
            }
        }
    }

    private _processRemoveShipQueue(): void {
        const removeShipIds = this._removeShipQueue.splice(0, this._removeShipQueue.length);
        for (let id of removeShipIds) {
            let ship = this.getShip(id);
            if (ship) {
                Helpers.trycatch(() => this._removeShip(ship.config));
            }
        }
    }

    private _processRemoveSupplyQueue(): void {
        const removeSupplies = this._removeSuppliesQueue.splice(0, this._removeSuppliesQueue.length);
        for (let id of removeSupplies) {
            let supply = this.getSupply(id);
            if (supply) {
                if (SpaceSim.debug) {
                    console.debug(`[${Date.now()}]: removing supply '${supply.id}'`);
                }
                this._supplies.delete(id);
                supply.destroy();
            }
        }
        if (removeSupplies.length) {
            SpaceSimServer.io.sendRemoveSuppliesEvent(this.ROOM_NAME, ...removeSupplies);
        }
    }

    /**
     * NOTE: this is a client only event as the server doesn't flicker supplies
     */
    private _processFlickerSupplyQueue(): void {
        const flickerSupplies = this._flickerSuppliesQueue.splice(0, this._flickerSuppliesQueue.length);
        if (flickerSupplies.length) {
            SpaceSimServer.io.sendFlickerSuppliesEvent(this.ROOM_NAME, ...flickerSupplies);
        }
    }
}