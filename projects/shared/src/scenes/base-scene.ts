import { GameLevel, GameLevelOptions } from "../levels/game-level";
import { Ship, ShipOptions } from "../ships/ship";
import { ShipSupply, ShipSupplyOptions } from "../ships/supplies/ship-supply";

export abstract class BaseScene extends Phaser.Scene {
    abstract getLevel<T extends GameLevel>(): T;
    abstract getShip<T extends Ship>(id: string): T;
    abstract getShips<T extends Ship>(): Array<T>;
    abstract getSupply<T extends ShipSupply>(id: string): T;
    abstract getSupplies<T extends ShipSupply>(): Array<T>;

    abstract queueGameLevelUpdate<T extends GameLevelOptions>(opts: T): BaseScene;
    abstract queueShipUpdates<T extends ShipOptions>(opts: Array<T>): BaseScene;
    abstract queueShipRemoval(...ids: Array<string>): BaseScene;
    abstract queueSupplyUpdates<T extends ShipSupplyOptions>(opts: Array<T>): BaseScene;
    abstract queueSupplyRemoval(...ids: Array<string>): BaseScene;
    abstract queueSupplyFlicker(...ids: Array<string>): BaseScene;
    abstract queueEndScene(): BaseScene;
}