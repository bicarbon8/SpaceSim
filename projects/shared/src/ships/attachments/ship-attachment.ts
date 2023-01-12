import { Ship } from "../ship";
import { Updatable } from "../../interfaces/updatable";
import { BaseScene } from "../../scenes/base-scene";

export abstract class ShipAttachment implements Updatable {
    readonly ship: Ship;
    
    active: boolean;
    
    constructor(ship: Ship) {
        this.ship = ship;
        this.active = true;
    }

    get scene(): BaseScene {
        return this.ship.scene;
    }

    abstract update(time: number, delta: number): void;

    abstract trigger(): void;
}