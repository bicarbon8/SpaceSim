import { Ship } from "../ship";
import { Updatable } from "../../interfaces/updatable";
import { BaseScene } from "../../scenes/base-scene";

export abstract class ShipAttachment implements Updatable {
    public readonly scene: BaseScene;

    private _ship: Ship;
    private _enabled: boolean = false;

    constructor(scene: BaseScene) {
        this.scene = scene;
    }
    
    get ship(): Ship {
        return this._ship;
    }

    setShip(s: Ship): this {
        this._ship = s;
        return this;
    }

    abstract update(time: number, delta: number): void;

    get enabled(): boolean {
        return this._enabled;
    }

    setEnabled(enabled: boolean): void {
        this._enabled = enabled;
    }
}