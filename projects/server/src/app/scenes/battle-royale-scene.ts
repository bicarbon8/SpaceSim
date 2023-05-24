import * as Phaser from "phaser";
import { BaseScene, GameLevel, Ship, ShipSupply, ShipSupplyOptions, AmmoSupply, CoolantSupply, FuelSupply, RepairsSupply, GameLevelOptions, SpaceSim, Engine, Weapon, MachineGun, ShipConfig, Exploder, AiController, StandardEngine, EconomyEngine, SportsEngine, Cannon, PlasmaGun, Logging, Helpers, TryCatch } from "space-sim-shared";
import { ServerShip } from "../ships/server-ship";
import { SpaceSimServer } from "../space-sim-server";

export class BattleRoyaleScene extends BaseScene {
    private readonly _supplies = new Map<string, ShipSupply>();
    private readonly _ships = new Map<string, Ship>();
    private readonly _bots = new Map<string, AiController>();
    private readonly _removeShipQueue = new Array<string>();
    private readonly _removeSuppliesQueue = new Array<string>();
    private readonly _flickerSuppliesQueue = new Array<string>();

    private _gameLevel: GameLevel;
    private _exploder: Exploder;

    /**
     * the communication "room" that all players in this scene must be within to 
     * receive socket events
     */
    readonly ROOM_NAME: string;

    constructor(options?: Phaser.Types.Scenes.SettingsConfig) {
        const room = options?.key ?? Phaser.Math.RND.uuid();
        super({
            ...options,
            key: room
        });
        this.ROOM_NAME = room;
    }

    override queueGameLevelUpdate<T extends GameLevelOptions>(opts: T): BaseScene {
        throw new Error("Method not implemented.");
    }
    override queueShipUpdates(...opts: Array<ShipConfig>): BaseScene {
        throw new Error("Method not implemented.");
    }
    override queueShipRemoval(...ids: string[]): BaseScene {
        Logging.log('debug', `queuing ships ${JSON.stringify(ids)} to be removed...`);
        this._removeShipQueue.splice(this._removeShipQueue.length, 0, ...ids);
        return this;
    }
    override queueSupplyUpdates(...opts: Array<ShipSupplyOptions>): BaseScene {
        throw new Error("Method not implemented.");
    }
    override queueSupplyRemoval(...ids: string[]): BaseScene {
        Logging.log('debug', `queuing supplies to be removed ${JSON.stringify(ids)}...`);
        this._removeSuppliesQueue.splice(this._removeSuppliesQueue.length, 0, ...ids);
        return this;
    }
    override queueSupplyFlicker(...ids: string[]): BaseScene {
        Logging.log('debug', `queuing supplies to start flickering ${JSON.stringify(ids)}...`);
        this._flickerSuppliesQueue.splice(this._flickerSuppliesQueue.length, 0, ...ids);
        return this;
    }
    override queueEndScene(): BaseScene {
        throw new Error("Method not implemented.");
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
        /* do nothing */
    }

    create(): void {
        this._exploder = new Exploder(this);
        this._createGameLevel();
        this._setupSceneEventHandling();
        for (let i = 0; i < SpaceSimServer.Constants.Rooms.MAX_BOTS; i++) {
            this.createBot();
        }

        this.addRepeatingAction('high', 'remove-ships', () => this._processRemoveShipQueue());
        this.addRepeatingAction('high', 'remove-supplies', () => this._processRemoveSupplyQueue());
        this.addRepeatingAction('high', 'update-ships', (time: number, delta: number) => {
            this.getShips()
                .filter(s => s.active)
                .forEach(ship => ship?.update(time, delta));
        }).addRepeatingAction('high', 'update-bot-controllers', (time: number, delta: number) => {
            this._bots.forEach((bot: AiController) => bot.update(time, delta));
        });
        this.addRepeatingAction('medium', 'send-ships-update', () => {
            const ships = this.getShips()
                .filter(s => s.active)
                .map(s => s.config);
            if (ships) {
                SpaceSimServer.io.sendUpdatePlayersEvent(this.ROOM_NAME, ships);
            }
        });
        this.addRepeatingAction('low', 'send-supplies-update', () => {
            const supplies = this.getSupplies()
                .filter(s => s.active)
                .map(s => s.config);
            if (supplies.length) {
                SpaceSimServer.io.sendUpdateSuppliesEvent(this.ROOM_NAME, supplies);
            }
        });
        this.addRepeatingAction('ultralow', 'send-stats-update', () => {
            // TODO: filter out stats from other rooms
            SpaceSimServer.io.sendUpdateStatsToRoom(this.ROOM_NAME, SpaceSim.stats.getAllStats());
        }).addRepeatingAction('ultralow', 'send-supply-flicker', () => {
            this._processFlickerSupplyQueue();
        }).addRepeatingAction('ultralow', 'send-game-level-update', () => {
            SpaceSimServer.io.sendUpdateGameLevelToRoom(this.ROOM_NAME, this.getLevel().config);
        });
    }

    createShip(data: SpaceSim.UserData, config?: Partial<ShipConfig>): Ship {
        const room = this.getLevel().rooms[0];
        const topleft: Phaser.Math.Vector2 = this.getLevel().getMapTileWorldLocation(room.left + 1, room.top + 1);
        const botright: Phaser.Math.Vector2 = this.getLevel().getMapTileWorldLocation(room.left+room.width - 1, room.top+room.height - 1);
        let loc: Phaser.Math.Vector2;
        do {
            let x = Phaser.Math.RND.realInRange(topleft.x, botright.x);
            let y = Phaser.Math.RND.realInRange(topleft.y, botright.y);
            loc = Helpers.vector2(x, y);
        } while (this._isMapLocationOccupied(loc, 100));
        let engine: (new (scene: BaseScene) => Engine);
        switch (config?.engineModel) {
            case 'economy':
                engine = EconomyEngine;
                break;
            case 'sports':
                engine = SportsEngine;
                break;
            case 'standard':
            default:
                engine = StandardEngine;
                break;
        }
        let weapon: (new (scene: BaseScene) => Weapon);
        switch (config?.weaponModel) {
            case 'cannon':
                weapon = Cannon;
                break;
            case 'plasma':
                weapon = PlasmaGun;
                break;
            case 'machinegun':
            default:
                weapon = MachineGun;
                break;
        }
        const ship = new ServerShip(this, {
            location: loc,
            name: data.name,
            weaponsKey: config?.weaponsKey ?? Phaser.Math.RND.between(1, 3),
            wingsKey: config?.wingsKey ?? Phaser.Math.RND.between(1, 3),
            cockpitKey: config?.cockpitKey ?? Phaser.Math.RND.between(1, 3),
            engineKey: config?.engineKey ?? Phaser.Math.RND.between(1, 3),
            engine: engine,
            weapon: weapon
        });
        this.physics.add.collider(ship, this.getLevel().wallsLayer, () => {
            const factor = SpaceSim.Constants.Ships.WALL_BOUNCE_FACTOR;
            ship.body.velocity.multiply({x: factor, y: factor});
        });
        this._addPlayerCollisionPhysicsWithPlayers(ship);
        this._addPlayerCollisionPhysicsWithSupplies(ship);
        Logging.log('info', 'adding ship', ship.config);
        this._ships.set(ship.id, ship);
        SpaceSim.stats.start(ship.config);

        Logging.log('debug', 'updating user', data, 'record to include shipId:', ship.id);
        SpaceSimServer.users.update({ shipId: ship.id }, data);

        this._updateBotEnemyIds();

        return ship;
    }

    createBot(): void {
        const botData: SpaceSim.UserData = {
            fingerprint: Phaser.Math.RND.uuid()
        };
        let index = 1;
        const botNames = Array.from(this._bots.values()).map(ai => ai.ship.name);
        let name = `bot-${index}`;
        while (SpaceSimServer.users.count({ name: name }) > 0 || botNames.includes(name)) {
            index++;
            name = `bot-${index}`;
        }
        botData.name = `bot-${index}`;
        const bot = this.createShip(botData);
        const botController = new AiController(this, bot);
        this._bots.set(bot.id, botController);
        this._updateBotEnemyIds(botController);
    }

    addPlayerToScene(player: SpaceSimServer.UserData): void {
        const user = SpaceSimServer.users.selectFirst(player);
        if (user) {
            Logging.log('info', 'adding player:', user, 'to scene:', this.ROOM_NAME);
            user.room = this.ROOM_NAME;
            SpaceSimServer.io.joinRoom(user.socketId, this.ROOM_NAME);
            SpaceSimServer.users.update(user);
            SpaceSimServer.io.sendJoinRoomResponse(user.socketId);
        }
    }

    removePlayerFromScene(player: SpaceSimServer.UserData): void {
        const user = SpaceSimServer.users.selectFirst(player);
        if (user) {
            Logging.log('info', 'removing player:', user, 'from scene:', this.ROOM_NAME);
            const id = user.shipId;
            if (id) {
                this.queueShipRemoval(id);
            }
            user.room = null;
            user.shipId = null;
            SpaceSimServer.users.update(user);
            SpaceSimServer.io.leaveRoom(user.socketId, this.ROOM_NAME);
        }
    }

    private _setupSceneEventHandling(): void {
        // setup listeners for scene events
        this.events.on(SpaceSim.Constants.Events.SHIP_DEATH, (cfg: ShipConfig) => {
            Logging.log('debug', `received '${SpaceSim.Constants.Events.SHIP_DEATH}' event in scene`);
            this.queueShipRemoval(cfg.id);
        }).on(SpaceSim.Constants.Events.WEAPON_ENABLED, (id: string) => SpaceSimServer.io.sendEnableWeaponEventToRoom(this.ROOM_NAME, id))
            .on(SpaceSim.Constants.Events.WEAPON_DISABLED, (id: string) => SpaceSimServer.io.sendDisableWeaponEventToRoom(this.ROOM_NAME, id))
            .on(SpaceSim.Constants.Events.ENGINE_ENABLED, (id: string) => SpaceSimServer.io.sendEnableEngineEventToRoom(this.ROOM_NAME, id))
            .on(SpaceSim.Constants.Events.ENGINE_DISABLED, (id: string) => SpaceSimServer.io.sendDisableEngineEventToRoom(this.ROOM_NAME, id));
    }

    private _createGameLevel(): void {
        Logging.log('debug', `creating GameLevel in room ${this.ROOM_NAME}`);
        const map = new GameLevel(this, SpaceSimServer.Constants.Map.MAP_OPTIONS);
        this._gameLevel = map;
    }

    private _removeShip(opts: ShipConfig): void {
        Logging.log('debug', `emitting player death event to room '${this.ROOM_NAME}' for ship '${opts.id}' with name: '${opts.name}'...`);
        SpaceSimServer.io.sendShipDestroyedEventToRoom(this.ROOM_NAME, opts.id);

        if (this._ships.has(opts.id)) {
            // remove association of ship to user
            const user = SpaceSimServer.users.selectFirst({ shipId: opts.id });
            if (user) {
                this.removePlayerFromScene(user);
            }
            if (this._bots.has(opts.id)) {
                this._bots.delete(opts.id);
            }
            // prevent further updates to ship
            const player = this.getShip<ServerShip>(opts.id);
            this._ships.delete(opts.id);

            this._expelSupplies(opts);

            Logging.log('debug', `calling ship.destroy() for ship: ${opts.id}, with name: ${opts.name}`);
            player?.destroy();
        } else {
            Logging.log('warn', `[_removeShip] no ship with id '${opts.id}' was found.`);
        }
    }

    private _isMapLocationOccupied(location: Phaser.Types.Math.Vector2Like, radius: number): boolean {
        const circleA = new Phaser.Geom.Circle(location.x, location.y, radius);

        // ensure within walls of room
        const tiles: Array<Phaser.Tilemaps.Tile> = this.getLevel().wallsLayer
            .getTilesWithinShape(circleA)?.filter(t => t.collides);
        if (tiles?.length > 0) {
            Logging.log('debug', `location collides with map tiles: `, location);
            return true;
        }

        // ensure space not occupied by other player(s)
        const players = Array.from(this._ships.values());
        for (var i = 0; i < players.length; i++) {
            const p = players[i];
            const loc = p.location;
            const circleB = new Phaser.Geom.Circle(loc.x, loc.y, p.width / 2);
            const occupied = Phaser.Geom.Intersects.CircleToCircle(circleA, circleB);
            if (occupied) {
                Logging.log('debug', `location collides with existing player: `, location);
                return true;
            }
        }
        return false;
    }

    private _expelSupplies(shipCfg: ShipConfig): void {
        Logging.log('debug', `expelling supplies at:`, shipCfg.location);
        const supplyOpts = this._exploder.emitSupplies(shipCfg);
        const supplies = this._addSupplyCollisionPhysics(...supplyOpts);
        for (let supply of supplies) {
            this._supplies.set(supply.id, supply);
        }
        this._cleanupSupplies(...supplies);
        Logging.log('debug', supplyOpts.length, 'supplies expelled from ship', shipCfg.id);
    }

    private _addSupplyCollisionPhysics(...options: Array<ShipSupplyOptions>): Array<ShipSupply> {
        const supplies = new Array<ShipSupply>();
        for (let opts of options) {
            let supply: ShipSupply;
            switch (opts.supplyType) {
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
                    Logging.log('warn', 'unknown supplyType sent to _addSupplyCollisionPhysicsWithPlayers:', opts.supplyType);
                    break;
            }
            this.physics.add.collider(supply, this.getLevel().wallsLayer, () => {
                const factor = SpaceSim.Constants.Ships.Supplies.WALL_BOUNCE_FACTOR;
                supply.body.velocity.multiply({x: factor, y: factor});
            });
            const activeShips = this.getShips().filter(p => p?.active);
            for (let activeShip of activeShips) {
                this.physics.add.collider(supply, activeShip, () => {
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
        this.physics.add.collider(ship, this.getSupplies().filter(p => p?.active),
            (shipGameObj, supplyGameObj) => {
                const s: ShipSupply = supplyGameObj as ShipSupply;
                SpaceSimServer.io.sendRemoveSuppliesEvent(s.id);
                this._supplies.delete(s.id);
                s.apply(ship);
                s.destroy();
            }
        );
    }

    private _addPlayerCollisionPhysicsWithPlayers(ship: Ship): void {
        this.physics.add.collider(ship, this.getShips());
    }

    /**
     * removes a `ShipSupply` after 30 seconds
     * @param supply a `ShipSupply` to remove
     */
    private _cleanupSupplies(...supplies: Array<ShipSupply>): void {
        window.setTimeout(() => {
            this.queueSupplyFlicker(...supplies.filter(s => s.active).map(s => s.id));
            window.setTimeout(() => {
                this.queueSupplyRemoval(...supplies.filter(s => s.active).map(s => s.id));
            }, 5000);
        }, 25000);
    }

    private _processRemoveShipQueue(): void {
        const removeShipIds = this._removeShipQueue.splice(0, this._removeShipQueue.length);
        for (let id of removeShipIds) {
            let ship = this.getShip(id);
            if (ship) {
                TryCatch.run(() => this._removeShip(ship.config));
            }
        }
    }

    private _processRemoveSupplyQueue(): void {
        const removeSupplies = this._removeSuppliesQueue.splice(0, this._removeSuppliesQueue.length);
        for (let id of removeSupplies) {
            let supply = this.getSupply(id);
            if (supply) {
                Logging.log('debug', 'removing supply', supply.id);
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

    private _updateBotEnemyIds(...bots: Array<AiController>): void {
        const AIs = (bots.length > 0) ? bots : Array.from(this._bots.values());
        const botIds = Array.from(this._bots.keys());
        const allShipIds = Array.from(this._ships.keys());
        const notBots = allShipIds.filter(id => !botIds.includes(id));
        for (let ai of AIs) {
            ai.setEnemyIds(...notBots);
        }
    }
}