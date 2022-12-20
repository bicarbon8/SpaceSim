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
     * a Map of fingerprints to ship ids so we can prevent
     * more than 3 ships per fingerprint (user)
     */
    private _users = new Map<string, Array<string>>();

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
                console.debug(`player: ${socket.id} disconnected`);
                this._removePlayer(socket);
            }).on(Constants.Socket.REQUEST_MAP, () => {
                console.debug(`received map request from: ${socket.id}`);
                this._sendMap(socket);
            }).on(Constants.Socket.REQUEST_PLAYER, (data: SpaceSimPlayerData) => {
                console.debug(`received new player request from: ${socket.id} containing data:`, data);
                if (!SpaceSim.playersMap.has(socket.id)) {
                    if (this._preventAbuse(socket.id, data.fingerprint)) {
                        this._createPlayer({
                            ...data,
                            shipId: socket.id
                        });
                    }
                }
            }).on(Constants.Socket.TRIGGER_ENGINE, () => {
                console.debug(`received trigger engine request from: ${socket.id}`);
                const ship = SpaceSim.playersMap.get(socket.id);
                if (ship) {
                    socket.broadcast.emit(Constants.Socket.TRIGGER_ENGINE, ship.id);
                    ship.getThruster().trigger();
                }
            }).on(Constants.Socket.TRIGGER_WEAPON, () => {
                console.debug(`received trigger weapon request from: ${socket.id}`);
                const ship = SpaceSim.playersMap.get(socket.id);
                if (ship) {
                    socket.broadcast.emit(Constants.Socket.TRIGGER_WEAPON, ship.id);
                    ship.getWeapons().trigger();
                }
            }).on(Constants.Socket.SET_PLAYER_ANGLE, (degrees: number) => {
                try {
                    const d: number = Phaser.Math.Angle.WrapDegrees(+degrees.toFixed(0));
                    console.debug(`received set angle to '${degrees}' request from: ${socket.id}`);
                    const ship = SpaceSim.playersMap.get(socket.id);
                    if (ship) {
                        ship.setRotation(d);
                    }
                } catch (e) {
                    console.error(`error in handling set angle event:`, e);
                }
            }).on(Constants.Socket.PLAYER_DEATH, () => {
                console.debug(`received player death notice from: ${socket.id}`);
                const ship = SpaceSim.playersMap.get(socket.id);
                if (ship) {
                    this._removePlayer(socket);
                }
            });
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
            id: data.shipId,
            location: loc,
            fingerprint: data.fingerprint,
            name: data.name.substring(0, 10)
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

    private _removePlayer(socket: Socket): void {
        const id = socket?.id;
        if (SpaceSim.playersMap.has(id)) {
            const player = SpaceSim.playersMap.get(id);
            SpaceSim.playersMap.delete(id);
            const config = player.config;
            console.debug(`removing ship id: ${config.id}, with name: ${config.name}`);
            player?.destroy();
            socket.broadcast.emit(Constants.Socket.PLAYER_DEATH, id);
            this._expelSupplies(config);
            socket.emit(Constants.Socket.UPDATE_STATS, (config.id, GameScoreTracker.getStats(config)));
            if (this._users.has(config.fingerprint)) {
                const userShips = this._users.get(config.fingerprint);
                const index = userShips.findIndex(id => id === config.id);
                if (index >= 0) {
                    userShips.splice(index, 1);
                    this._users.set(config.fingerprint, userShips);
                }
            }
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
        }
        if (Phaser.Math.RND.between(0, 1)) {
            const supply = new CoolantSupply(this, {
                amount: 40,
                location: loc
            });
            this._addSupplyCollisionPhysicsWithPlayers(supply);
            SpaceSim.suppliesMap.set(supply.id, supply);
        }
        if (Phaser.Math.RND.between(0, 1)) {
            const supply = new RepairsSupply(this, {
                amount: 20,
                location: loc
            });
            this._addSupplyCollisionPhysicsWithPlayers(supply);
            SpaceSim.suppliesMap.set(supply.id, supply);
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
    private _preventAbuse(id: string, fingerprint: string): boolean {
        let datas: Array<string>;
        if (this._users.has(fingerprint)) {
             datas = this._users.get(fingerprint);
             if (datas.length > 2) {
                return false;
             }
        } else {
            datas = new Array<string>();
        }
        datas.push(id);
        this._users.set(fingerprint, datas);

        return true;
    }
}