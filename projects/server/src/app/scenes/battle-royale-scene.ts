import * as Phaser from "phaser";
import { Server, Socket } from "socket.io";
import { GameMap } from "../map/game-map";
import { Ship } from "../ships/ship";
import { ShipOptions } from "../ships/ship-options";
import { AmmoSupply } from "../ships/supplies/ammo-supply";
import { CoolantSupply } from "../ships/supplies/coolant-supply";
import { FuelSupply } from "../ships/supplies/fuel-supply";
import { RepairsSupply } from "../ships/supplies/repairs-supply";
import { ShipSupply } from "../ships/supplies/ship-supply";
import { SpaceSim } from "../space-sim";
import { SpaceSimGameEngine } from "../space-sim-game-engine";
import { SpaceSimPlayerData } from "../space-sim-player-data";
import { Constants } from "../utilities/constants";
import { GameScoreTracker } from "../utilities/game-score-tracker";
import { Helpers } from "../utilities/helpers";

declare const io: Server;

export class BattleRoyaleScene extends Phaser.Scene {
    /**
     * a Map of fingerprints to `SpaceSimPlayerData` so we can prevent
     * more than 3 ships per fingerprint (user)
     */
    private _users = new Map<string, Array<SpaceSimPlayerData>>();

    /**
     * mapping of socket.id to ship.id since socket disconnect
     * results in new id on reconnect.
     */
    private _socketToShipId = new Map<string, string>();

    private _disconnectTimers = new Map<string, number>();

    preload(): void {
        this.load.image('weapons-1', `assets/sprites/ship-parts/weapons-1.png`);
        this.load.image('wings-1', `assets/sprites/ship-parts/wings-1.png`);
        this.load.image('cockpit-1', `assets/sprites/ship-parts/cockpit-1.png`);
        this.load.image('engine-1', `assets/sprites/ship-parts/engine-1.png`);
        
        this.load.image('bullet', `assets/sprites/bullet.png`);
        this.load.image('ammo', `assets/sprites/ammo.png`);
        this.load.image('fuel-canister', `assets/sprites/fuel-canister.png`);
        this.load.image('coolant-canister', `assets/sprites/coolant-canister.png`);
        this.load.image('repairs-canister', `assets/sprites/repairs-canister.png`);

        this.load.image('metaltiles', `assets/tiles/metaltiles_lg.png`);
    }

    create(): void {
        this._createMap();

        this._setupSocketEventHandling();
        this._setupSceneEventHandling();
    }

    update(time: number, delta: number): void {
        try {
            SpaceSim.players().forEach(ship => ship?.update(time, delta));
            this._sendPlayersUpdate();
            this._sendSuppliesUpdate();
        } catch (e) {
            console.error(`error in update: `, e);
        }
    }

    private _setupSocketEventHandling(): void {
        io.on('connection', (socket: Socket) => {
            console.debug(`player: ${socket.id} connected from ${socket.request.connection.remoteAddress}`);
            socket.on('disconnect', () => {
                console.debug(`player: ${socket.id} disconnected;`);
                const id = this._socketToShipId.get(socket.id);
                const ship = SpaceSim.playersMap.get(id);
                if (ship) {
                    console.debug(`waiting 10 seconds before destroying ship: ${ship.id}...`);
                    const config = ship.config;
                    this._disconnectTimers.set(id, window.setTimeout(() => {
                        this._removePlayer(config);
                    }, 10000));
                }
            }).on(Constants.Socket.SET_PLAYER_DATA, (data: SpaceSimPlayerData) => {
                console.debug(`received set player data from ${socket.id} `,
                    `with data: ${JSON.stringify(data)}`);
                this._reconnect(socket.id, data);
            }).on(Constants.Socket.REQUEST_MAP, (data: SpaceSimPlayerData) => {
                console.debug(`received map request from: ${socket.id}`);
                this._sendMap(socket);
            }).on(Constants.Socket.REQUEST_PLAYER, (data: SpaceSimPlayerData) => {
                console.debug(`received new player request from: ${socket.id} `,
                    `containing data: ${JSON.stringify(data)}`);
                data = {...data, name: Helpers.sanitise(data.name)};
                if (this._preventAbuse(data)) {
                    const ship = this._createPlayer(data);
                    this._socketToShipId.set(socket.id, ship.id);
                    socket.emit(Constants.Socket.SET_PLAYER_ID, ship.id);
                }
            }).on(Constants.Socket.TRIGGER_ENGINE, (data: SpaceSimPlayerData) => {
                const id = this._getShipId(socket.id, data);
                if (!id) {
                    socket.emit(Constants.Socket.PLAYER_DEATH);
                }
                const ship = SpaceSim.playersMap.get(id);
                if (ship) {
                    console.debug(`triggering engine for ${ship.id} at angle ${ship.angle}`);
                    socket.broadcast.emit(Constants.Socket.TRIGGER_ENGINE, ship.id);
                    ship.getThruster().trigger();
                }
            }).on(Constants.Socket.TRIGGER_WEAPON, (data: SpaceSimPlayerData) => {
                const id = this._getShipId(socket.id, data);
                if (!id) {
                    socket.emit(Constants.Socket.PLAYER_DEATH);
                }
                const ship = SpaceSim.playersMap.get(id);
                if (ship) {
                    console.debug(`triggering weapon for ${ship.id} at angle ${ship.angle}`);
                    socket.broadcast.emit(Constants.Socket.TRIGGER_WEAPON, ship.id);
                    ship.getWeapons().trigger();
                }
            }).on(Constants.Socket.SET_PLAYER_ANGLE, (degrees: number, data: SpaceSimPlayerData) => {
                try {
                    const d: number = Phaser.Math.Angle.WrapDegrees(+degrees.toFixed(0));
                    // console.debug(`received set angle to '${degrees}' request from: ${socket.id}`);
                    const id = this._getShipId(socket.id, data);
                    if (!id) {
                        socket.emit(Constants.Socket.PLAYER_DEATH);
                    }
                    const ship = SpaceSim.playersMap.get(id);
                    if (ship) {
                        ship.setRotation(d);
                    }
                } catch (e) {
                    console.error(`error in handling set angle event:`, e);
                }
            }).on(Constants.Socket.PLAYER_DEATH, (data: SpaceSimPlayerData) => {
                console.debug(`received player death notice from: ${socket.id}`);
                const id = this._getShipId(socket.id, data);
                if (!id) {
                    socket.emit(Constants.Socket.PLAYER_DEATH);
                }
                const ship = SpaceSim.playersMap.get(id);
                if (ship) {
                    this._removePlayer(ship.config);
                }
            });
        });
    }

    private _setupSceneEventHandling(): void {
        // setup listener for player death event (sent from ship.destroy())
        this.events.on(Constants.Events.PLAYER_DEATH, (shipOpts: ShipOptions) => {
            this._removePlayer(shipOpts);
        });
    }

    private _createMap(): void {
        const map = new GameMap(this, SpaceSimGameEngine.MAP_OPTIONS);
        SpaceSim.map = map;
    }

    private _createPlayer(data: SpaceSimPlayerData): Ship {
        const room = SpaceSim.map.getRooms()[0];
        const topleft: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.left+1, room.top+1);
        const botright: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.right-1, room.bottom-1);
        let loc: Phaser.Math.Vector2;
        do {
            let x = Phaser.Math.RND.realInRange(topleft.x, botright.x);
            let y = Phaser.Math.RND.realInRange(topleft.y, botright.y);
            loc = Helpers.vector2(x, y);
        } while (this._isEmpty(loc, 100));
        const ship = new Ship(this, {
            location: loc,
            fingerprint: data.fingerprint,
            name: data.name
        });
        this.physics.add.collider(ship.getGameObject(), SpaceSim.map.getGameObject());
        this._addPlayerCollisionPhysicsWithPlayers(ship);
        this._addPlayerCollisionPhysicsWithSupplies(ship);
        console.debug(`adding ship with fingerprint: ${data.fingerprint},`,
            `name: ${data.name.substring(0, 10)},`,
            `and id: ${ship.id} at x: ${ship.location.x}, y: ${ship.location.y}`);
        SpaceSim.playersMap.set(ship.id, ship);
        
        return ship;
    }

    private _removePlayer(opts: ShipOptions): void {
        if (SpaceSim.playersMap.has(opts.id)) {
            // prevent further updates to ship
            const player = SpaceSim.playersMap.get(opts.id);
            SpaceSim.playersMap.delete(opts.id);

            console.debug(`removing ship id: ${opts.id}, with name: ${opts.name}`);
            player?.destroy(false); // don't emit event locally
            io.emit(Constants.Socket.PLAYER_DEATH, opts.id);
            this._expelSupplies(opts);
            io.emit(Constants.Socket.UPDATE_STATS, (GameScoreTracker.getAllStats()));
            // TODO: locate user fingerprint associated with ship.id and update count
        }
    }

    private _sendMap(socket: Socket): void {
        socket.emit(Constants.Socket.UPDATE_MAP, SpaceSimGameEngine.MAP_OPTIONS);
    }

    private _sendPlayersUpdate(): void {
        io.emit(Constants.Socket.UPDATE_PLAYERS, SpaceSim.players().map(p => p.config));
    }

    private _sendSuppliesUpdate(): void {
        io.emit(Constants.Socket.UPDATE_SUPPLIES, SpaceSim.supplies().map(s => s.config));
    }

    private _isEmpty(location: Phaser.Types.Math.Vector2Like, radius: number): boolean {
        const circleA = new Phaser.Geom.Circle(location.x, location.y, radius);

        // ensure within walls of room
        const tiles: Array<Phaser.Tilemaps.Tile> = SpaceSim.map.getLayer()
            .getTilesWithinShape(circleA)?.filter(t => t.collides);
        if (tiles?.length > 0) {
            console.debug(`location collides with map tiles: `, location);
            return false;
        }

        // ensure space not occupied by other player(s)
        const players = Array.from(SpaceSim.playersMap.values());
        for (var i=0; i<players.length; i++) {
            const p = players[i];
            const loc = p.getLocation();
            const circleB = new Phaser.Geom.Circle(loc.x, loc.y, p.getGameObject().width / 2)
            const occupied = Phaser.Geom.Intersects.CircleToCircle(circleA, circleB);
            if (occupied) {
                console.debug(`location collides with existing player: `, location);
                return false;
            }
        }
        return true;
    }

    private _expelSupplies(shipCfg: ShipOptions): void {
        const loc = shipCfg.location;
        let remainingFuel = shipCfg.remainingFuel / 2;
        const fuelContainersCount = Phaser.Math.RND.between(1, remainingFuel / Constants.Ship.MAX_FUEL_PER_CONTAINER);
        for (var i=0; i<fuelContainersCount; i++) {
            const amount = (remainingFuel > Constants.Ship.MAX_FUEL_PER_CONTAINER) 
                ? Constants.Ship.MAX_FUEL_PER_CONTAINER 
                : remainingFuel;
            remainingFuel -= amount;
            const supply = new FuelSupply(this, {
                amount: amount,
                location: loc
            });
            this._addSupplyCollisionPhysicsWithPlayers(supply);
            SpaceSim.suppliesMap.set(supply.id, supply);
            this._cleanupSupply(supply);
        }
        let remainingAmmo = shipCfg.remainingAmmo / 2;
        const ammoContainersCount = Phaser.Math.RND.between(1, remainingAmmo / Constants.Ship.Weapons.MAX_AMMO_PER_CONTAINER);
        for (var i=0; i<ammoContainersCount; i++) {
            const amount = (remainingAmmo > Constants.Ship.Weapons.MAX_AMMO_PER_CONTAINER) 
                ? Constants.Ship.Weapons.MAX_AMMO_PER_CONTAINER 
                : remainingAmmo;
            remainingAmmo -= amount;
            const supply = new AmmoSupply(this, {
                amount: amount,
                location: loc
            });
            this._addSupplyCollisionPhysicsWithPlayers(supply);
            SpaceSim.suppliesMap.set(supply.id, supply);
            this._cleanupSupply(supply);
        }
        if (Phaser.Math.RND.between(0, 1)) {
            const supply = new CoolantSupply(this, {
                amount: 40,
                location: loc
            });
            this._addSupplyCollisionPhysicsWithPlayers(supply);
            SpaceSim.suppliesMap.set(supply.id, supply);
            this._cleanupSupply(supply);
        }
        if (Phaser.Math.RND.between(0, 1)) {
            const supply = new RepairsSupply(this, {
                amount: 20,
                location: loc
            });
            this._addSupplyCollisionPhysicsWithPlayers(supply);
            SpaceSim.suppliesMap.set(supply.id, supply);
            this._cleanupSupply(supply);
        }
    }

    private _addSupplyCollisionPhysicsWithPlayers(supply: ShipSupply): void {
        this.physics.add.collider(supply, SpaceSim.players()
            .filter(p => p?.active)
            .map(o => o?.getGameObject()), 
            (obj1, obj2) => {
                let shipGameObj: Phaser.GameObjects.Container;
                if (obj1 === supply) {
                    shipGameObj = obj2 as Phaser.GameObjects.Container;
                } else {
                    shipGameObj = obj1 as Phaser.GameObjects.Container;
                }
                const ship: Ship = SpaceSim.players().find(p => {
                    const go = p.getGameObject();
                    if (go === shipGameObj) {
                        return true;
                    }
                    return false;
                });
                io.emit(Constants.Socket.REMOVE_SUPPLY, supply.id);
                SpaceSim.suppliesMap.delete(supply.id);
                supply.apply(ship);
                supply.destroy();
            }
        );
    }

    private _addPlayerCollisionPhysicsWithSupplies(ship: Ship): void {
        this.physics.add.collider(ship.getGameObject(), SpaceSim.supplies()
            .filter(p => p?.active), 
            (obj1, obj2) => {
                let supply: ShipSupply;
                if (obj1 === ship.getGameObject()) {
                    supply = obj2 as ShipSupply;
                } else {
                    supply = obj1 as ShipSupply;
                }
                io.emit(Constants.Socket.REMOVE_SUPPLY, supply.id);
                SpaceSim.suppliesMap.delete(supply.id);
                supply.apply(ship);
                supply.destroy();
            }
        );
    }

    private _addPlayerCollisionPhysicsWithPlayers(ship: Ship): void {
        this.physics.add.collider(ship.getGameObject(), SpaceSim.players().map(p => p?.getGameObject()));
    }

    /**
     * ensure no single user creates more than 3 players at a time
     */
    private _preventAbuse(data: SpaceSimPlayerData): boolean {
        if (this._users.has(data.fingerprint)) {
            const datas = this._users.get(data.fingerprint);
            if (datas.length >= 3) {
                return false;
            }
        } else {
            this._users.set(data.fingerprint, new Array<SpaceSimPlayerData>());
        }

        return true;
    }

    /**
     * removes a `ShipSupply` after 30 seconds
     * @param supply a `ShipSupply` to remove
     */
    private _cleanupSupply(supply: ShipSupply): void {
        window.setTimeout(() => {
            io.emit(Constants.Socket.FLICKER_SUPPLY, (supply.id));
            window.setTimeout(() => {
                SpaceSim.suppliesMap.delete(supply.id);
                supply.destroy();
                io.emit(Constants.Socket.REMOVE_SUPPLY, (supply.id));
            }, 5000);
        }, 25000);
    }

    private _getShipId(socketId: string, data?: SpaceSimPlayerData): string {
        const id = this._socketToShipId.get(socketId);
        if (id) {
            return id;
        }
        return this._reconnect(socketId, data);
    }

    private _reconnect(newSocketId: string, data: SpaceSimPlayerData): string {
        try {
            data = {...data, name: Helpers.sanitise(data.name)};
            const ship = SpaceSim.players()
                .find(p => p.fingerprint === data.fingerprint 
                    && p.name === data.name);
            if (ship) {
                window.clearTimeout(ship.id);
                this._socketToShipId.set(newSocketId, ship.id);
                return ship.id;
            }
        } catch (e) {
            console.warn('error reconnecting: ', e);
        }
        return null; // unable to reconnect
    }
}