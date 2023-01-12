import { GameLevel } from "../levels/game-level";
import { Ship } from "../ships/ship";
import { ShipSupply } from "../ships/supplies/ship-supply";

export abstract class BaseScene extends Phaser.Scene {
    abstract getLevel<T extends GameLevel>(): T;
    abstract getShipsMap<T extends Ship>(): Map<string, T>;
    abstract getShips<T extends Ship>(): Array<T>;
    abstract getSuppliesMap<T extends ShipSupply>(): Map<string, T>;
    abstract getSupplies<T extends ShipSupply>(): Array<T>;
}