import { GameMap } from "./map/game-map";
import { Ship } from "./ships/ship";
import { ShipSupply } from "./ships/supplies/ship-supply";

export module SpaceSim {
    export const playersMap = new Map<string, Ship>();
    export const players = (): Array<Ship> => {
        return Array.from(SpaceSim.playersMap.values());
    }
    export const suppliesMap = new Map<string, ShipSupply>();
    export const supplies = (): Array<ShipSupply> => {
        return Array.from(SpaceSim.suppliesMap.values());
    }
    export var game: Phaser.Game;
    export var map: GameMap;
    export var debug: boolean = false;
}