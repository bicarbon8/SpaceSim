import * as Phaser from "phaser";
import { Server, Socket } from "socket.io";
import { GameMap } from "../map/game-map";
import { Ship } from "../ships/ship";
import { SpaceSim } from "../space-sim";
import { SpaceSimServer } from "../space-sim-server";
import { Constants } from "../utilities/constants";
import { Helpers } from "../utilities/helpers";

declare global {
    interface Window { gameServerReady: () => void; }
}

declare const io: Server;

export class BattleRoyaleScene extends Phaser.Scene {
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

        window.gameServerReady();
        console.debug('Game Server is ready');

        this._setupSocketEventHandling();
    }

    update(time: number, delta: number): void {
        try {
            SpaceSim.players().forEach(ship => ship?.update(time, delta));
            this._sendPlayers();
        } catch (e) {
            console.error(`error in update: `, e);
        }
    }

    private _setupSocketEventHandling(): void {
        io.on('connection', (socket: Socket) => {
            console.debug(`player: ${socket.id} connected`);
            socket.on('disconnect', () => {
                console.debug(`player: ${socket.id} disconnected`);
                this._removePlayer(socket.id);
            }).on(Constants.Socket.REQUEST_MAP, () => {
                console.debug(`received map request from: ${socket.id}`);
                this._sendMap(socket);
            }).on(Constants.Socket.REQUEST_PLAYER, () => {
                console.debug(`received new player request from: ${socket.id}`);
                if (!SpaceSim.playersMap.has(socket.id)) {
                    this._createPlayer(socket.id);
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
            }).on(Constants.Socket.SET_ANGLE, (degrees: number) => {
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
                    socket.broadcast.emit(Constants.Socket.PLAYER_DEATH, ship.id);
                    SpaceSim.playersMap.delete(ship.id);
                    ship.getGameObject()?.destroy();
                }
            });
        });
    }

    private _createMap(): void {
        const map = new GameMap(this, SpaceSimServer.mapOpts);
        SpaceSim.map = map;
    }

    private _createPlayer(id: string): Ship {
        const room = SpaceSim.map.getRooms()[0];
        const topleft: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.left, room.top);
        const botright: Phaser.Math.Vector2 = SpaceSim.map.getMapTileWorldLocation(room.right, room.bottom);
        let loc: Phaser.Math.Vector2;
        do {
            let x = Phaser.Math.RND.realInRange(topleft.x, botright.x);
            let y = Phaser.Math.RND.realInRange(topleft.y, botright.y);
            loc = Helpers.vector2(x, y);
        } while (this._isEmpty(loc, 100));
        const ship = new Ship(this, {
            id: id,
            location: loc
        });
        this.physics.add.collider(ship.getGameObject(), SpaceSim.map.getGameObject());
        this.physics.add.collider(ship.getGameObject(), SpaceSim.players().map(p => p?.getGameObject()));
        console.debug(`adding ship: `, ship.config);
        SpaceSim.playersMap.set(id, ship);
        return ship;
    }

    private _removePlayer(id: string): void {
        if (SpaceSim.playersMap.has(id)) {
            const player = SpaceSim.playersMap.get(id);
            SpaceSim.playersMap.delete(id);
            console.debug(`removing ship: `, player.config);
            player?.destroy();
            io.emit(Constants.Socket.PLAYER_DEATH, id);
        }
    }

    private _sendMap(socket: Socket): void {
        socket.emit(Constants.Socket.UPDATE_MAP, SpaceSimServer.mapOpts);
    }

    private _sendPlayers(): void {
        io.emit(Constants.Socket.UPDATE_PLAYERS, SpaceSim.players().map(p => p.config));
    }

    private _isEmpty(location: Phaser.Types.Math.Vector2Like, radius: number): boolean {
        const circleA = new Phaser.Geom.Circle(location.x, location.y, radius);

        // ensure within walls of room
        const tiles: Array<Phaser.Tilemaps.Tile> = SpaceSim.map.getLayer().getTilesWithinShape(circleA)
            ?.filter(t => t.canCollide);
        if (tiles?.length > 0) {
            console.debug(`location ${JSON.stringify(location)} collides with map tiles: `, tiles);
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
}