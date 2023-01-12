import { HasGameObject, Updatable, Ship, BaseScene } from "space-sim-shared";

export abstract class InputController implements Updatable, HasGameObject<Phaser.GameObjects.Container> {
    readonly id: string;

    private _scene: BaseScene;
    private _ship: Ship;
    
    active: boolean;

    constructor(scene: BaseScene, ship?: Ship) {
        this.id = Phaser.Math.RND.uuid();
        this._scene = scene;
        this._ship = ship;
        this.active = true;
    }

    get game(): Phaser.Game {
        return this.scene?.game;
    }

    get scene(): BaseScene {
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

    getRotation(): number {
        return this.getGameObject().angle;
    }

    setRotation(degrees: number): void {
        this.getGameObject().setAngle(degrees);
    }
}