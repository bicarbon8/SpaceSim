import { GameLevel, GameLevelOptions } from "../levels/game-level";
import { Ship, ShipOptions } from "../ships/ship";
import { ShipSupply, ShipSupplyOptions } from "../ships/supplies/ship-supply";

export abstract class BaseScene extends Phaser.Scene {
    abstract getLevel<T extends GameLevel>(): T;
    abstract setLevel<T extends GameLevelOptions>(opts: T): BaseScene;
    abstract getShipsMap<T extends Ship>(): Map<string, T>;
    abstract getShips<T extends Ship>(): Array<T>;
    abstract updateShips<T extends ShipOptions>(opts: Array<T>): BaseScene;
    abstract removeShips(...ids: Array<string>): BaseScene;
    abstract getSuppliesMap<T extends ShipSupply>(): Map<string, T>;
    abstract getSupplies<T extends ShipSupply>(): Array<T>;
    abstract updateSupplies<T extends ShipSupplyOptions>(opts: Array<T>): BaseScene;
    abstract removeSupplies(...ids: Array<string>): BaseScene;
    abstract flickerSupplies(...ids: Array<string>): BaseScene;
    abstract endScene(): BaseScene;
}