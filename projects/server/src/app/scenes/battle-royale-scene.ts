import * as Phaser from "phaser";
import { Server } from "socket.io";
import { GameMap } from "../map/game-map";
import { GameMapOptions } from "../map/game-map-options";
import { SpaceSimServer } from "../space-sim-server";

declare global {
    interface Window { gameServerReady: () => void; }
}

declare const io: Server;

export class BattleRoyaleScene extends Phaser.Scene {
    private _map: GameMap;

    get map(): GameMap {
        return this._map;
    }
    
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
        this._createMap();
        window.gameServerReady();
        console.debug('Game Server is ready');
        io.on('connection', (socket) => {
            console.debug('a user connected');
            socket.on('disconnect', () => {
                console.debug('user disconnected');
            });
        });
    }

    update(): void {

    }

    private _createMap(): void {
        this._map = new GameMap(this, SpaceSimServer.mapOpts);
    }
}