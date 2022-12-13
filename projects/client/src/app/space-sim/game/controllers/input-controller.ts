import { HasGameObject, Updatable, ShipLike } from "space-sim-server";

export abstract class InputController implements Updatable, HasGameObject<Phaser.GameObjects.Container> {
    readonly id: string;

    private _scene: Phaser.Scene;
    private _ship: ShipLike;
    
    active: boolean;

    constructor(scene: Phaser.Scene, ship?: ShipLike) {
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

    get ship(): ShipLike {
        return this._ship;
    }

    set ship(ship: ShipLike) {
        this._ship = ship;
    }

    abstract update(time: number, delta: number): void;
    abstract getGameObject(): Phaser.GameObjects.Container;
}