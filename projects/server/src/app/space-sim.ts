import { ShipLike } from "./interfaces/ship-like";
import { GameMap } from "./map/game-map";

export module SpaceSim {
    export const players = new Array<ShipLike>();
    export var game: Phaser.Game;
    export var map: GameMap;
    export var debug: boolean = false;
}