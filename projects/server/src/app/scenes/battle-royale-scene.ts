import * as Phaser from "phaser";
import { Server, Socket } from "socket.io";
import { GameMap, Ship, ShipOptions, ShipSupply, SpaceSim, SpaceSimPlayerData, Constants, Exploder, GameScoreTracker, Helpers, ShipSupplyOptions, AmmoSupply, CoolantSupply, FuelSupply, RepairsSupply } from "space-sim-shared";
import { SpaceSimGameEngine } from "../space-sim-game-engine";

declare const io: Server;

export class BattleRoyaleScene extends Phaser.Scene {
    private readonly ROOM_NAME: string;
    
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

    private _exploder: Exploder;

    private _medPriUpdateAt: number = Constants.Timing.MED_PRI_UPDATE_FREQ;
    private _lowPriUpdateAt: number = Constants.Timing.LOW_PRI_UPDATE_FREQ;
    private _ultraLowPriUpdateAt: number = Constants.Timing.ULTRALOW_PRI_UPDATE_FREQ;

    constructor(roomName: string) {
        const room = roomName ?? Phaser.Math.RND.uuid();
        super({ key: room });
        this.ROOM_NAME = room;
    }

    preload(): void {
        this.load.image('bullet', `assets/sprites/bullet.png`);

        this.load.image('metaltiles', `assets/tiles/metaltiles_lg.png`);
        this.load.image('minimaptile', `assets/tiles/minimap-tile.png`);
    }

    create(): void {
        this._exploder = new Exploder(this);
        this._createMap();

        this._setupSocketEventHandling();
        this._setupSceneEventHandling();
    }

    update(time: number, delta: number): void {
        this._medPriUpdateAt += delta;
        this._lowPriUpdateAt += delta;
        this._ultraLowPriUpdateAt += delta;

        Helpers.trycatch(() => SpaceSim.players().forEach(ship => ship?.update(time, delta)));
        
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
            Helpers.trycatch(() => this._cleanup());
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
                        this._disconnectTimers.delete(id);
                    }, 10000));
                }
            }).on(Constants.Socket.SET_PLAYER_DATA, (data: SpaceSimPlayerData) => {
                console.debug(`received set player data from ${socket.id} `,
                    `with data: ${JSON.stringify(data)}`);
                const shipId = this._reconnect(socket.id, data);
                if (shipId) {
                    socket.emit(Constants.Socket.SET_PLAYER_ID, shipId);
                }
            }).on(Constants.Socket.REQUEST_MAP, (data: SpaceSimPlayerData) => {
                console.debug(`received map request from: ${socket.id}`);
                console.debug(`joining socket ${socket.id} to room ${this.ROOM_NAME}`);
                this._sendMap(socket);
            }).on(Constants.Socket.REQUEST_PLAYER, (data: SpaceSimPlayerData) => {
                console.debug(`received new player request from: ${socket.id} `,
                    `containing data: ${JSON.stringify(data)}`);
                data = {...data, name: Helpers.sanitise(data.name)};
                if (this._preventAbuse(data)) {
                    const ship = this._createPlayer(data);
                    console.debug(`associating socket ${socket.id} to ship ${ship.id}`);
                    this._socketToShipId.set(socket.id, ship.id);
                    console.debug(`sending ship id ${ship.id} to client ${socket.id}`);
                    socket.emit(Constants.Socket.SET_PLAYER_ID, ship.id);
                    socket.join(this.ROOM_NAME);
                }
            }).on(Constants.Socket.TRIGGER_ENGINE, (data: SpaceSimPlayerData) => {
                const ship = this._getShip(socket, data);
                if (ship) {
                    console.debug(`triggering engine for ${ship.id} at angle ${ship.angle}`);
                    socket.broadcast.emit(Constants.Socket.TRIGGER_ENGINE, ship.id);
                    ship.getThruster().trigger();
                }
            }).on(Constants.Socket.TRIGGER_WEAPON, (data: SpaceSimPlayerData) => {
                const ship = this._getShip(socket, data);
                if (ship) {
                    console.debug(`triggering weapon for ${ship.id} at angle ${ship.angle}`);
                    socket.broadcast.emit(Constants.Socket.TRIGGER_WEAPON, ship.id);
                    ship.getWeapons().trigger();
                }
            }).on(Constants.Socket.SET_PLAYER_ANGLE, (degrees: number, data: SpaceSimPlayerData) => {
                try {
                    // console.debug(`received set angle to '${degrees}' request from: ${socket.id}`);
                    const ship = this._getShip(socket, data);
                    if (ship) {
                        const d: number = Phaser.Math.Angle.WrapDegrees(+degrees.toFixed(0));
                        ship.setRotation(d);
                    }
                } catch (e) {
                    console.error(`error in handling set angle event:`, e);
                }
            }).on(Constants.Socket.PLAYER_DEATH, (data: SpaceSimPlayerData) => {
                console.debug(`received player death notice from: ${socket.id}`);
                const ship = this._getShip(socket, data);
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
        this.physics.add.collider(ship.getGameObject(), SpaceSim.map.getGameObject());
        this._addPlayerCollisionPhysicsWithPlayers(ship);
        this._addPlayerCollisionPhysicsWithSupplies(ship);
        console.debug(`adding ship with fingerprint: ${data.fingerprint},`,
            `name: ${data.name.substring(0, 10)},`,
            `and id: ${ship.id} at x: ${ship.location.x}, y: ${ship.location.y}`);
        SpaceSim.playersMap.set(ship.id, ship);
        GameScoreTracker.start(ship.config);
        
        return ship;
    }

    private _removePlayer(opts: ShipOptions): void {
        if (SpaceSim.playersMap.has(opts.id)) {
            // prevent further updates to ship
            const player = SpaceSim.playersMap.get(opts.id);
            SpaceSim.playersMap.delete(opts.id);
            for (var [key, val] of this._socketToShipId) {
                if (val === opts.id) {
                    this._socketToShipId.delete(key);
                    break;
                }
            }
            
            io.to(this.ROOM_NAME).emit(Constants.Socket.UPDATE_STATS, (GameScoreTracker.getAllStats()));
            console.debug(`sending player death notice to clients for ship ${opts.id}`);
            io.to(this.ROOM_NAME).emit(Constants.Socket.PLAYER_DEATH, opts.id);
            
            this._expelSupplies(opts);

            console.debug(`calling ship.destroy(false) for ship: ${opts.id}, with name: ${opts.name}`);
            player?.destroy(false); // don't emit event locally
            
            // locate user fingerprint associated with ship.id and update count
            Helpers.trycatch(() => {
                const datas = this._users.get(player.fingerprint);
                if (datas) {
                    const index = datas.findIndex(d => 
                        d.fingerprint === player.fingerprint
                        && d.name === player.name);
                    if (index >= 0) {
                        datas.splice(index, 1);
                        this._users.set(player.fingerprint, datas);
                    }
                }
            }, 'warn', 'error removing old user data');

            GameScoreTracker.stop(opts.id);
        }
    }

    private _sendMap(socket: Socket): void {
        socket.emit(Constants.Socket.UPDATE_MAP, SpaceSimGameEngine.MAP_OPTIONS);
    }

    private _sendPlayersUpdate(): void {
        io.to(this.ROOM_NAME).emit(Constants.Socket.UPDATE_PLAYERS, SpaceSim.players().map(p => p.config));
    }

    private _sendSuppliesUpdate(): void {
        io.to(this.ROOM_NAME).emit(Constants.Socket.UPDATE_SUPPLIES, SpaceSim.supplies().map(s => s.config));
    }

    private _isMapLocationOccupied(location: Phaser.Types.Math.Vector2Like, radius: number): boolean {
        const circleA = new Phaser.Geom.Circle(location.x, location.y, radius);

        // ensure within walls of room
        const tiles: Array<Phaser.Tilemaps.Tile> = SpaceSim.map.getLayer()
            .getTilesWithinShape(circleA)?.filter(t => t.collides);
        if (tiles?.length > 0) {
            console.debug(`location collides with map tiles: `, location);
            return true;
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
                return true;
            }
        }
        return false;
    }

    private _expelSupplies(shipCfg: ShipOptions): void {
        console.debug(`expelling supplies at:`, shipCfg.location);
        const supplyOpts = this._exploder.emitSupplies(shipCfg);
        for (const options of supplyOpts) {
            const supply = this._addSupplyCollisionPhysicsWithPlayers(options);
            SpaceSim.suppliesMap.set(supply.id, supply);
            this._cleanupSupply(supply);
        }
        console.debug(`${supplyOpts.length} supplies expelled from ship ${shipCfg.id}`);
    }

    private _addSupplyCollisionPhysicsWithPlayers(options: ShipSupplyOptions): ShipSupply {
        let supply: ShipSupply;
        switch(options.supplyType) {
            case 'ammo':
                supply = new AmmoSupply(this, options);
                break;
            case 'coolant':
                supply = new CoolantSupply(this, options);
                break;
            case 'fuel':
                supply = new FuelSupply(this, options);
                break;
            case 'repairs':
                supply = new RepairsSupply(this, options);
                break;
            default:
                console.warn(`unknown supplyType sent to _addSupplyCollisionPhysicsWithPlayers:`, options.supplyType);
                break;
        }
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
                io.to(this.ROOM_NAME).emit(Constants.Socket.REMOVE_SUPPLY, supply.id);
                SpaceSim.suppliesMap.delete(supply.id);
                supply.apply(ship);
                supply.destroy();
            }
        );
        return supply;
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
                io.to(this.ROOM_NAME).emit(Constants.Socket.REMOVE_SUPPLY, supply.id);
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
            io.to(this.ROOM_NAME).emit(Constants.Socket.FLICKER_SUPPLY, (supply.id));
            window.setTimeout(() => {
                SpaceSim.suppliesMap.delete(supply.id);
                supply.destroy();
                io.to(this.ROOM_NAME).emit(Constants.Socket.REMOVE_SUPPLY, (supply.id));
            }, 5000);
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
    private _getShip(socket: Socket, data?: SpaceSimPlayerData): Ship {
        let id = this._socketToShipId.get(socket.id);
        if (!id) {
            // possible disconnect and reconnect with new socket.id
            id = this._reconnect(socket.id, data);
            if (id) {
                socket.emit(Constants.Socket.SET_PLAYER_ID, id);
            }
        }
        if (!id) {
            // force player to restart (possibly their ship was destroyed while disconnected)
            socket.emit(Constants.Socket.PLAYER_DEATH);
        }
        let ship: Ship;
        if (id) {
            ship = SpaceSim.playersMap.get(id);
        }
        return ship;
    }

    /**
     * attempts to lookup a disconnected ship by `fingerprint` and `name` and
     * associates it with the passed in `socket.id` if a match is found. this
     * allows clients who experienced a disconnect event and reconnected with a 
     * new `socket.id` to reconnect to their ship (though only if within 10 seconds
     * of disconnect)
     * @param newSocketId a socket.id `Socket` connection with a client
     * @param data a `SpaceSimPlayerData` object sent from the client
     * @returns a `ship.id` if reconnected otherwise null
     */
    private _reconnect(newSocketId: string, data: SpaceSimPlayerData): string {
        if (newSocketId && data) {
            console.debug(`attempting to reconnect socket ${newSocketId} using data ${JSON.stringify(data)}`);
            Helpers.trycatch(() => {
                const d = {...data, name: Helpers.sanitise(data?.name)};
                const ship = SpaceSim.players()
                    .find(p => p.fingerprint === d.fingerprint 
                        && p.name === d?.name);
                if (ship) {
                    const timer = this._disconnectTimers.get(ship.id);
                    window.clearTimeout(timer);
                    this._disconnectTimers.delete(ship.id);
                    console.debug(`associating socket ${newSocketId} to ship ${ship.id}`);
                    this._socketToShipId.set(newSocketId, ship.id);
                    return ship.id;
                } else {
                    console.debug(`no existing ship found for socket ${newSocketId} and data ${JSON.stringify(data)}`);
                }
            }, 'warn', 'error reconnecting:');
        }
        return null; // unable to reconnect
    }

    private _cleanup(): void {
        this._removeSocketsFromRoomWhoAreNotInMultiplayerGame();
        this._removeSocketToShipMappingForNonexistingShips();
    }

    private _removeSocketsFromRoomWhoAreNotInMultiplayerGame(): void {
        const sockets = Array.from(io.sockets.sockets.values())
            .filter(s => s.rooms.has(this.ROOM_NAME));
        if (sockets?.length) {
            for (let socket of sockets) {
                if (!this._socketToShipId.has(socket.id)) {
                    console.debug(`removing socket: '${socket.id}' from room: ${this.ROOM_NAME}`)
                    socket.leave(this.ROOM_NAME);
                }
            }
        }
    }

    private _removeSocketToShipMappingForNonexistingShips(): void {
        const shipids = Array.from(this._socketToShipId.values());
        if (shipids?.length) {
            for (let shipid of shipids) {
                if (!SpaceSim.playersMap.has(shipid)) {
                    const socketids = Helpers.getMapKeysByValue(this._socketToShipId, shipid);
                    for (let socketid of socketids) {
                        console.debug(`removing socketToShipId mapping for socket: '${socketid}'`);
                        this._socketToShipId.delete(socketid);
                    }
                }
            }
        }
    }
}