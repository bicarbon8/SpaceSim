import { Updatable } from "../interfaces/updatable";

export abstract class InputController implements Updatable {
    readonly id: string;

    private _scene: Phaser.Scene;
    
    active: boolean;

    constructor(scene: Phaser.Scene) {
        this.id = Phaser.Math.RND.uuid();
        this._scene = scene;
        this.active = true;
    }

    get game(): Phaser.Game {
        return this.scene?.game;
    }

    get scene(): Phaser.Scene {
        return this._scene;
    }

    abstract update(time: number, delta: number): void;
}