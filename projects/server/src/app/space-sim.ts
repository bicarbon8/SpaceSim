import { Server } from "socket.io";
import { GameMap } from "./map/game-map";
import { Ship } from "./ships/ship";

export module SpaceSim {
    export const playersMap = new Map<string, Ship>();
    export const players = (): Array<Ship> => {
        return Array.from(SpaceSim.playersMap.values());
    }
    export var game: Phaser.Game;
    export var io: Server;
    export var map: GameMap;
    export var debug: boolean = false;
}