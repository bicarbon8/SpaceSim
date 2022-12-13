import * as Phaser from "phaser";
import { Server, Socket } from "socket.io";
import { GameMap } from "../map/game-map";
import { Ship } from "../ships/ship";
import { SpaceSimServer } from "../space-sim-server";
import { Constants } from "../utilities/constants";
import { Helpers } from "../utilities/helpers";

declare global {
    interface Window { gameServerReady: () => void; }
}

declare const io: Server;

export class BattleRoyaleScene extends Phaser.Scene {
    private _map: GameMap;
    private readonly _players = new Map<string, Ship>();
    
    preload(): void {
        this.load.image('weapons-1', `assets/sprites/ship-parts/weapons-1.png`);
        this.load.image('weapons-2', `assets/sprites/ship-parts/weapons-2.png`);
        this.load.image('weapons-3', `assets/sprites/ship-parts/weapons-3.png`);
        this.load.image('wings-1', `assets/sprites/ship-parts/wings-1.png`);
        this.load.image('wings-2', `assets/sprites/ship-parts/wings-2.png`);
        this.load.image('wings-3', `assets/sprites/ship-parts/wings-3.png`);
        this.load.image('cockpit-1', `assets/sprites/ship-parts/cockpit-1.png`);
        this.load.image('cockpit-2', `assets/sprites/ship-parts/cockpit-2.png`);
        this.load.image('cockpit-3', `assets/sprites/ship-parts/cockpit-3.png`);
        this.load.image('engine-1', `assets/sprites/ship-parts/engine-1.png`);
        this.load.image('engine-2', `assets/sprites/ship-parts/engine-2.png`);
        this.load.image('engine-3', `assets/sprites/ship-parts/engine-3.png`);
        
        this.load.image('bullet', `assets/sprites/bullet.png`);
        this.load.image('ammo', `assets/sprites/ammo.png`);
        this.load.image('fuel-canister', `assets/sprites/fuel-canister.png`);
        this.load.image('coolant-canister', `assets/sprites/coolant-canister.png`);
        this.load.image('repairs-canister', `assets/sprites/repairs-canister.png`);

        this.load.image('metaltiles', `assets/tiles/metaltiles_lg.png`);
    }

    create(): void {
        this._map = this._createMap();

        window.gameServerReady();
        console.debug('Game Server is ready');
        
        io.on('connection', (socket) => {
            console.debug(`player: ${socket.id} connected`);
            socket.on('disconnect', () => {
                console.debug(`player: ${socket.id} disconnected`);
            }).on(Constants.Socket.REQUEST_MAP, () => {
                this._sendMap(socket);
            }).on(Constants.Socket.REQUEST_PLAYER, () => {
                if (!this._players.has(socket.id)) {
                    const id = socket.id;
                    this._players.set(id, this._createPlayer(id));
                }
                this._sendPlayers(socket);
            });
        });
    }

    update(): void {
        
    }

    private _createMap(): GameMap {
        const map = new GameMap(this, SpaceSimServer.mapOpts);
        return map;
    }

    private _createPlayer(id: string): Ship {
        const room = this._map.getRooms()[0];
        let loc: Phaser.Math.Vector2;
        do {
            loc = Helpers.vector2(Phaser.Math.RND.realInRange(room.left, room.right),
                Phaser.Math.RND.realInRange(room.top, room.bottom));
        } while (this._isEmpty(loc, 100));
        const ship = new Ship({
            scene: this,
            id: id,
            location: loc
        });
        return ship;
    }

    private _sendMap(socket: Socket): void {
        socket.emit(Constants.Socket.UPDATE_MAP, this._map);
    }

    private _sendPlayers(socket: Socket): void {
        socket.emit(Constants.Socket.UPDATE_PLAYERS, this._players);
    }

    private _isEmpty(location: Phaser.Types.Math.Vector2Like, radius: number): boolean {
        const circleA = new Phaser.Geom.Circle(location.x, location.y, radius);

        // ensure within walls of room
        const tiles: Array<Phaser.Tilemaps.Tile> = this._map.getLayer().getTilesWithinShape(circleA);
        if (tiles?.length > 0) {
            return false;
        }

        // ensure space not occupied by other player(s)
        const players = Array.from(this._players.values());
        for (var i=0; i<players.length; i++) {
            const p = players[i];
            const loc = p.getLocation();
            const circleB = new Phaser.Geom.Circle(loc.x, loc.y, p.getGameObject().width / 2)
            const occupied = Phaser.Geom.Intersects.CircleToCircle(circleA, circleB);
            if (occupied) {
                return false;
            }
        }
        return true;
    }
}