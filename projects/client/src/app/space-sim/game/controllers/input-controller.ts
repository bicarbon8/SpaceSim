import { HasGameObject } from "../interfaces/has-game-object";
import { Updatable } from "../interfaces/updatable";
import { Ship } from "../ships/ship";

export abstract class InputController implements Updatable, HasGameObject<Phaser.GameObjects.Container> {
    readonly id: string;

    private _scene: Phaser.Scene;
    private _ship: Ship;
    
    active: boolean;

    constructor(scene: Phaser.Scene, ship?: Ship) {
        this.id = Phaser.Math.RND.uuid();
        this._scene = scene;
        this._ship = ship;
        this.active = true;
    }

    get game(): Phaser.Game {
        return this.scene?.game;
    }

    get scene(): Phaser.Scene {
        return this._scene;
    }

    get ship(): Ship {
        return this._ship;
    }

    set ship(ship: Ship) {
        this._ship = ship;
    }

    abstract update(time: number, delta: number): void;
    abstract getGameObject(): Phaser.GameObjects.Container;
}